import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API } from "@/App";
import { toast } from "sonner";
import { Search, Mic, MicOff, Package, ArrowRight, X, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'it-IT';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        handleSearch(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast.error("Accesso al microfono negato");
        } else {
          toast.error("Errore nel riconoscimento vocale");
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) {
      toast.error("Inserisci un termine di ricerca");
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const response = await axios.get(`${API}/search`, {
        params: { q: searchQuery.trim() }
      });
      setResults(response.data);
    } catch (error) {
      toast.error("Errore nella ricerca");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const toggleVoiceSearch = () => {
    if (!speechSupported) {
      toast.error("Il tuo browser non supporta la ricerca vocale");
      return;
    }

    if (isListening) {
      recognitionRef.current.abort();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.info("Parla ora...");
      } catch (error) {
        toast.error("Errore nell'avvio del riconoscimento vocale");
      }
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-8 animate-slide-in-up" data-testid="search-page">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Cerca</h1>
        <p className="text-muted-foreground mt-1">Trova oggetti nel tuo archivio</p>
      </div>

      {/* Search Box */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Cerca oggetti per nome o descrizione..."
                className="pl-12 pr-10 h-12 rounded-full text-base"
                data-testid="search-input"
              />
              {query && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={clearSearch}
                >
                  <X size={16} />
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {speechSupported && (
                <Button
                  variant={isListening ? "default" : "outline"}
                  size="icon"
                  className={`h-12 w-12 rounded-full ${isListening ? 'voice-listening' : ''}`}
                  onClick={toggleVoiceSearch}
                  data-testid="voice-search-btn"
                >
                  {isListening ? <Mic size={20} className="animate-pulse" /> : <MicOff size={20} />}
                </Button>
              )}
              <Button 
                onClick={() => handleSearch()}
                className="h-12 px-8 rounded-full btn-bounce"
                disabled={loading}
                data-testid="search-btn"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  "Cerca"
                )}
              </Button>
            </div>
          </div>
          {isListening && (
            <div className="mt-4 p-4 rounded-xl bg-primary/10 text-center">
              <p className="text-primary font-medium animate-pulse">In ascolto... parla ora</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : hasSearched ? (
        results.length === 0 ? (
          <div className="empty-state py-16">
            <Search className="text-muted-foreground/50 mb-4" size={64} />
            <h3 className="text-xl font-semibold mb-2">Nessun risultato</h3>
            <p className="text-muted-foreground">Prova con un termine diverso</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground">{results.length} risultati trovati</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((result, index) => (
                <Card 
                  key={`${result.box_id}-${result.item_id}`}
                  className={`border-border/50 bg-card/50 backdrop-blur-sm card-hover stagger-${(index % 5) + 1} opacity-0 animate-slide-in-up`}
                  data-testid={`search-result-${result.item_id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {result.item_image_url ? (
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                          <img 
                            src={result.item_image_url} 
                            alt={result.item_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                          <Image className="text-muted-foreground" size={20} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">{result.item_name}</h4>
                            {result.item_description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">{result.item_description}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                              <div className="flex items-center gap-1 text-primary">
                                <Package size={12} />
                                <span className="font-mono">#{result.box_number}</span>
                              </div>
                              <span className="text-muted-foreground">{result.box_name}</span>
                              {result.category_name && (
                                <span className="px-2 py-0.5 rounded-full bg-secondary">
                                  {result.category_name}
                                </span>
                              )}
                            </div>
                          </div>
                          <Link 
                            to={`/boxes/${result.box_id}`}
                            className="ml-2 p-2 rounded-full hover:bg-secondary transition-colors flex-shrink-0"
                          >
                            <ArrowRight size={18} className="text-muted-foreground" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      ) : (
        <div className="empty-state py-16">
          <Search className="text-muted-foreground/30 mb-4" size={80} />
          <h3 className="text-xl font-semibold mb-2">Cerca nel tuo archivio</h3>
          <p className="text-muted-foreground">Usa la barra di ricerca o il microfono per trovare i tuoi oggetti</p>
        </div>
      )}
    </div>
  );
};
