import { useState, useEffect } from "react";
import apiClient from "@/services/apiClient";
import { API } from "@/App";
import { useLanguage } from "@/i18n";
import { getErrorMessage, getErrorSuggestion } from "@/components/ErrorBoundary";
import { toast } from "sonner";
import { format } from "date-fns";
import { it, enGB } from "date-fns/locale";
import { Printer, FileSpreadsheet, CheckSquare, Square, Package, Filter, Image, MapPin, Calendar, Folders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export const PrintPage = () => {
  const { t, language } = useLanguage();
  const [boxes, setBoxes] = useState([]);
  const [filteredBoxes, setFilteredBoxes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedBoxes, setSelectedBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);
  
  // Filters state
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterContainer, setFilterContainer] = useState("");
  const [filterItem, setFilterItem] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [boxes, filterLocation, filterCategory, filterContainer, filterItem]);

  const fetchData = async () => {
    try {
      const [boxesRes, categoriesRes, locationsRes] = await Promise.all([
        apiClient.get(`${API}/boxes`),
        apiClient.get(`${API}/categories`),
        apiClient.get(`${API}/boxes/locations`)
      ]);
      setBoxes(boxesRes.data);
      setCategories(categoriesRes.data);
      setLocations(locationsRes.data);
    } catch (error) {
      toast.error(getErrorMessage(error, language), { description: getErrorSuggestion(error, language) });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...boxes];
    
    // Filter by location
    if (filterLocation !== "all") {
      result = result.filter(box => box.location === filterLocation);
    }
    
    // Filter by category
    if (filterCategory !== "all") {
      result = result.filter(box => box.category_id === filterCategory);
    }
    
    // Filter by container name
    if (filterContainer.trim()) {
      const search = filterContainer.toLowerCase();
      result = result.filter(box => 
        box.name.toLowerCase().includes(search) || 
        String(box.box_number).includes(search)
      );
    }
    
    // Filter by item name
    if (filterItem.trim()) {
      const search = filterItem.toLowerCase();
      result = result.filter(box => 
        box.items?.some(item => 
          item.name.toLowerCase().includes(search) || 
          item.description?.toLowerCase().includes(search)
        )
      );
    }
    
    setFilteredBoxes(result);
  };

  const clearFilters = () => {
    setFilterLocation("all");
    setFilterCategory("all");
    setFilterContainer("");
    setFilterItem("");
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : "-";
  };

  const toggleBox = (boxId) => {
    setSelectedBoxes(prev => prev.includes(boxId) ? prev.filter(id => id !== boxId) : [...prev, boxId]);
  };

  const selectAll = () => setSelectedBoxes(filteredBoxes.map(b => b.id));
  const deselectAll = () => setSelectedBoxes([]);

  // Helper: save file with Save As dialog when available
  const saveFile = async (blob, suggestedName, fileType) => {
    if (window.showSaveFilePicker) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName,
          types: [fileType],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return true;
      } catch (err) {
        if (err.name === 'AbortError') return false;
      }
    }
    // Fallback: standard download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = suggestedName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 1000);
    return true;
  };

  const handlePrint = () => {
    const printData = boxesToPrint;
    const dateStr = format(new Date(), "dd/MM/yyyy HH:mm");
    const totalItemsCount = printData.reduce((acc, box) => acc + (box.items?.length || 0), 0);

    // Build print-ready HTML content
    let itemsHtml = '';
    printData.forEach(box => {
      const catName = getCategoryName(box.category_id);
      let boxItems = '';
      if (box.items?.length > 0) {
        box.items.forEach(item => {
          const imgTag = item.image_data
            ? `<img src="${item.image_data}" style="width:48px;height:48px;object-fit:cover;border-radius:6px;" />`
            : `<div style="width:48px;height:48px;background:#eee;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#999;font-size:12px;">-</div>`;
          boxItems += `
            <tr>
              <td style="padding:6px;border-bottom:1px solid #eee;vertical-align:top;">${imgTag}</td>
              <td style="padding:6px;border-bottom:1px solid #eee;">
                <strong>${item.name}</strong>
                ${item.description ? `<br/><span style="color:#666;font-size:12px;">${item.description}</span>` : ''}
              </td>
              <td style="padding:6px;border-bottom:1px solid #eee;color:#666;font-size:12px;">${formatDate(item.created_at)}</td>
            </tr>`;
        });
      } else {
        boxItems = `<tr><td colspan="3" style="padding:10px;color:#999;font-style:italic;">${t('emptyContainer')}</td></tr>`;
      }

      itemsHtml += `
        <div style="margin-bottom:20px;page-break-inside:avoid;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
          <div style="background:#f7f7f7;padding:10px 14px;border-bottom:1px solid #ddd;">
            <strong style="font-size:15px;">#${box.box_number} - ${box.name}</strong>
            <div style="font-size:12px;color:#666;margin-top:4px;">
              ${language === 'en' ? 'Category' : 'Categoria'}: ${catName}
              ${box.location ? ` | ${language === 'en' ? 'Location' : 'Posizione'}: ${box.location}` : ''}
              | ${language === 'en' ? 'Items' : 'Oggetti'}: ${box.items?.length || 0}
            </div>
          </div>
          <table style="width:100%;border-collapse:collapse;">
            ${boxItems}
          </table>
        </div>`;
    });

    const printHtml = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8" />
<title>Box Manager - ${language === 'en' ? 'Print' : 'Stampa'}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 20px; color: #333; }
  h1 { font-size: 20px; margin-bottom: 4px; }
  .subtitle { font-size: 13px; color: #666; margin-bottom: 16px; }
  @media print { body { margin: 10px; } }
</style>
</head><body>
<h1>Box Manager - ${language === 'en' ? 'Archive Export' : 'Esportazione Archivio'}</h1>
<p class="subtitle">${language === 'en' ? 'Printed on' : 'Stampato il'} ${dateStr} | ${printData.length} ${t('containers')}, ${totalItemsCount} ${t('items')}</p>
${itemsHtml}
</body></html>`;

    const printWin = window.open('', '_blank', 'width=900,height=700');
    if (printWin) {
      printWin.document.write(printHtml);
      printWin.document.close();
      // Wait for images to load before printing
      printWin.onload = () => {
        printWin.focus();
        printWin.print();
      };
      // Fallback if onload doesn't fire
      setTimeout(() => {
        printWin.focus();
        printWin.print();
      }, 1500);
    } else {
      toast.error(language === 'en' ? 'Pop-up blocked. Please allow pop-ups for this site.' : 'Pop-up bloccato. Consenti i pop-up per questo sito.');
    }
  };

  const handleExportCSV = async () => {
    try {
      const boxIds = selectedBoxes.length > 0 ? selectedBoxes : filteredBoxes.map(b => b.id);
      const params = { box_ids: boxIds.join(",") };
      const response = await apiClient.get(`${API}/export/csv`, { params, responseType: 'blob' });

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const suggestedName = `boxmanager_export_${format(new Date(), 'yyyyMMdd')}.csv`;

      const saved = await saveFile(blob, suggestedName, {
        description: 'CSV File',
        accept: { 'text/csv': ['.csv'] },
      });

      if (saved) {
        toast.success(language === 'en' ? 'CSV exported successfully' : 'CSV esportato con successo');
      }
    } catch (error) {
      toast.error(getErrorMessage(error, language), { description: getErrorSuggestion(error, language) });
    }
  };

  const formatDate = (dateStr) => {
    try {
      const locale = language === 'en' ? enGB : it;
      return format(new Date(dateStr), "dd/MM/yyyy HH:mm", { locale });
    } catch {
      return dateStr || "-";
    }
  };

  const boxesToPrint = selectedBoxes.length > 0 ? filteredBoxes.filter(b => selectedBoxes.includes(b.id)) : filteredBoxes;
  const totalItems = boxesToPrint.reduce((acc, box) => acc + (box.items?.length || 0), 0);
  const hasActiveFilters = filterLocation !== "all" || filterCategory !== "all" || filterContainer.trim() || filterItem.trim();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in-up" data-testid="print-page">
      {/* Header - no-print */}
      <div className="no-print flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{t('printTitle')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('printDesc')}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-full gap-2" onClick={handleExportCSV} data-testid="export-csv-btn">
            <FileSpreadsheet size={18} />
            {t('exportCSV')}
          </Button>
          <Button className="rounded-full gap-2 btn-bounce" onClick={handlePrint} data-testid="print-btn">
            <Printer size={18} />
            {t('print')}
          </Button>
        </div>
      </div>

      {/* Filters Section - no-print */}
      <Card className="no-print border-border/50 bg-card/50 backdrop-blur-sm">
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <Filter size={18} />
                  {t('filters')}
                  {hasActiveFilters && (
                    <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                      {language === 'en' ? 'Active' : 'Attivi'}
                    </span>
                  )}
                </div>
                <span className="text-muted-foreground text-sm font-normal">
                  {filtersOpen ? '▲' : '▼'}
                </span>
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Filter: Location */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                    <MapPin size={12} />
                    {t('containerLocation')}
                  </Label>
                  <Select value={filterLocation} onValueChange={setFilterLocation}>
                    <SelectTrigger data-testid="filter-location">
                      <SelectValue placeholder={t('allLocations')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allLocations')}</SelectItem>
                      {locations.map(loc => (
                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Filter: Category */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                    <Folders size={12} />
                    {t('containerCategory')}
                  </Label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger data-testid="filter-category">
                      <SelectValue placeholder={t('allCategories')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allCategories')}</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Filter: Container */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                    <Package size={12} />
                    {t('containerSection')}
                  </Label>
                  <Input
                    value={filterContainer}
                    onChange={(e) => setFilterContainer(e.target.value)}
                    placeholder={language === 'en' ? 'Search container...' : 'Cerca contenitore...'}
                    data-testid="filter-container"
                  />
                </div>
                
                {/* Filter: Item */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                    <Package size={12} />
                    {language === 'en' ? 'Item' : 'Oggetto'}
                  </Label>
                  <Input
                    value={filterItem}
                    onChange={(e) => setFilterItem(e.target.value)}
                    placeholder={language === 'en' ? 'Search item...' : 'Cerca oggetto...'}
                    data-testid="filter-item"
                  />
                </div>
              </div>
              
              {hasActiveFilters && (
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm" className="rounded-full" onClick={clearFilters}>
                    {language === 'en' ? 'Clear filters' : 'Cancella filtri'}
                  </Button>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Selection Controls - no-print */}
      <Card className="no-print border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={selectAll} data-testid="select-all-btn">
                <CheckSquare size={16} />
                {t('selectAll')}
              </Button>
              <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={deselectAll} data-testid="deselect-all-btn">
                <Square size={16} />
                {t('deselectAll')}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedBoxes.length === 0 
                ? `${filteredBoxes.length} ${t('containers')}, ${totalItems} ${t('items')}`
                : `${selectedBoxes.length} ${t('containers')} ${t('selected')}, ${totalItems} ${t('items')}`
              }
            </p>
          </div>
          <Separator className="my-4" />
          
          {filteredBoxes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="mx-auto mb-4 opacity-50" size={48} />
              <p>{language === 'en' ? 'No containers match the filters' : 'Nessun contenitore corrisponde ai filtri'}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>{t('containerName')}</TableHead>
                  <TableHead className="hidden md:table-cell">{t('containerCategory')}</TableHead>
                  <TableHead className="hidden md:table-cell">{t('containerLocation')}</TableHead>
                  <TableHead className="text-center">{t('items')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBoxes.map(box => (
                  <TableRow key={box.id} className="cursor-pointer" onClick={() => toggleBox(box.id)} data-testid={`select-box-${box.box_number}`}>
                    <TableCell>
                      <Checkbox checked={selectedBoxes.includes(box.id)} onCheckedChange={() => toggleBox(box.id)} />
                    </TableCell>
                    <TableCell className="font-mono font-bold">{box.box_number}</TableCell>
                    <TableCell className="font-medium">{box.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{getCategoryName(box.category_id)}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{box.location || "-"}</TableCell>
                    <TableCell className="text-center">{box.items?.length || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Print Preview Header */}
      <div className="print-only">
        <h1 className="text-2xl font-bold mb-2">Box Manager - {language === 'en' ? 'Archive Export' : 'Esportazione Archivio'}</h1>
        <p className="text-sm text-gray-500 mb-2">{language === 'en' ? 'Printed on' : 'Stampato il'} {format(new Date(), "dd/MM/yyyy HH:mm")}</p>
        <p className="text-sm font-medium mb-6">
          {boxesToPrint.length} {t('containers')}, {totalItems} {t('items')}
        </p>
      </div>

      {/* Boxes List for Print - Enhanced output with all fields (A9) */}
      <div className="space-y-6">
        {boxesToPrint.map(box => (
          <Card key={box.id} className="border-border/50 bg-card/50 backdrop-blur-sm print:shadow-none print:border print:break-inside-avoid">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3">
                <Package size={20} className="text-primary" />
                <span className="font-mono">#{box.box_number}</span>
                <span className="font-normal">-</span>
                <span>{box.name}</span>
              </CardTitle>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Folders size={14} />
                  {t('containerCategory')}: {getCategoryName(box.category_id)}
                </span>
                {box.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {t('containerLocation')}: {box.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {language === 'en' ? 'Last modified' : 'Ultima modifica'}: {formatDate(box.updated_at || box.created_at)}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {box.items?.length === 0 ? (
                <p className="text-muted-foreground italic">{t('emptyContainer')}</p>
              ) : (
                <div className="space-y-3">
                  {box.items.map(item => (
                    <div key={item.id} className="flex gap-3 p-3 rounded-lg bg-muted/30 print:bg-gray-50 print:border">
                      {/* Item thumbnail */}
                      {item.image_data ? (
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted print:w-12 print:h-12">
                          <img src={item.image_data} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 print:w-12 print:h-12">
                          <Image size={20} className="text-muted-foreground" />
                        </div>
                      )}
                      
                      {/* Item details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold">{item.name}</h4>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Calendar size={12} />
                          {language === 'en' ? 'Added' : 'Aggiunto'}: {formatDate(item.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
