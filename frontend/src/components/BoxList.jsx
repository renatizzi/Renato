import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API } from "@/App";
import { useLanguage } from "@/i18n";
import { toast } from "sonner";
import { format } from "date-fns";
import { it, enGB } from "date-fns/locale";
import { Package, Plus, Trash2, Edit2, MapPin, ArrowRight, QrCode, Calendar } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export const BoxList = () => {
  const { t, language } = useLanguage();
  const [boxes, setBoxes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [selectedBoxForQR, setSelectedBoxForQR] = useState(null);
  const [editingBox, setEditingBox] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [formData, setFormData] = useState({ name: "", category_id: "", location: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [boxesRes, categoriesRes, locationsRes] = await Promise.all([
        axios.get(`${API}/boxes`),
        axios.get(`${API}/categories`),
        axios.get(`${API}/boxes/locations`)
      ]);
      setBoxes(boxesRes.data);
      const locale = language === 'en' ? 'en' : 'it';
      setCategories(categoriesRes.data.sort((a, b) => a.name.localeCompare(b.name, locale)));
      setLocations(locationsRes.data);
    } catch (error) {
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredBoxes = async () => {
    try {
      const params = {};
      if (filterCategory !== "all") params.category_id = filterCategory;
      if (filterLocation !== "all") params.location = filterLocation;
      
      const response = await axios.get(`${API}/boxes`, { params });
      setBoxes(response.data);
    } catch (error) {
      toast.error("Errore nel filtro");
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchFilteredBoxes();
    }
  }, [filterCategory, filterLocation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBox) {
        await axios.put(`${API}/boxes/${editingBox.id}`, formData);
        toast.success(t('success'));
      } else {
        await axios.post(`${API}/boxes`, formData);
        toast.success(t('success'));
      }
      setIsDialogOpen(false);
      setEditingBox(null);
      setFormData({ name: "", category_id: "", location: "" });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('error'));
    }
  };

  const handleDelete = async (boxId) => {
    try {
      await axios.delete(`${API}/boxes/${boxId}`);
      toast.success(t('success'));
      fetchData();
    } catch (error) {
      toast.error(t('error'));
    }
  };

  const openEditDialog = (box, e) => {
    if (e) e.stopPropagation();
    setEditingBox(box);
    setFormData({
      name: box.name,
      category_id: box.category_id || "",
      location: box.location || ""
    });
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingBox(null);
    setFormData({ name: "", category_id: "", location: "" });
    setIsDialogOpen(true);
  };

  const openQRDialog = (box, e) => {
    if (e) e.stopPropagation();
    setSelectedBoxForQR(box);
    setIsQRDialogOpen(true);
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : null;
  };

  const formatDate = (dateStr) => {
    try {
      const locale = language === 'en' ? enGB : it;
      return format(new Date(dateStr), "d MMM yyyy", { locale });
    } catch {
      return "-";
    }
  };

  const printQRCode = () => {
    const printWindow = window.open('', '_blank');
    const qrElement = document.getElementById('qr-code-print');
    if (printWindow && qrElement) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code Contenitore #${selectedBoxForQR?.box_number}</title>
            <style>
              body { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; font-family: sans-serif; }
              h1 { font-size: 24px; margin-bottom: 20px; }
              .box-number { font-size: 48px; font-weight: bold; margin-top: 20px; }
            </style>
          </head>
          <body>
            <h1>${selectedBoxForQR?.name}</h1>
            ${qrElement.outerHTML}
            <div class="box-number">#${selectedBoxForQR?.box_number}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDialogChange = (open) => {
    if (!open && formData.name && formData.name !== editingBox?.name) {
      const confirmMsg = language === 'en' ? "Close? Data will be lost." : "Sei sicuro di voler chiudere? I dati inseriti andranno persi.";
      if (!window.confirm(confirmMsg)) {
        return;
      }
    }
    setIsDialogOpen(open);
    if (!open) {
      setEditingBox(null);
      setFormData({ name: "", category_id: "", location: "" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in-up" data-testid="box-list">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{t('containersTitle')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('containersDesc')}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button className="rounded-full btn-bounce gap-2" onClick={openNewDialog} data-testid="new-box-btn">
              <Plus size={18} />
              {t('newContainer')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>{editingBox ? t('editContainer') : t('newContainer')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">{t('containerName')}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('containerNamePlaceholder')}
                  required
                  className="mt-1"
                  data-testid="box-name-input"
                />
              </div>
              <div>
                <Label htmlFor="category">{t('containerCategory')}</Label>
                <Select 
                  value={formData.category_id} 
                  onValueChange={(val) => setFormData({ ...formData, category_id: val === "none" ? "" : val })}
                >
                  <SelectTrigger className="mt-1" data-testid="box-category-select">
                    <SelectValue placeholder={t('selectCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('noCategory')}</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">{t('containerLocation')}</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder={t('containerLocationPlaceholder')}
                  className="mt-1"
                  data-testid="box-location-input"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => handleDialogChange(false)} className="rounded-full">
                  {t('cancel')}
                </Button>
                <Button type="submit" className="rounded-full" data-testid="save-box-btn">
                  {editingBox ? t('save') : t('create')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1 block">{t('containerCategory')}</Label>
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
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1 block">{t('containerLocation')}</Label>
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
          </div>
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
        <DialogContent className="sm:max-w-sm text-center">
          <DialogHeader>
            <DialogTitle>QR Code Contenitore #{selectedBoxForQR?.box_number}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="p-4 bg-white rounded-2xl">
              <QRCodeSVG
                id="qr-code-print"
                value={`Contenitore #${selectedBoxForQR?.box_number}`}
                size={200}
                level="H"
              />
            </div>
            <p className="text-3xl font-mono font-bold">#{selectedBoxForQR?.box_number}</p>
            <p className="text-muted-foreground">{selectedBoxForQR?.name}</p>
            <Button onClick={printQRCode} className="rounded-full w-full">
              Stampa QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Box List - Updated layout matching fig2 */}
      {boxes.length === 0 ? (
        <div className="empty-state py-16">
          <Package className="text-muted-foreground/50 mb-4" size={64} />
          <h3 className="text-xl font-semibold mb-2">{t('noContainers')}</h3>
          <p className="text-muted-foreground mb-4">{t('createFirstContainer')}</p>
          <Button className="rounded-full" onClick={openNewDialog}>
            <Plus size={18} className="mr-2" />
            {t('newContainer')}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {boxes.map((box, index) => (
            <Card 
              key={box.id} 
              className={`border-border/50 bg-card/50 backdrop-blur-sm stagger-${(index % 5) + 1} opacity-0 animate-slide-in-up`}
              data-testid={`box-card-${box.box_number}`}
            >
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Left: Box number badge */}
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-mono font-bold text-primary text-lg">#{box.box_number}</span>
                  </div>
                  
                  {/* Center: Box info - matching fig2 layout */}
                  <div className="flex-1 min-w-0">
                    {/* Line 1: contenitore+categoria (blue) */}
                    <h3 className="text-lg font-semibold text-primary truncate">
                      {box.name}
                      {getCategoryName(box.category_id) && (
                        <span className="text-muted-foreground font-normal"> • {getCategoryName(box.category_id)}</span>
                      )}
                    </h3>
                    
                    {/* Line 2: posizione + data ultima modifica */}
                    <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-muted-foreground">
                      {box.location && (
                        <div className="flex items-center gap-1">
                          <MapPin size={14} className="text-red-500" />
                          <span>{box.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{formatDate(box.updated_at || box.created_at)}</span>
                      </div>
                    </div>
                    
                    {/* Line 3: Totale oggetti */}
                    <div className="flex items-center gap-1 mt-1 text-sm">
                      <span className="text-muted-foreground">Totale oggetti:</span>
                      <span className="font-semibold">{box.items?.length || 0}</span>
                    </div>
                  </div>
                  
                  {/* Right: Action icons */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => openQRDialog(box, e)}
                      data-testid={`qr-box-${box.box_number}`}
                      title="QR Code"
                    >
                      <QrCode size={18} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => openEditDialog(box, e)}
                      data-testid={`edit-box-${box.box_number}`}
                      title="Modifica"
                    >
                      <Edit2 size={18} />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" data-testid={`delete-box-${box.box_number}`} title="Elimina">
                          <Trash2 size={18} className="text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Eliminare il contenitore?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Questa azione è irreversibile. Tutti gli oggetti nel contenitore verranno eliminati.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-full">Annulla</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(box.id)}
                            className="rounded-full bg-destructive"
                          >
                            Elimina
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                
                {/* Footer: View content link */}
                <div className="mt-4 pt-4 border-t border-border/50">
                  <Link 
                    to={`/boxes/${box.id}`} 
                    className="flex items-center justify-between text-sm font-medium text-primary hover:underline"
                  >
                    Visualizza contenuto
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
