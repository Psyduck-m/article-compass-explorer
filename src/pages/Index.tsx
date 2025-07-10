
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalLink, Search, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Article interface
interface Article {
  id: string;
  title: string;
  summary: string;
  shortSummary: string;
  mainTags: string[];
  subTags: string[];
  link: string;
}

const Index = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [selectedMainTags, setSelectedMainTags] = useState<string[]>([]);
  const [selectedSubTag, setSelectedSubTag] = useState<string>('all');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load articles from JSON files
  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        // For demo purposes, we'll try to load a few common article files
        // In a real implementation, you might have an index file listing all articles
        const articleFiles = ['1.json', '2.json', '3.json', '4.json']; // Add more as needed
        const loadedArticles = [];

        for (const filename of articleFiles) {
          try {
            const response = await fetch(`/data_new/articles/${filename}`);
            if (response.ok) {
              const articleData = await response.json();
              loadedArticles.push(articleData);
            }
          } catch (error) {
            console.log(`Could not load article ${filename}:`, error);
          }
        }

        setArticles(loadedArticles);
        setFilteredArticles(loadedArticles);
        console.log('Loaded articles:', loadedArticles);
      } catch (error) {
        console.error('Error loading articles:', error);
        toast({
          title: "Error",
          description: "Failed to load articles",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, []);

  // Get all unique main tags
  const allMainTags = Array.from(new Set(articles.flatMap(article => article.mainTags)));
  
  // Get subtags based on selected main tags
  const availableSubTags = selectedMainTags.length > 0 
    ? Array.from(new Set(
        articles
          .filter(article => article.mainTags.some(tag => selectedMainTags.includes(tag)))
          .flatMap(article => article.subTags)
      ))
    : [];

  // Filter articles based on selected tags
  useEffect(() => {
    let filtered = articles;

    if (selectedMainTags.length > 0) {
      filtered = filtered.filter(article => 
        article.mainTags.some(tag => selectedMainTags.includes(tag))
      );
    }

    if (selectedSubTag && selectedSubTag !== 'all') {
      filtered = filtered.filter(article => 
        article.subTags.includes(selectedSubTag)
      );
    }

    setFilteredArticles(filtered);
  }, [selectedMainTags, selectedSubTag, articles]);

  const handleMainTagToggle = (tag: string) => {
    setSelectedMainTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
    setSelectedSubTag('all'); // Reset subtag when main tags change
  };

  const handleSearch = () => {
    toast({
      title: "Search Applied",
      description: `Showing ${filteredArticles.length} articles`,
    });
  };

  const handleCardClick = (articleId: string) => {
    setExpandedCard(expandedCard === articleId ? null : articleId);
  };

  const handleExternalLink = (link: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(link, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-300 p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-black">News Corporation</h1>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-red-600 to-red-700 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-4">Article Explorer</h2>
          <p className="text-xl opacity-90">Discover and explore the latest news articles</p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Main Tags Selection */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Main Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {allMainTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedMainTags.includes(tag) ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      selectedMainTags.includes(tag) 
                        ? 'bg-red-600 hover:bg-red-700 border-red-600' 
                        : 'border-gray-400 hover:border-red-600 hover:bg-red-50'
                    }`}
                    onClick={() => handleMainTagToggle(tag)}
                  >
                    {tag}
                    {selectedMainTags.includes(tag) && (
                      <X className="ml-1 h-3 w-3" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Sub Tags Selection */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Sub Tags
              </label>
              <Select value={selectedSubTag} onValueChange={setSelectedSubTag}>
                <SelectTrigger className="border-gray-400 focus:border-red-600">
                  <SelectValue placeholder="Select subtag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subtags</SelectItem>
                  {availableSubTags.map(subTag => (
                    <SelectItem key={subTag} value={subTag}>
                      {subTag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search Button */}
            <div>
              <Button 
                onClick={handleSearch}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-black">
              Articles ({filteredArticles.length})
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map(article => (
              <Card 
                key={article.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                  expandedCard === article.id 
                    ? 'border-red-600 shadow-lg' 
                    : 'border-gray-200 hover:border-red-400'
                }`}
                onClick={() => handleCardClick(article.id)}
              >
                <CardContent className="p-6">
                  <h4 className="text-lg font-semibold text-black mb-3 line-clamp-2">
                    {article.title}
                  </h4>
                  
                  <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                    {expandedCard === article.id ? article.summary : article.shortSummary}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.mainTags.map(tag => (
                      <Badge key={tag} className="bg-red-600 hover:bg-red-700 text-white text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {expandedCard === article.id && article.subTags.map(subTag => (
                      <Badge key={subTag} variant="outline" className="border-gray-400 text-gray-700 text-xs">
                        {subTag}
                      </Badge>
                    ))}
                  </div>
                  
                  {expandedCard === article.id && (
                    <Button
                      onClick={(e) => handleExternalLink(article.link, e)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white mt-2"
                      size="sm"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Read Full Article
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredArticles.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No articles found. Make sure your JSON files are in the data_new/articles directory.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
