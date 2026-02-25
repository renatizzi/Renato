import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "@/App";
import { useLanguage } from "@/i18n";
import { toast } from "sonner";
import { format } from "date-fns";
import { it, enGB } from "date-fns/locale";
import { Printer, FileSpreadsheet, CheckSquare, Square, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const PrintPage = () => {
  const { t, language } = useLanguage();
  const [boxes, setBoxes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedBoxes, setSelectedBoxes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [boxesRes, categoriesRes] = await Promise.all([
        axios.get(`${API}/boxes`),
        axios.get(`${API}/categories`)
      ]);
      setBoxes(boxesRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : "-";
  };

  const toggleBox = (boxId) => {
    setSelectedBoxes(prev => prev.includes(boxId) ? prev.filter(id => id !== boxId) : [...prev, boxId]);
  };

  const selectAll = () => setSelectedBoxes(boxes.map(b => b.id));
  const deselectAll = () => setSelectedBoxes([]);

  const handlePrint = () => window.print();

  const handleExportCSV = async () => {
    try {
      const params = selectedBoxes.length > 0 ? { box_ids: selectedBoxes.join(",") } : {};
      const response = await axios.get(`${API}/export/csv`, { params, responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'boxmanager_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(t('success'));
    } catch (error) {
      toast.error(t('error'));
    }
  };

  const formatDate = (dateStr) => {
    try {
      const locale = language === 'en' ? enGB : it;
      return format(new Date(dateStr), "dd/MM/yyyy HH:mm", { locale });
    } catch {
      return dateStr;
    }
  };

  const boxesToPrint = selectedBoxes.length > 0 ? boxes.filter(b => selectedBoxes.includes(b.id)) : boxes;
  const totalItems = boxesToPrint.reduce((acc, box) => acc + (box.items?.length || 0), 0);

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
                ? `${boxes.length} ${t('containers')}, ${totalItems} ${t('items')}`
                : `${selectedBoxes.length} ${t('containers')} ${t('selected')}, ${totalItems} ${t('items')}`
              }
            </p>
          </div>
          <Separator className="my-4" />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead className="w-16">#</TableHead>
                <TableHead>{t('containerName')}</TableHead>
                <TableHead className="text-center">{t('items')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {boxes.map(box => (
                <TableRow key={box.id} className="cursor-pointer" onClick={() => toggleBox(box.id)} data-testid={`select-box-${box.box_number}`}>
                  <TableCell>
                    <Checkbox checked={selectedBoxes.includes(box.id)} onCheckedChange={() => toggleBox(box.id)} />
                  </TableCell>
                  <TableCell className="font-mono font-bold">{box.box_number}</TableCell>
                  <TableCell className="font-medium">{box.name}</TableCell>
                  <TableCell className="text-center">{box.items?.length || 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Print Preview */}
      <div className="print-only">
        <h1 className="text-2xl font-bold mb-2">Box Manager - {language === 'en' ? 'Archive Export' : 'Esportazione Archivio'}</h1>
        <p className="text-sm text-gray-500 mb-6">{language === 'en' ? 'Printed on' : 'Stampato il'} {format(new Date(), "dd/MM/yyyy HH:mm")}</p>
      </div>

      {/* Boxes List for Print */}
      <div className="space-y-6">
        {boxesToPrint.map(box => (
          <Card key={box.id} className="border-border/50 bg-card/50 backdrop-blur-sm print:shadow-none print:border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3">
                <Package size={20} className="text-primary" />
                <span className="font-mono">#{box.box_number}</span>
                <span className="font-normal">-</span>
                <span>{box.name}</span>
              </CardTitle>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>{t('containerCategory')}: {getCategoryName(box.category_id)}</span>
                {box.location && <span>{t('containerLocation')}: {box.location}</span>}
                <span>{language === 'en' ? 'Created' : 'Creato'}: {formatDate(box.created_at)}</span>
              </div>
            </CardHeader>
            <CardContent>
              {box.items?.length === 0 ? (
                <p className="text-muted-foreground italic">{t('emptyContainer')}</p>
              ) : (
                <table className="w-full print-table">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 font-medium">{t('itemName')}</th>
                      <th className="text-left py-2 font-medium">{t('itemDescription')}</th>
                      <th className="text-left py-2 font-medium print:hidden md:table-cell">{language === 'en' ? 'Date Added' : 'Data Inserimento'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {box.items.map(item => (
                      <tr key={item.id} className="border-b border-border/50">
                        <td className="py-2 font-medium">{item.name}</td>
                        <td className="py-2 text-muted-foreground">{item.description || "-"}</td>
                        <td className="py-2 text-muted-foreground font-mono text-sm print:hidden md:table-cell">
                          {formatDate(item.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
