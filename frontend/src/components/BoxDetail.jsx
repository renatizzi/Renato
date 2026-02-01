import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API } from "@/App";
import { toast } from "sonner";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { QRCodeSVG } from "qrcode.react";
import { Package, Plus, Trash2, Edit2, MapPin, Calendar, Save, QrCode, Image, Camera, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Image component with error handling
const ItemImage = ({ url, name, size = "md" }) => {
  const [hasError, setHasError] = useState(false);
  const sizeClasses = size === "lg" ? "w-20 h-20" : size === "sm" ? "w-12 h-12" : "w-16 h-16";
  const iconSize = size === "lg" ? 24 : size === "sm" ? 16 : 20;

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

// Camera Capture Component
const CameraCapture = ({ onCapture, onClose, currentImage }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [isLoading, setIsLoading] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);

  // Cleanup function
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
  };

  // Start camera
  const startCamera = async () => {
    setIsLoading(true);
    setError(null);
    setCameraReady(false);
    
    // Stop existing stream first
    stopCamera();

    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Il tuo browser non supporta l'accesso alla fotocamera.");
      setIsLoading(false);
      return;
    }

    try {
      const constraints = {
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280, max: 1920 }, 
          height: { ideal: 720, max: 1080 }
        },
        audio: false
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;
      
      // Wait for video element to be ready
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Wait for video to be ready to play
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
            .then(() => {
              setCameraReady(true);
              setIsLoading(false);
            })
            .catch((playErr) => {
              console.error("Video play error:", playErr);
              setError("Errore nell'avvio del video.");
              setIsLoading(false);
            });
        };
      }
    } catch (err) {
      console.error("Camera error:", err);
      let errorMessage = "Impossibile accedere alla fotocamera.";
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = "Permesso fotocamera negato. Abilita l'accesso nelle impostazioni del browser.";
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = "Nessuna fotocamera trovata sul dispositivo.";
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = "La fotocamera è in uso da un'altra applicazione.";
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = "Impostazioni fotocamera non supportate. Riprova.";
      } else if (err.name === 'TypeError') {
        errorMessage = "Errore di configurazione della fotocamera.";
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const switchCamera = () => {
    setFacingMode(prev => prev === "environment" ? "user" : "environment");
  };

  const takePhoto = () => {
    if (!cameraReady || !videoRef.current || !canvasRef.current) {
      toast.error("Fotocamera non pronta. Attendi qualche secondo.");
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Ensure video has dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      toast.error("Video non pronto. Riprova.");
      return;
    }
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    
    // Stop camera after taking photo to save resources
    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="space-y-4">
      {error ? (
        <div className="text-center py-8">
          <Camera className="mx-auto mb-4 text-muted-foreground" size={48} />
          <p className="text-destructive mb-2">{error}</p>
          <p className="text-sm text-muted-foreground mb-4">
            Assicurati di aver concesso i permessi per la fotocamera.
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={startCamera} className="rounded-full">
              Riprova
            </Button>
            <Button onClick={handleClose} variant="outline" className="rounded-full">
              Chiudi
            </Button>
          </div>
        </div>
      ) : capturedImage ? (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
            <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
          </div>
          <div className="flex gap-2">
            <Button onClick={retakePhoto} variant="outline" className="flex-1 rounded-full gap-2">
              <RotateCcw size={18} />
              Nuova foto
            </Button>
            <Button onClick={confirmPhoto} className="flex-1 rounded-full gap-2">
              <Save size={18} />
              Conferma
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <p className="text-white text-sm">Avvio fotocamera...</p>
                </div>
              </div>
            )}
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={switchCamera} 
              variant="outline" 
              size="icon" 
              className="rounded-full"
              disabled={isLoading}
              title="Cambia fotocamera"
            >
              <RotateCcw size={18} />
            </Button>
            <Button 
              onClick={takePhoto} 
              className="flex-1 rounded-full gap-2"
              disabled={!cameraReady}
            >
              <Camera size={18} />
              {cameraReady ? "Scatta foto" : "Attendi..."}
            </Button>
            <Button onClick={handleClose} variant="outline" size="icon" className="rounded-full">
              <X size={18} />
            </Button>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
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
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemForm, setItemForm] = useState({ name: "", description: "", image_data: "" });
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
      setCategories(categoriesRes.data.sort((a, b) => a.name.localeCompare(b.name, 'it')));
      setBoxForm({
        name: boxRes.data.name,
        category_id: boxRes.data.category_id || "",
        location: boxRes.data.location || "",
        box_number: boxRes.data.box_number
      });
    } catch (error) {
      toast.error("Contenitore non trovato");
      navigate("/boxes");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: itemForm.name,
        description: itemForm.description,
        image_data: itemForm.image_data || ""
      };
      
      if (editingItem) {
        await axios.put(`${API}/boxes/${id}/items/${editingItem.id}`, payload);
        toast.success("Oggetto modificato");
      } else {
        await axios.post(`${API}/boxes/${id}/items`, payload);
        toast.success("Oggetto aggiunto");
      }
      setIsItemDialogOpen(false);
      setEditingItem(null);
      setItemForm({ name: "", description: "", image_data: "" });
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
      toast.success("Contenitore modificato");
      setIsEditBoxDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Errore nella modifica");
    }
  };

  const openEditItemDialog = (item, e) => {
    if (e) e.stopPropagation();
    setEditingItem(item);
    setItemForm({ 
      name: item.name, 
      description: item.description || "",
      image_data: item.image_data || ""
    });
    setIsItemDialogOpen(true);
  };

  const openNewItemDialog = () => {
    setEditingItem(null);
    setItemForm({ name: "", description: "", image_data: "" });
    setIsItemDialogOpen(true);
  };

  const handleCameraCapture = (imageData) => {
    setItemForm({ ...itemForm, image_data: imageData });
    setIsCameraOpen(false);
  };

  const removeImage = () => {
    setItemForm({ ...itemForm, image_data: "" });
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
            <title>QR Code Contenitore #${box.box_number}</title>
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

  // Previene chiusura accidentale del dialog
  const handleItemDialogChange = (open) => {
    if (!open && itemForm.name && itemForm.name !== editingItem?.name) {
      if (!window.confirm("Sei sicuro di voler chiudere? I dati inseriti andranno persi.")) {
        return;
      }
    }
    setIsItemDialogOpen(open);
    if (!open) {
      setIsCameraOpen(false);
      setEditingItem(null);
      setItemForm({ name: "", description: "", image_data: "" });
    }
  };

  const handleBoxDialogChange = (open) => {
    if (!open && boxForm.name !== box?.name) {
      if (!window.confirm("Sei sicuro di voler chiudere? I dati inseriti andranno persi.")) {
        return;
      }
    }
    setIsEditBoxDialogOpen(open);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!box) return null;

  const useCompactView = (box.items?.length || 0) > 10;

  return (
    <div className="space-y-8 animate-slide-in-up" data-testid="box-detail">
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
                    <span>Creato: {formatDate(box.created_at)}</span>
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
                    <DialogTitle>QR Code Contenitore #{box.box_number}</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="p-4 bg-white rounded-2xl">
                      <QRCodeSVG
                        id="qr-code-detail"
                        value={`Contenitore #${box.box_number}`}
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
              <Dialog open={isEditBoxDialogOpen} onOpenChange={handleBoxDialogChange}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="rounded-full gap-2" data-testid="edit-box-details-btn">
                    <Edit2 size={16} />
                    Modifica
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
                  <DialogHeader>
                    <DialogTitle>Modifica Contenitore</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleEditBox} className="space-y-4">
                    <div>
                      <Label htmlFor="box_number">Numero Contenitore</Label>
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
                      <Button type="button" variant="outline" onClick={() => handleBoxDialogChange(false)} className="rounded-full">
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

      {/* Items Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Gestione Oggetti</h2>
          <p className="text-sm text-muted-foreground">Crea e organizza gli oggetti dei singoli contenitori (nome oggetto, descrizione, eventuale foto)</p>
        </div>
        <Dialog open={isItemDialogOpen} onOpenChange={handleItemDialogChange}>
          <DialogTrigger asChild>
            <Button className="rounded-full btn-bounce gap-2" onClick={openNewItemDialog} data-testid="add-item-btn">
              <Plus size={18} />
              Aggiungi
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>{editingItem ? "Modifica Oggetto" : "Nuovo Oggetto"}</DialogTitle>
            </DialogHeader>
            {isCameraOpen ? (
              <CameraCapture 
                onCapture={handleCameraCapture} 
                onClose={() => setIsCameraOpen(false)}
                currentImage={itemForm.image_data}
              />
            ) : (
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
                  <Label>Foto (opzionale)</Label>
                  {itemForm.image_data ? (
                    <div className="mt-2 space-y-2">
                      <div className="relative rounded-xl overflow-hidden border border-border">
                        <img 
                          src={itemForm.image_data} 
                          alt="Preview" 
                          className="w-full h-32 object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 rounded-full"
                          onClick={removeImage}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                      <Button 
                        type="button"
                        variant="outline" 
                        className="w-full rounded-full gap-2"
                        onClick={() => setIsCameraOpen(true)}
                      >
                        <Camera size={16} />
                        Scatta nuova foto
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      type="button"
                      variant="outline" 
                      className="w-full mt-2 rounded-full gap-2"
                      onClick={() => setIsCameraOpen(true)}
                      data-testid="open-camera-btn"
                    >
                      <Camera size={16} />
                      Scatta foto
                    </Button>
                  )}
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => handleItemDialogChange(false)} className="rounded-full">
                    Annulla
                  </Button>
                  <Button type="submit" className="rounded-full" data-testid="save-item-btn">
                    {editingItem ? "Salva" : "Aggiungi"}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Items List */}
      {box.items?.length === 0 ? (
        <div className="empty-state py-16">
          <Package className="text-muted-foreground/50 mb-4" size={64} />
          <h3 className="text-xl font-semibold mb-2">Contenitore vuoto</h3>
          <p className="text-muted-foreground mb-4">Aggiungi il primo oggetto a questo contenitore</p>
          <Button className="rounded-full" onClick={openNewItemDialog}>
            <Plus size={18} className="mr-2" />
            Aggiungi Oggetto
          </Button>
        </div>
      ) : useCompactView ? (
        // Vista compatta tabella per > 10 oggetti
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Foto</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">Descrizione</TableHead>
                  <TableHead className="hidden md:table-cell">Data</TableHead>
                  <TableHead className="text-right w-24">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {box.items.map((item) => (
                  <TableRow key={item.id} data-testid={`item-row-${item.id}`}>
                    <TableCell>
                      <ItemImage url={item.image_data} name={item.name} size="sm" />
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground max-w-xs truncate">
                      {item.description || "-"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm font-mono">
                      {formatDate(item.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={(e) => openEditItemDialog(item, e)}>
                          <Edit2 size={16} />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        // Vista griglia per <= 10 oggetti
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {box.items.map((item, index) => (
            <Card 
              key={item.id} 
              className={`border-border/50 bg-card/50 backdrop-blur-sm group stagger-${(index % 5) + 1} opacity-0 animate-slide-in-up`}
              data-testid={`item-card-${item.id}`}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <ItemImage url={item.image_data} name={item.name} size="lg" />
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
                          onClick={(e) => openEditItemDialog(item, e)}
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
