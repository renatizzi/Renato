import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API } from "@/App";
import { Folders, Package, Archive, Search, MoreHorizontal, QrCode, Printer, FileSpreadsheet, Download, Upload, Key, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_boxes: 0, total_items: 0, total_categories: 0 });
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOtherFunctions, setShowOtherFunctions] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, boxesRes] = await Promise.all([
        axios.get(`${API}/stats`),
        axios.get(`${API}/boxes`)
      ]);
      setStats(statsRes.data);
      setBoxes(boxesRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { 
      icon: Folders,
      label: "Gestione Categorie",
      description: "Crea e organizza la categoria colorata del singolo contenitore (tipologia degli oggetti contenuti, descrizione, caratteristica, ecc.)",
      count: stats.total_categories,
      link: "/categories"
    },
    { 
      icon: Package,
      label: "Gestione Contenitori",
      description: "Crea e organizza i contenitori (numerazione, categoria e posizione / luogo di custodia)",
      count: stats.total_boxes,
      link: "/boxes"
    },
    { 
      icon: Archive,
      label: "Gestione Oggetti",
      description: "Crea e organizza gli oggetti dei singoli contenitori (nome oggetto, descrizione, eventuale foto)",
      count: stats.total_items,
      link: "/boxes",
      isObjectsLink: true
    },
    { 
      icon: Search,
      label: "Ricerca Avanzata",
      description: "Trova gli oggetti custoditi nei contenitori mediante ricerca testuale o vocale",
      count: null,
      link: "/search"
    },
    { 
      icon: MoreHorizontal,
      label: "Altre Funzioni",
      description: "Gestione QR Code, stampa, export, backup, ripristino archivio, password",
      count: null,
      link: null,
      isOtherFunctions: true
    },
  ];

  const otherFunctionsMenu = [
    {
      icon: QrCode,
      label: "QR Code",
      description: "Genera e stampa QR code per identificare rapidamente i singoli contenitori",
      action: () => { navigate("/boxes"); setShowOtherFunctions(false); }
    },
    {
      icon: Printer,
      label: "Stampa",
      description: "Stampa liste complete o parziali dell'archivio",
      action: () => { navigate("/print"); setShowOtherFunctions(false); }
    },
    {
      icon: FileSpreadsheet,
      label: "Export",
      description: "Esporta l'archivio in un file CSV per l'elaborazione immediata con altre applicazioni",
      action: async () => {
        try {
          const response = await axios.get(`${API}/export/csv`, { responseType: 'blob' });
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'archivio_oggetti.csv');
          document.body.appendChild(link);
          link.click();
          link.remove();
        } catch (error) {
          console.error("Export error:", error);
        }
        setShowOtherFunctions(false);
      }
    },
    {
      icon: Download,
      label: "Backup",
      description: "Effettua il backup dell'archivio in formato JSON",
      action: async () => {
        try {
          const response = await axios.get(`${API}/backup`, { responseType: 'blob' });
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `archivio_backup_${new Date().toISOString().slice(0,10)}.json`);
          document.body.appendChild(link);
          link.click();
          link.remove();
        } catch (error) {
          console.error("Backup error:", error);
        }
        setShowOtherFunctions(false);
      }
    },
    {
      icon: Upload,
      label: "Ripristino",
      description: "Effettua il ripristino dell'archivio in formato JSON",
      action: () => { navigate("/settings"); setShowOtherFunctions(false); }
    },
    {
      icon: Key,
      label: "Password",
      description: "Gestisce la password di accesso con possibilità di ripristino di quella originale",
      action: () => { navigate("/settings"); setShowOtherFunctions(false); }
    },
  ];

  const handleMenuClick = (item) => {
    if (item.isOtherFunctions) {
      setShowOtherFunctions(true);
    } else if (item.isObjectsLink) {
      if (boxes.length === 0) {
        alert("Nessun contenitore in archivio");
      } else {
        navigate("/boxes");
      }
    } else if (item.link) {
      navigate(item.link);
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
    <div className="space-y-8 animate-slide-in-up" data-testid="dashboard">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Riepilogo contenitori</h1>
      </div>

      {/* Main Menu Table */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Funzionalità</TableHead>
                <TableHead className="text-right w-24">Totale</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuItems.map((item) => (
                <TableRow 
                  key={item.label}
                  className="cursor-pointer hover:bg-secondary/50 transition-colors"
                  onClick={() => handleMenuClick(item)}
                  data-testid={`menu-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <TableCell className="py-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <item.icon className="text-primary" size={20} />
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{item.label}</p>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      </div>
                      <ChevronRight className="text-muted-foreground ml-2" size={20} />
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Altre Funzioni</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mt-4">
            {otherFunctionsMenu.map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-secondary/50 transition-colors text-left"
                data-testid={`other-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="text-primary" size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <ChevronRight className="text-muted-foreground" size={20} />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
