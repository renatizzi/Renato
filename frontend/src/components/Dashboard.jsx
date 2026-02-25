import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API, APP_NAME } from "@/App";
import { useLanguage } from "@/i18n";
import { Folders, Package, Search, MoreHorizontal, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [stats, setStats] = useState({ total_boxes: 0, total_items: 0, total_categories: 0 });
  const [loading, setLoading] = useState(true);
  const [showOtherFunctions, setShowOtherFunctions] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const statsRes = await axios.get(`${API}/stats`);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Menu items - 4 voci senza "Gestione Oggetti"
  const menuItems = [
    { 
      icon: Folders,
      labelKey: "menuCategories",
      descKey: "descCategories",
      count: stats.total_categories,
      link: "/categories"
    },
    { 
      icon: Package,
      labelKey: "menuContainers",
      descKey: "descContainers",
      count: stats.total_boxes,
      link: "/boxes"
    },
    { 
      icon: MoreHorizontal,
      labelKey: "menuOther",
      descKey: "descOther",
      count: null,
      link: null,
      isOtherFunctions: true
    },
    { 
      icon: Search,
      labelKey: "menuSearch",
      descKey: "descSearch",
      count: null,
      link: "/search"
    },
  ];

  const otherFunctionsMenu = [
    {
      labelKey: "menuExport",
      descKey: "descExport",
      link: "/print"
    },
    {
      labelKey: "menuBackup",
      descKey: "descBackup",
      link: "/backup"
    },
    {
      labelKey: "menuPassword",
      descKey: "descPassword",
      link: "/password"
    },
  ];

  const handleMenuClick = (item) => {
    if (item.isOtherFunctions) {
      setShowOtherFunctions(true);
    } else if (item.link) {
      navigate(item.link);
    }
  };

  const handleOtherFunctionClick = (item) => {
    setShowOtherFunctions(false);
    navigate(item.link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-in-up" data-testid="dashboard">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-primary">
          {t('dashboardTitle')}
        </h1>
      </div>

      {/* Main Menu Table */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>{t('functionality')}</TableHead>
                <TableHead className="text-right w-24">{t('totalLabel')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuItems.map((item) => (
                <TableRow 
                  key={item.labelKey}
                  className="cursor-pointer hover:bg-secondary/50 transition-colors"
                  onClick={() => handleMenuClick(item)}
                  data-testid={`menu-${item.labelKey}`}
                >
                  <TableCell className="py-4">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      <item.icon className="text-muted-foreground" size={20} />
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{t(item.labelKey)}</p>
                        <p className="text-sm text-muted-foreground mt-1">{t(item.descKey)}</p>
                      </div>
                      <ChevronRight className="text-muted-foreground ml-2 flex-shrink-0" size={20} />
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-4">
                    {item.count !== null && (
                      <span className="text-2xl font-bold">{item.count}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Other Functions Dialog */}
      <Dialog open={showOtherFunctions} onOpenChange={setShowOtherFunctions}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold">{t('menuOther')}</DialogTitle>
          </DialogHeader>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm mt-4">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('functionality')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {otherFunctionsMenu.map((item) => (
                    <TableRow 
                      key={item.labelKey}
                      className="cursor-pointer hover:bg-secondary/50 transition-colors"
                      onClick={() => handleOtherFunctionClick(item)}
                      data-testid={`other-${item.labelKey}`}
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{t(item.labelKey)}</p>
                            <p className="text-sm text-muted-foreground mt-1">{t(item.descKey)}</p>
                          </div>
                          <ChevronRight className="text-muted-foreground ml-2 flex-shrink-0" size={20} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
};
