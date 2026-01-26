import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API } from "@/App";
import { toast } from "sonner";
import { Package, Plus, Trash2, Edit2, MapPin, ArrowRight, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export const BoxList = () => {
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
      setCategories(categoriesRes.data);
      setLocations(locationsRes.data);
    } catch (error) {
      toast.error("Errore nel caricamento dati");
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
        toast.success("Contenitore modificato");
      } else {
        await axios.post(`${API}/boxes`, formData);
        toast.success("Contenitore creato");
      }
      setIsDialogOpen(false);
      setEditingBox(null);
      setFormData({ name: "", category_id: "", location: "" });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Errore");
    }
  };

  const handleDelete = async (boxId) => {
    try {
      await axios.delete(`${API}/boxes/${boxId}`);
      toast.success("Contenitore eliminato");
      fetchData();
    } catch (error) {
      toast.error("Errore nell'eliminazione");
    }
  };

  const openEditDialog = (box) => {
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

  const openQRDialog = (box) => {
    setSelectedBoxForQR(box);
    setIsQRDialogOpen(true);
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : null;
  };

  const getCategoryColor = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.color : "#4A6741";
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-in-up" data-testid="box-list">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Contenitori</h1>
          <p className="text-muted-foreground mt-1">{boxes.length} contenitori nel tuo archivio</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full btn-bounce gap-2" onClick={openNewDialog} data-testid="new-box-btn">
              <Plus size={18} />
              Nuovo Contenitore
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingBox ? "Modifica Contenitore" : "Nuovo Contenitore"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="es. Libri Camera"
                  required
                  className="mt-1"
                  data-testid="box-name-input"
                />
              </div>
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select 
                  value={formData.category_id} 
                  onValueChange={(val) => setFormData({ ...formData, category_id: val === "none" ? "" : val })}
                >
                  <SelectTrigger className="mt-1" data-testid="box-category-select">
                    <SelectValue placeholder="Seleziona categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nessuna categoria</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Posizione</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="es. Cantina, Scaffale 3"
                  className="mt-1"
                  data-testid="box-location-input"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-full">
                  Annulla
                </Button>
                <Button type="submit" className="rounded-full" data-testid="save-box-btn">
                  {editingBox ? "Salva" : "Crea"}
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
              <Label className="text-xs text-muted-foreground mb-1 block">Categoria</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger data-testid="filter-category">
                  <SelectValue placeholder="Tutte le categorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le categorie</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1 block">Posizione</Label>
              <Select value={filterLocation} onValueChange={setFilterLocation}>
                <SelectTrigger data-testid="filter-location">
                  <SelectValue placeholder="Tutte le posizioni" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le posizioni</SelectItem>
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

      {/* Box Grid */}
      {boxes.length === 0 ? (
        <div className="empty-state py-16">
          <Package className="text-muted-foreground/50 mb-4" size={64} />
          <h3 className="text-xl font-semibold mb-2">Nessun contenitore</h3>
          <p className="text-muted-foreground mb-4">Crea il tuo primo contenitore per iniziare</p>
          <Button className="rounded-full" onClick={openNewDialog}>
            <Plus size={18} className="mr-2" />
            Nuovo Contenitore
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boxes.map((box, index) => (
            <Card 
              key={box.id} 
              className={`card-hover border-border/50 bg-card/50 backdrop-blur-sm group stagger-${(index % 5) + 1} opacity-0 animate-slide-in-up`}
              data-testid={`box-card-${box.box_number}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <span className="font-mono font-bold text-primary text-lg">#{box.box_number}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => openQRDialog(box)}
                      data-testid={`qr-box-${box.box_number}`}
                    >
                      <QrCode size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => openEditDialog(box)}
                      data-testid={`edit-box-${box.box_number}`}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" data-testid={`delete-box-${box.box_number}`}>
                          <Trash2 size={16} className="text-destructive" />
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
                            data-testid={`confirm-delete-${box.box_number}`}
                          >
                            Elimina
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">{box.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Package size={14} />
                  <span>{box.items?.length || 0} oggetti</span>
                </div>
                {box.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <MapPin size={14} />
                    <span>{box.location}</span>
                  </div>
                )}
                {getCategoryName(box.category_id) && (
                  <div 
                    className="inline-flex px-3 py-1 rounded-full text-xs font-medium mb-4"
                    style={{ 
                      backgroundColor: `${getCategoryColor(box.category_id)}20`,
                      color: getCategoryColor(box.category_id)
                    }}
                  >
                    {getCategoryName(box.category_id)}
                  </div>
                )}
                <Link 
                  to={`/boxes/${box.id}`} 
                  className="flex items-center justify-between pt-4 border-t border-border/50 text-sm font-medium text-primary hover:underline"
                >
                  Visualizza contenuto
                  <ArrowRight size={16} />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
