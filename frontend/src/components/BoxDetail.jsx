import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API } from "@/App";
import { toast } from "sonner";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { QRCodeSVG } from "qrcode.react";
import { Package, Plus, Trash2, Edit2, ArrowLeft, MapPin, Calendar, Save, QrCode, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Image component with error handling
const ItemImage = ({ url, name, size = "md" }) => {
  const [hasError, setHasError] = useState(false);
  const sizeClasses = size === "lg" ? "w-20 h-20" : "w-16 h-16";
  const iconSize = size === "lg" ? 24 : 20;

  if (hasError || !url) {
    return (
      <div className={`${sizeClasses} rounded-xl bg-muted flex items-center justify-center flex-shrink-0`}>
        <Image className="text-muted-foreground" size={iconSize} />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses} rounded-xl overflow-hidden flex-shrink-0 bg-muted`}>
      <img 
        src={url} 
        alt={name}
        className="w-full h-full object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
};

export const BoxDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [box, setBox] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isEditBoxDialogOpen, setIsEditBoxDialogOpen] = useState(false);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemForm, setItemForm] = useState({ name: "", description: "", image_url: "" });
  const [boxForm, setBoxForm] = useState({ name: "", category_id: "", location: "", box_number: 0 });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [boxRes, categoriesRes] = await Promise.all([
        axios.get(`${API}/boxes/${id}`),
        axios.get(`${API}/categories`)
      ]);
      setBox(boxRes.data);
      setCategories(categoriesRes.data);
      setBoxForm({
        name: boxRes.data.name,
        category_id: boxRes.data.category_id || "",
        location: boxRes.data.location || "",
        box_number: boxRes.data.box_number
      });
    } catch (error) {
      toast.error("Scatola non trovata");
      navigate("/boxes");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await axios.put(`${API}/boxes/${id}/items/${editingItem.id}`, itemForm);
        toast.success("Oggetto modificato");
      } else {
        await axios.post(`${API}/boxes/${id}/items`, itemForm);
        toast.success("Oggetto aggiunto");
      }
      setIsItemDialogOpen(false);
      setEditingItem(null);
      setItemForm({ name: "", description: "", image_url: "" });
      fetchData();
    } catch (error) {
      toast.error("Errore nel salvare l'oggetto");
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await axios.delete(`${API}/boxes/${id}/items/${itemId}`);
      toast.success("Oggetto eliminato");
      fetchData();
    } catch (error) {
      toast.error("Errore nell'eliminazione");
    }
  };

  const handleEditBox = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/boxes/${id}`, boxForm);
      toast.success("Scatola modificata");
      setIsEditBoxDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Errore nella modifica");
    }
  };

  const openEditItemDialog = (item) => {
    setEditingItem(item);
    setItemForm({ 
      name: item.name, 
      description: item.description || "",
      image_url: item.image_url || ""
    });
    setIsItemDialogOpen(true);
  };

  const openNewItemDialog = () => {
    setEditingItem(null);
    setItemForm({ name: "", description: "", image_url: "" });
    setIsItemDialogOpen(true);
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : null;
  };

  const formatDate = (dateStr) => {
    try {
      return format(new Date(dateStr), "d MMM yyyy, HH:mm", { locale: it });
    } catch {
      return dateStr;
    }
  };

  const printQRCode = () => {
    const printWindow = window.open('', '_blank');
    const qrElement = document.getElementById('qr-code-detail');
    if (printWindow && qrElement && box) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code Scatola #${box.box_number}</title>
            <style>
              body { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; font-family: sans-serif; }
              h1 { font-size: 24px; margin-bottom: 20px; }
              .box-number { font-size: 48px; font-weight: bold; margin-top: 20px; }
            </style>
          </head>
          <body>
            <h1>${box.name}</h1>
            ${qrElement.outerHTML}
            <div class="box-number">#${box.box_number}</div>
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

  if (!box) return null;

  return (
    <div className="space-y-8 animate-slide-in-up" data-testid="box-detail">
      {/* Back Button */}
      <Link to="/boxes" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={18} />
        <span>Torna alle scatole</span>
      </Link>

      {/* Box Header */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="font-mono font-bold text-primary text-xl">#{box.box_number}</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold">{box.name}</h1>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                  {box.location && (
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      <span>{box.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>Creata: {formatDate(box.created_at)}</span>
                  </div>
                  {getCategoryName(box.category_id) && (
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {getCategoryName(box.category_id)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="rounded-full gap-2" data-testid="show-qr-btn">
                    <QrCode size={16} />
                    QR Code
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-sm text-center">
                  <DialogHeader>
                    <DialogTitle>QR Code Scatola #{box.box_number}</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="p-4 bg-white rounded-2xl">
                      <QRCodeSVG
                        id="qr-code-detail"
                        value={`Scatola #${box.box_number}`}
                        size={200}
                        level="H"
                      />
                    </div>
                    <p className="text-3xl font-mono font-bold">#{box.box_number}</p>
                    <p className="text-muted-foreground">{box.name}</p>
                    <Button onClick={printQRCode} className="rounded-full w-full">
                      Stampa QR Code
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={isEditBoxDialogOpen} onOpenChange={setIsEditBoxDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="rounded-full gap-2" data-testid="edit-box-details-btn">
                    <Edit2 size={16} />
                    Modifica
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Modifica Scatola</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleEditBox} className="space-y-4">
                    <div>
                      <Label htmlFor="box_number">Numero Scatola</Label>
                      <Input
                        id="box_number"
                        type="number"
                        value={boxForm.box_number}
                        onChange={(e) => setBoxForm({ ...boxForm, box_number: parseInt(e.target.value) })}
                        required
                        min="1"
                        className="mt-1"
                        data-testid="edit-box-number-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_name">Nome</Label>
                      <Input
                        id="edit_name"
                        value={boxForm.name}
                        onChange={(e) => setBoxForm({ ...boxForm, name: e.target.value })}
                        required
                        className="mt-1"
                        data-testid="edit-box-name-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit_category">Categoria</Label>
                      <Select 
                        value={boxForm.category_id} 
                        onValueChange={(val) => setBoxForm({ ...boxForm, category_id: val === "none" ? "" : val })}
                      >
                        <SelectTrigger className="mt-1" data-testid="edit-box-category-select">
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
                      <Label htmlFor="edit_location">Posizione</Label>
                      <Input
                        id="edit_location"
                        value={boxForm.location}
                        onChange={(e) => setBoxForm({ ...boxForm, location: e.target.value })}
                        className="mt-1"
                        data-testid="edit-box-location-input"
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsEditBoxDialogOpen(false)} className="rounded-full">
                        Annulla
                      </Button>
                      <Button type="submit" className="rounded-full" data-testid="save-box-details-btn">
                        <Save size={16} className="mr-2" />
                        Salva
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Contenuto ({box.items?.length || 0} oggetti)</h2>
        <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full btn-bounce gap-2" onClick={openNewItemDialog} data-testid="add-item-btn">
              <Plus size={18} />
              Aggiungi Oggetto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Modifica Oggetto" : "Nuovo Oggetto"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <Label htmlFor="item_name">Nome</Label>
                <Input
                  id="item_name"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="es. Libro di cucina"
                  required
                  className="mt-1"
                  data-testid="item-name-input"
                />
              </div>
              <div>
                <Label htmlFor="item_description">Descrizione (opzionale)</Label>
                <Textarea
                  id="item_description"
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  placeholder="Aggiungi dettagli sull'oggetto..."
                  className="mt-1"
                  rows={3}
                  data-testid="item-description-input"
                />
              </div>
              <div>
                <Label htmlFor="item_image_url">URL Immagine (opzionale)</Label>
                <Input
                  id="item_image_url"
                  value={itemForm.image_url}
                  onChange={(e) => setItemForm({ ...itemForm, image_url: e.target.value })}
                  placeholder="https://esempio.com/immagine.jpg"
                  className="mt-1"
                  data-testid="item-image-url-input"
                />
                {itemForm.image_url && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-border">
                    <img 
                      src={itemForm.image_url} 
                      alt="Anteprima" 
                      className="w-full h-32 object-cover"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsItemDialogOpen(false)} className="rounded-full">
                  Annulla
                </Button>
                <Button type="submit" className="rounded-full" data-testid="save-item-btn">
                  {editingItem ? "Salva" : "Aggiungi"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Items List */}
      {box.items?.length === 0 ? (
        <div className="empty-state py-16">
          <Package className="text-muted-foreground/50 mb-4" size={64} />
          <h3 className="text-xl font-semibold mb-2">Scatola vuota</h3>
          <p className="text-muted-foreground mb-4">Aggiungi il primo oggetto a questa scatola</p>
          <Button className="rounded-full" onClick={openNewItemDialog}>
            <Plus size={18} className="mr-2" />
            Aggiungi Oggetto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {box.items.map((item, index) => (
            <Card 
              key={item.id} 
              className={`border-border/50 bg-card/50 backdrop-blur-sm group stagger-${(index % 5) + 1} opacity-0 animate-slide-in-up`}
              data-testid={`item-card-${item.id}`}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <ItemImage url={item.image_url} name={item.name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{item.name}</h4>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2 font-mono">
                          {formatDate(item.created_at)}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => openEditItemDialog(item)}
                          data-testid={`edit-item-${item.id}`}
                        >
                          <Edit2 size={16} />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`delete-item-${item.id}`}>
                              <Trash2 size={16} className="text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Eliminare l'oggetto?</AlertDialogTitle>
                              <AlertDialogDescription>
                                L'oggetto "{item.name}" verrà eliminato permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-full">Annulla</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteItem(item.id)}
                                className="rounded-full bg-destructive"
                              >
                                Elimina
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
