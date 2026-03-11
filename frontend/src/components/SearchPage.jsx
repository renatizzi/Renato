import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import apiClient from "@/services/apiClient";
import { API } from "@/App";
import { useLanguage } from "@/i18n";
import { getErrorMessage } from "@/components/ErrorBoundary";
import { toast } from "sonner";
import { Search, Mic, MicOff, Package, ArrowRight, X, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Image component with error handling
const ItemImage = ({ url, name, size = "md" }) => {
  const [hasError, setHasError] = useState(false);
  const sizeClasses = size === "sm" ? "w-10 h-10" : "w-16 h-16";

  if (hasError || !url) {
    return (
      <div className={`${sizeClasses} rounded-xl bg-muted flex items-center justify-center flex-shrink-0`}>
        <Image className="text-muted-foreground" size={size === "sm" ? 14 : 20} />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses} rounded-xl overflow-hidden flex-shrink-0 bg-muted`}>
      <img src={url} alt={name} className="w-full h-full object-cover" onError={() => setHasError(true)} />
    </div>
  );
};

export const SearchPage = () => {
  const { t, language } = useLanguage();
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
      recognitionRef.current.lang = language === 'en' ? 'en-US' : 'it-IT';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        handleSearch(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error(t('error'));
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, [language]);

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) {
      toast.error(t('error'));
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const response = await apiClient.get(`${API}/search`, { params: { q: searchQuery.trim() } });
      setResults(response.data);
    } catch (error) {
      toast.error(getErrorMessage(error, language));
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const toggleVoiceSearch = () => {
    if (!speechSupported) {
      toast.error(t('cameraNotSupported'));
      return;
    }

    if (isListening) {
      recognitionRef.current.abort();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.info(t('voiceListening'));
      } catch (error) {
        toast.error(t('error'));
      }
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  const useCompactView = results.length > 10;

  return (
    <div className="space-y-6 animate-slide-in-up" data-testid="search-page">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{t('searchTitle')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('searchDesc')}</p>
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
                placeholder={t('searchPlaceholder')}
                className="pl-12 pr-10 h-12 rounded-full text-base"
                data-testid="search-input"
              />
              {query && (
                <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8" onClick={clearSearch}>
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
                  title={t('voiceSearch')}
                >
                  {isListening ? <Mic size={20} className="animate-pulse" /> : <MicOff size={20} />}
                </Button>
              )}
              <Button onClick={() => handleSearch()} className="h-12 px-8 rounded-full btn-bounce" disabled={loading} data-testid="search-btn">
                {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : (language === 'en' ? 'Search' : 'Cerca')}
              </Button>
            </div>
          </div>
          {isListening && (
            <div className="mt-4 p-4 rounded-xl bg-primary/10 text-center">
              <p className="text-primary font-medium animate-pulse">{t('voiceListening')}</p>
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
            <h3 className="text-xl font-semibold mb-2">{t('noResults')}</h3>
            <p className="text-muted-foreground">{t('noResultsDesc')}</p>
          </div>
        ) : useCompactView ? (
          <div className="space-y-4">
            <p className="text-muted-foreground">{results.length} {t('resultsFound')}</p>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">{t('itemPhoto')}</TableHead>
                      <TableHead>{t('itemName')}</TableHead>
                      <TableHead className="hidden md:table-cell">{t('containerSection')}</TableHead>
                      <TableHead className="hidden md:table-cell">{t('containerCategory')}</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result) => (
                      <TableRow key={`${result.box_id}-${result.item_id}`}>
                        <TableCell>
                          <ItemImage url={result.item_image_data} name={result.item_name} size="sm" />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{result.item_name}</p>
                            {result.item_description && <p className="text-xs text-muted-foreground truncate max-w-xs">{result.item_description}</p>}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="font-mono text-primary">#{result.box_number}</span>
                          <span className="text-muted-foreground ml-2">{result.box_name}</span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {result.category_name && <span className="px-2 py-0.5 rounded-full bg-secondary text-xs">{result.category_name}</span>}
                        </TableCell>
                        <TableCell>
                          <Link to={`/boxes/${result.box_id}`} className="p-2 rounded-full hover:bg-secondary transition-colors inline-flex">
                            <ArrowRight size={16} className="text-muted-foreground" />
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground">{results.length} {t('resultsFound')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((result, index) => (
                <Card key={`${result.box_id}-${result.item_id}`} className={`border-border/50 bg-card/50 backdrop-blur-sm card-hover stagger-${(index % 5) + 1} opacity-0 animate-slide-in-up`}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <ItemImage url={result.item_image_data} name={result.item_name} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">{result.item_name}</h4>
                            {result.item_description && <p className="text-sm text-muted-foreground line-clamp-1">{result.item_description}</p>}
                            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                              <div className="flex items-center gap-1 text-primary">
                                <Package size={12} />
                                <span className="font-mono">#{result.box_number}</span>
                              </div>
                              <span className="text-muted-foreground">{result.box_name}</span>
                              {result.category_name && <span className="px-2 py-0.5 rounded-full bg-secondary">{result.category_name}</span>}
                            </div>
                          </div>
                          <Link to={`/boxes/${result.box_id}`} className="ml-2 p-2 rounded-full hover:bg-secondary transition-colors flex-shrink-0">
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
          <h3 className="text-xl font-semibold mb-2">{t('searchTitle')}</h3>
          <p className="text-muted-foreground">{t('searchDesc')}</p>
        </div>
      )}
    </div>
  );
};
