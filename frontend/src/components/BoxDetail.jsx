import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API } from "@/App";
import { useLanguage } from "@/i18n";
import { toast } from "sonner";
import { format } from "date-fns";
import { it, enGB } from "date-fns/locale";
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

// Image component with error handling
const ItemImage = ({ url, name, size = "md" }) => {
  const [hasError, setHasError] = useState(false);
  const sizeClasses = size === "lg" ? "w-16 h-16" : size === "sm" ? "w-12 h-12" : "w-14 h-14";
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
const CameraCapture = ({ onCapture, onClose, t }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [isLoading, setIsLoading] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
  };

  const startCamera = async () => {
    setIsLoading(true);
    setError(null);
    setCameraReady(false);
    stopCamera();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError(t('cameraNotSupported'));
      setIsLoading(false);
      return;
    }

    try {
      const constraints = {
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
            .then(() => { setCameraReady(true); setIsLoading(false); })
            .catch(() => { setError(t('cameraError')); setIsLoading(false); });
        };
      }
    } catch (err) {
      let errorMessage = t('cameraError');
      if (err.name === 'NotAllowedError') errorMessage = t('cameraPermissionDenied');
      else if (err.name === 'NotFoundError') errorMessage = t('cameraNotFound');
      else if (err.name === 'NotReadableError') errorMessage = t('cameraInUse');
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [facingMode]);

  const switchCamera = () => setFacingMode(prev => prev === "environment" ? "user" : "environment");

  const takePhoto = () => {
    if (!cameraReady || !videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video.videoWidth === 0) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    setCapturedImage(canvas.toDataURL('image/jpeg', 0.8));
    stopCamera();
  };

  const handleClose = () => { stopCamera(); onClose(); };

  return (
    <div className="space-y-4">
      {error ? (
        <div className="text-center py-8">
          <Camera className="mx-auto mb-4 text-muted-foreground" size={48} />
          <p className="text-destructive mb-2">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={startCamera} className="rounded-full">{t('retry')}</Button>
            <Button onClick={handleClose} variant="outline" className="rounded-full">{t('close')}</Button>
          </div>
        </div>
      ) : capturedImage ? (
        <div className="space-y-4">
          <div className="rounded-xl overflow-hidden bg-black aspect-video">
            <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => { setCapturedImage(null); startCamera(); }} variant="outline" className="flex-1 rounded-full gap-2">
              <RotateCcw size={18} /> {t('newPhoto')}
            </Button>
            <Button onClick={() => onCapture(capturedImage)} className="flex-1 rounded-full gap-2">
              <Save size={18} /> {t('confirmPhoto')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-2">
            <Button onClick={switchCamera} variant="outline" size="icon" className="rounded-full" disabled={isLoading}>
              <RotateCcw size={18} />
            </Button>
            <Button onClick={takePhoto} className="flex-1 rounded-full gap-2" disabled={!cameraReady}>
              <Camera size={18} /> {cameraReady ? t('takePhoto') : t('waitCamera')}
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
  const { t, language } = useLanguage();
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

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [boxRes, categoriesRes] = await Promise.all([
        axios.get(`${API}/boxes/${id}`),
        axios.get(`${API}/categories`)
      ]);
      setBox(boxRes.data);
      const locale = language === 'en' ? 'en' : 'it';
      setCategories(categoriesRes.data.sort((a, b) => a.name.localeCompare(b.name, locale)));
      setBoxForm({
        name: boxRes.data.name,
        category_id: boxRes.data.category_id || "",
        location: boxRes.data.location || "",
        box_number: boxRes.data.box_number
      });
    } catch (error) {
      toast.error(t('error'));
      navigate("/boxes");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const payload = { name: itemForm.name, description: itemForm.description, image_data: itemForm.image_data || "" };
      if (editingItem) {
        await axios.put(`${API}/boxes/${id}/items/${editingItem.id}`, payload);
        toast.success(t('success'));
      } else {
        await axios.post(`${API}/boxes/${id}/items`, payload);
        toast.success(t('success'));
      }
      setIsItemDialogOpen(false);
      setEditingItem(null);
      setItemForm({ name: "", description: "", image_data: "" });
      fetchData();
    } catch (error) {
      toast.error(t('error'));
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await axios.delete(`${API}/boxes/${id}/items/${itemId}`);
      toast.success(t('success'));
      fetchData();
    } catch (error) {
      toast.error(t('error'));
    }
  };

  const handleEditBox = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/boxes/${id}`, boxForm);
      toast.success(t('success'));
      setIsEditBoxDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('error'));
    }
  };

  const openEditItemDialog = (item, e) => {
    if (e) e.stopPropagation();
    setEditingItem(item);
    setItemForm({ name: item.name, description: item.description || "", image_data: item.image_data || "" });
    setIsItemDialogOpen(true);
  };

  const openNewItemDialog = () => {
    setEditingItem(null);
    setItemForm({ name: "", description: "", image_data: "" });
    setIsItemDialogOpen(true);
  };

  const getCategoryName = (categoryId) => categories.find(c => c.id === categoryId)?.name || null;

  const formatDate = (dateStr) => {
    try {
      const locale = language === 'en' ? enGB : it;
      return format(new Date(dateStr), "d MMM yyyy", { locale });
    }
    catch { return "-"; }
  };

  const printQRCode = () => {
    const printWindow = window.open('', '_blank');
    const qrElement = document.getElementById('qr-code-detail');
    if (printWindow && qrElement && box) {
      printWindow.document.write(`
        <html><head><title>QR Code #${box.box_number}</title>
        <style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;font-family:sans-serif;}
        h1{font-size:24px;margin-bottom:20px;}.box-number{font-size:48px;font-weight:bold;margin-top:20px;}</style></head>
        <body><h1>${box.name}</h1>${qrElement.outerHTML}<div class="box-number">#${box.box_number}</div></body></html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleItemDialogChange = (open) => {
    if (!open && itemForm.name && itemForm.name !== editingItem?.name) {
      const confirmMsg = language === 'en' ? "Close? Data will be lost." : "Chiudere? I dati andranno persi.";
      if (!window.confirm(confirmMsg)) return;
    }
    setIsItemDialogOpen(open);
    if (!open) { setIsCameraOpen(false); setEditingItem(null); setItemForm({ name: "", description: "", image_data: "" }); }
  };

  const handleBoxDialogChange = (open) => {
    if (!open && boxForm.name !== box?.name) {
      const confirmMsg = language === 'en' ? "Close? Data will be lost." : "Chiudere? I dati andranno persi.";
      if (!window.confirm(confirmMsg)) return;
    }
    setIsEditBoxDialogOpen(open);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  if (!box) return null;

  return (
    <div className="space-y-6 animate-slide-in-up" data-testid="box-detail">
      {/* Header - Page title matching fig3 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{t('contentTitle')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('contentDesc')}</p>
        </div>
        <Dialog open={isItemDialogOpen} onOpenChange={handleItemDialogChange}>
          <DialogTrigger asChild>
            <Button className="rounded-full btn-bounce gap-2" onClick={openNewItemDialog} data-testid="add-item-btn">
              <Plus size={18} />
              {t('addItem')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>{editingItem ? t('editItem') : t('newItem')}</DialogTitle>
            </DialogHeader>
            {isCameraOpen ? (
              <CameraCapture 
                t={t}
                onCapture={(img) => { setItemForm({ ...itemForm, image_data: img }); setIsCameraOpen(false); }} 
                onClose={() => setIsCameraOpen(false)}
              />
            ) : (
              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <Label htmlFor="item_name">{t('itemName')}</Label>
                  <Input id="item_name" value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} placeholder={t('itemNamePlaceholder')} required className="mt-1" data-testid="item-name-input" />
                </div>
                <div>
                  <Label htmlFor="item_description">{t('itemDescription')}</Label>
                  <Textarea id="item_description" value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} placeholder={t('itemDescPlaceholder')} className="mt-1" rows={3} data-testid="item-description-input" />
                </div>
                <div>
                  <Label>{t('itemPhoto')}</Label>
                  {itemForm.image_data ? (
                    <div className="mt-2 space-y-2">
                      <div className="relative rounded-xl overflow-hidden border border-border">
                        <img src={itemForm.image_data} alt="Preview" className="w-full h-32 object-cover" />
                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-full" onClick={() => setItemForm({ ...itemForm, image_data: "" })}>
                          <X size={16} />
                        </Button>
                      </div>
                      <Button type="button" variant="outline" className="w-full rounded-full gap-2" onClick={() => setIsCameraOpen(true)}>
                        <Camera size={16} /> {t('newPhoto')}
                      </Button>
                    </div>
                  ) : (
                    <Button type="button" variant="outline" className="w-full mt-2 rounded-full gap-2" onClick={() => setIsCameraOpen(true)} data-testid="open-camera-btn">
                      <Camera size={16} /> {t('takePhoto')}
                    </Button>
                  )}
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => handleItemDialogChange(false)} className="rounded-full">{t('cancel')}</Button>
                  <Button type="submit" className="rounded-full" data-testid="save-item-btn">{editingItem ? t('save') : t('add')}</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Section: Contenitore - matching fig3 */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">{t('containerSection')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Left: Box number */}
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="font-mono font-bold text-primary text-lg">#{box.box_number}</span>
            </div>
            
            {/* Center: Container info */}
            <div className="flex-1 min-w-0">
              {/* Line 1: contenitore+categoria */}
              <h3 className="text-lg font-semibold text-primary truncate">
                {box.name}
                {getCategoryName(box.category_id) && (
                  <span className="text-muted-foreground font-normal"> • {getCategoryName(box.category_id)}</span>
                )}
              </h3>
              
              {/* Line 2: posizione + data */}
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
              <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="show-qr-btn" title="QR Code">
                    <QrCode size={18} />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-sm text-center">
                  <DialogHeader>
                    <DialogTitle>QR Code #{box.box_number}</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="p-4 bg-white rounded-2xl">
                      <QRCodeSVG id="qr-code-detail" value={`Contenitore #${box.box_number}`} size={200} level="H" />
                    </div>
                    <p className="text-3xl font-mono font-bold">#{box.box_number}</p>
                    <p className="text-muted-foreground">{box.name}</p>
                    <Button onClick={printQRCode} className="rounded-full w-full">Stampa QR Code</Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog open={isEditBoxDialogOpen} onOpenChange={handleBoxDialogChange}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="edit-box-details-btn" title="Modifica">
                    <Edit2 size={18} />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
                  <DialogHeader>
                    <DialogTitle>Modifica Contenitore</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleEditBox} className="space-y-4">
                    <div>
                      <Label htmlFor="box_number">Numero</Label>
                      <Input id="box_number" type="number" value={boxForm.box_number} onChange={(e) => setBoxForm({ ...boxForm, box_number: parseInt(e.target.value) })} required min="1" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="edit_name">Nome</Label>
                      <Input id="edit_name" value={boxForm.name} onChange={(e) => setBoxForm({ ...boxForm, name: e.target.value })} required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="edit_category">Categoria</Label>
                      <Select value={boxForm.category_id} onValueChange={(val) => setBoxForm({ ...boxForm, category_id: val === "none" ? "" : val })}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Seleziona categoria" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nessuna categoria</SelectItem>
                          {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit_location">Posizione</Label>
                      <Input id="edit_location" value={boxForm.location} onChange={(e) => setBoxForm({ ...boxForm, location: e.target.value })} className="mt-1" />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => handleBoxDialogChange(false)} className="rounded-full">Annulla</Button>
                      <Button type="submit" className="rounded-full" data-testid="save-box-details-btn"><Save size={16} className="mr-2" />Salva</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" title="Elimina">
                    <Trash2 size={18} className="text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Eliminare il contenitore?</AlertDialogTitle>
                    <AlertDialogDescription>Tutti gli oggetti verranno eliminati permanentemente.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-full">Annulla</AlertDialogCancel>
                    <AlertDialogAction onClick={() => { axios.delete(`${API}/boxes/${id}`).then(() => { toast.success("Eliminato"); navigate("/boxes"); }); }} className="rounded-full bg-destructive">Elimina</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section: Lista Oggetti - matching fig3 */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Lista Oggetti</CardTitle>
        </CardHeader>
        <CardContent>
          {box.items?.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto text-muted-foreground/50 mb-4" size={48} />
              <h3 className="font-semibold mb-2">Contenitore vuoto</h3>
              <p className="text-sm text-muted-foreground mb-4">Aggiungi il primo oggetto</p>
              <Button className="rounded-full" onClick={openNewItemDialog}>
                <Plus size={18} className="mr-2" /> Aggiungi Oggetto
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {box.items.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                  data-testid={`item-card-${item.id}`}
                >
                  {/* Thumbnail */}
                  <ItemImage url={item.image_data} name={item.name} size="lg" />
                  
                  {/* Item info - matching fig3 */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{item.name}</h4>
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(item.created_at)}</p>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" onClick={(e) => openEditItemDialog(item, e)} data-testid={`edit-item-${item.id}`}>
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
                          <AlertDialogDescription>"{item.name}" verrà eliminato permanentemente.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-full">Annulla</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteItem(item.id)} className="rounded-full bg-destructive">Elimina</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
