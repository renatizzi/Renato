import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API } from "@/App";
import { Package, Folders, Archive, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Dashboard = () => {
  const [stats, setStats] = useState({ total_boxes: 0, total_items: 0, total_categories: 0 });
  const [recentBoxes, setRecentBoxes] = useState([]);
  const [loading, setLoading] = useState(true);

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
      setRecentBoxes(boxesRes.data.slice(-5).reverse());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      title: "Scatole", 
      value: stats.total_boxes, 
      icon: Package, 
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    { 
      title: "Oggetti", 
      value: stats.total_items, 
      icon: Archive, 
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    { 
      title: "Categorie", 
      value: stats.total_categories, 
      icon: Folders, 
      color: "text-chart-3",
      bgColor: "bg-chart-3/10"
    },
  ];

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Gestisci il tuo archivio personale</p>
        </div>
        <Link to="/boxes">
          <Button className="rounded-full btn-bounce gap-2" data-testid="add-box-btn">
            <Plus size={18} />
            Nuova Scatola
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card 
            key={stat.title} 
            className={`card-hover border-border/50 bg-card/50 backdrop-blur-sm stagger-${index + 1} opacity-0 animate-slide-in-up`}
            data-testid={`stat-${stat.title.toLowerCase()}`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-4xl font-extrabold mt-1">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-2xl ${stat.bgColor}`}>
                  <stat.icon className={stat.color} size={28} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Boxes */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Ultime Scatole</CardTitle>
          <Link to="/boxes">
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
              Vedi tutte
              <ArrowRight size={16} />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentBoxes.length === 0 ? (
            <div className="empty-state py-12">
              <Package className="text-muted-foreground/50 mb-4" size={48} />
              <p className="text-muted-foreground">Nessuna scatola ancora</p>
              <Link to="/boxes" className="mt-4">
                <Button variant="outline" className="rounded-full">
                  Crea la prima scatola
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBoxes.map((box) => (
                <Link 
                  key={box.id} 
                  to={`/boxes/${box.id}`}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                  data-testid={`recent-box-${box.box_number}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <span className="font-mono font-bold text-primary">#{box.box_number}</span>
                    </div>
                    <div>
                      <p className="font-semibold">{box.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {box.items?.length || 0} oggetti
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="text-muted-foreground" size={20} />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
