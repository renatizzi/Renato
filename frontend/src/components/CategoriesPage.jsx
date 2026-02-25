import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "@/App";
import { useLanguage } from "@/i18n";
import { getErrorMessage, getErrorSuggestion } from "@/components/ErrorBoundary";
import { toast } from "sonner";
import { Folders, Plus, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const PRESET_COLORS = [
  "#4A6741", "#D4A373", "#8C9E85", "#E6B89C", "#2C332B",
  "#6B7280", "#EF4444", "#F59E0B", "#10B981", "#3B82F6"
];

export const CategoriesPage = () => {
  const { t, language } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", color: "#4A6741" });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      const locale = language === 'en' ? 'en' : 'it';
      const sorted = response.data.sort((a, b) => a.name.localeCompare(b.name, locale));
      setCategories(sorted);
      
      // Se non ci sono categorie, carica quelle di default
      if (response.data.length === 0) {
        await loadDefaultCategories();
      }
    } catch (error) {
      toast.error(getErrorMessage(error, language), { description: getErrorSuggestion(error, language) });
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultCategories = async () => {
    try {
      const defaultCats = t('defaultCategories');
      const colors = ["#3B82F6", "#F59E0B", "#6B7280", "#2C332B", "#10B981", "#EF4444", "#8C9E85", "#D4A373", "#E6B89C", "#4A6741", "#6B7280"];
      
      for (let i = 0; i < defaultCats.length; i++) {
        await axios.post(`${API}/categories`, { name: defaultCats[i], color: colors[i % colors.length] });
      }
      const response = await axios.get(`${API}/categories`);
      const locale = language === 'en' ? 'en' : 'it';
      const sorted = response.data.sort((a, b) => a.name.localeCompare(b.name, locale));
      setCategories(sorted);
      toast.success(t('success'));
    } catch (error) {
      console.error("Error loading default categories:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await axios.put(`${API}/categories/${editingCategory.id}`, formData);
        toast.success(t('success'));
      } else {
        await axios.post(`${API}/categories`, formData);
        toast.success(t('success'));
      }
      setIsDialogOpen(false);
      setEditingCategory(null);
      setFormData({ name: "", color: "#4A6741" });
      fetchCategories();
    } catch (error) {
      toast.error(getErrorMessage(error, language), { description: getErrorSuggestion(error, language) });
    }
  };

  const handleDelete = async (categoryId) => {
    try {
      await axios.delete(`${API}/categories/${categoryId}`);
      toast.success(t('success'));
      fetchCategories();
    } catch (error) {
      toast.error(getErrorMessage(error, language));
    }
  };

  const openEditDialog = (category, e) => {
    e.stopPropagation();
    setEditingCategory(category);
    setFormData({ name: category.name, color: category.color });
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingCategory(null);
    setFormData({ name: "", color: "#4A6741" });
    setIsDialogOpen(true);
  };

  const handleDialogChange = (open) => {
    if (!open && (formData.name || editingCategory)) {
      if (formData.name && formData.name !== editingCategory?.name) {
        const confirmMsg = language === 'en' ? "Close? Data will be lost." : "Chiudere? I dati andranno persi.";
        if (!window.confirm(confirmMsg)) return;
      }
    }
    setIsDialogOpen(open);
    if (!open) {
      setEditingCategory(null);
      setFormData({ name: "", color: "#4A6741" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const useCompactView = categories.length > 10;

  return (
    <div className="space-y-6 animate-slide-in-up" data-testid="categories-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{t('categoriesTitle')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('categoriesDesc')}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button className="rounded-full btn-bounce gap-2" onClick={openNewDialog} data-testid="new-category-btn">
              <Plus size={18} />
              {t('newCategory')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>{editingCategory ? t('editCategory') : t('newCategory')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="category_name">{t('categoryName')}</Label>
                <Input
                  id="category_name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('categoryPlaceholder')}
                  required
                  className="mt-1"
                  data-testid="category-name-input"
                />
              </div>
              <div>
                <Label>{t('categoryColor')}</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                        formData.color === color ? "ring-2 ring-offset-2 ring-primary scale-110" : ""
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="mt-3 h-10 w-full cursor-pointer"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => handleDialogChange(false)} className="rounded-full">
                  {t('cancel')}
                </Button>
                <Button type="submit" className="rounded-full" data-testid="save-category-btn">
                  {editingCategory ? t('save') : t('create')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories List */}
      {categories.length === 0 ? (
        <div className="empty-state py-16">
          <Folders className="text-muted-foreground/50 mb-4" size={64} />
          <h3 className="text-xl font-semibold mb-2">{t('noCategories')}</h3>
          <p className="text-muted-foreground mb-4">{t('createFirstCategory')}</p>
          <Button className="rounded-full" onClick={openNewDialog}>
            <Plus size={18} className="mr-2" />
            {t('newCategory')}
          </Button>
        </div>
      ) : useCompactView ? (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">{t('categoryColor')}</TableHead>
                  <TableHead>{t('categoryName')}</TableHead>
                  <TableHead className="text-right w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id} data-testid={`category-row-${category.id}`}>
                    <TableCell>
                      <div className="w-8 h-8 rounded-full" style={{ backgroundColor: category.color }} />
                    </TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={(e) => openEditDialog(category, e)}>
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
                              <AlertDialogTitle>{t('deleteCategory')}</AlertDialogTitle>
                              <AlertDialogDescription>{t('deleteCategoryWarning')}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-full">{t('cancel')}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(category.id)} className="rounded-full bg-destructive">
                                {t('delete')}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <Card 
              key={category.id}
              className={`border-border/50 bg-card/50 backdrop-blur-sm group stagger-${(index % 5) + 1} opacity-0 animate-slide-in-up`}
              data-testid={`category-card-${category.id}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${category.color}20` }}>
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: category.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                      <p className="text-sm text-muted-foreground font-mono">{category.color}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={(e) => openEditDialog(category, e)}>
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
                          <AlertDialogTitle>{t('deleteCategory')}</AlertDialogTitle>
                          <AlertDialogDescription>{t('deleteCategoryWarning')}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-full">{t('cancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(category.id)} className="rounded-full bg-destructive">
                            {t('delete')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
