import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ExternalLink, Search, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  // Dummy morning news data
  const MORNING_NEWS_DATA = [
    {
      id: "morning-1",
      title: "SEC Imposes $2.5 Million Fine on Major Investment Firm for Compliance Violations",
      shortSummary: "The Securities and Exchange Commission announced a significant penalty against a prominent investment firm for failing to maintain proper risk management protocols.",
      summary: "The Securities and Exchange Commission has imposed a substantial $2.5 million fine on a major investment firm following an extensive investigation into compliance violations. The firm failed to maintain adequate risk management protocols and proper client disclosure procedures over an 18-month period.",
      mainTags: ["Finance", "Politics"],
      subTags: ["Policy", "Banking", "Investment"],
      link: "https://example.com/sec-fine",
      type: "administrative"
    },
    {
      id: "morning-2", 
      title: "Federal Reserve Announces New Banking Regulations Effective Immediately",
      shortSummary: "The Federal Reserve has issued emergency banking regulations affecting all commercial banks, requiring enhanced liquidity reporting by end of month.",
      summary: "In a surprise announcement this morning, the Federal Reserve has implemented new banking regulations that will significantly impact commercial banking operations. The new rules require enhanced liquidity reporting and stress testing procedures to be implemented within 30 days.",
      mainTags: ["Finance", "Politics"],
      subTags: ["Banking", "Policy", "Government"],
      link: "https://example.com/fed-regulations",
      type: "regulatory"
    },
    {
      id: "morning-3",
      title: "Department of Justice Levies Record $4.2 Million Administrative Penalty",
      shortSummary: "The DOJ has announced its largest administrative fine this year against a corporation for environmental compliance failures.",
      summary: "The Department of Justice has issued a record-breaking $4.2 million administrative penalty against a major corporation for systematic environmental compliance violations. This represents the largest fine of its kind issued this fiscal year.",
      mainTags: ["Politics", "Environment"],
      subTags: ["Policy", "Government"],
      link: "https://example.com/doj-penalty",
      type: "penalty"
    },
    {
      id: "morning-4",
      title: "Treasury Department Issues Emergency Financial Disclosure Requirements",
      shortSummary: "New emergency disclosure requirements for financial institutions go into effect immediately, affecting quarterly reporting standards.",
      summary: "The Treasury Department has issued emergency financial disclosure requirements that will affect all major financial institutions. The new standards require enhanced transparency in quarterly reporting and risk assessment procedures.",
      mainTags: ["Finance"],
      subTags: ["Policy", "Banking"],
      link: "https://example.com/treasury-requirements",
      type: "administrative"
    }
  ];

  // Predefined main tags and their corresponding subtags
  const PREDEFINED_TAGS = {
    'Technology': ['AI', 'Innovation', 'Medical', 'Software', 'Hardware'],
    'Healthcare': ['Medical', 'Research', 'Treatment', 'Diagnosis'],
    'Environment': ['Climate Change', 'Sustainability', 'Policy', 'Conservation'],
    'Politics': ['Policy', 'Elections', 'Government', 'International'],
    'Finance': ['Stock Market', 'Investment', 'Economy', 'Banking'],
    'Sports': ['Olympics', 'Athletics', 'Competition', 'Football'],
    'International': ['Olympics', 'Diplomacy', 'Trade', 'Cooperation']
  };

  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [selectedMainTags, setSelectedMainTags] = useState([]);
  const [selectedSubTag, setSelectedSubTag] = useState('all');
  const [expandedCard, setExpandedCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [articleFilenames, setArticleFilenames] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get all main tags from predefined tags
  const allMainTags = Object.keys(PREDEFINED_TAGS);
  
  // Get subtags based on selected main tags
  const availableSubTags = selectedMainTags.length > 0 
    ? Array.from(new Set(
        selectedMainTags.flatMap(tag => PREDEFINED_TAGS[tag] || [])
      ))
    : [];

  // Fetch article filenames from FastAPI backend
  const fetchArticleFilenames = async (mainTags = [], subTag = null) => {
    try {
      const params = new URLSearchParams();
      
      if (mainTags.length > 0) {
        params.append('main_tags', mainTags.join(','));
      }
      
      if (subTag && subTag !== 'all') {
        params.append('sub_tag', subTag);
      }

      const response = await fetch(`/api/articles/filenames?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch article filenames');
      }
      
      const data = await response.json();
      return data.filenames || [];
    } catch (error) {
      console.error('Error fetching article filenames:', error);
      toast({
        title: "Error",
        description: "Failed to fetch article filenames from database",
        variant: "destructive"
      });
      return [];
    }
  };

  // Load articles from JSON files based on filenames
  const loadArticles = async (filenames) => {
    try {
      setLoading(true);
      const loadedArticles = [];

      for (const filename of filenames) {
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

  // Initial load - fetch all article filenames
  useEffect(() => {
    const initializeArticles = async () => {
      const filenames = await fetchArticleFilenames();
      setArticleFilenames(filenames);
      await loadArticles(filenames);
    };

    initializeArticles();
  }, []);

  // Handle filtering when tags change
  useEffect(() => {
    const handleFilter = async () => {
      const filenames = await fetchArticleFilenames(selectedMainTags, selectedSubTag);
      setArticleFilenames(filenames);
      await loadArticles(filenames);
    };

    // Only filter if we have selected tags, otherwise use initial load
    if (selectedMainTags.length > 0 || (selectedSubTag && selectedSubTag !== 'all')) {
      handleFilter();
    }
  }, [selectedMainTags, selectedSubTag]);

  // Handle article click to open modal
  const handleArticleClick = (article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
  };

  const handleMainTagToggle = (tag) => {
    setSelectedMainTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
    setSelectedSubTag('all'); // Reset subtag when main tags change
  };

  const handleSearch = async () => {
    const filenames = await fetchArticleFilenames(selectedMainTags, selectedSubTag);
    setArticleFilenames(filenames);
    await loadArticles(filenames);
    
    toast({
      title: "Search Applied",
      description: `Found ${filenames.length} articles`,
    });
  };

  const handleExternalLink = (link, e) => {
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

      {/* Latest Morning News Section */}
      <section className="bg-gradient-to-r from-orange-50 to-red-50 py-12 border-b-2 border-orange-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-black mb-2">Latest Morning News</h2>
            <p className="text-gray-600">Major fines, administrative updates, and breaking announcements</p>
          </div>
          
          {/* Featured Morning News Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {MORNING_NEWS_DATA.slice(0, 3).map(article => (
              <Card 
                key={`morning-${article.id}`}
                className="cursor-pointer transition-all duration-300 hover:shadow-lg border border-orange-200 hover:border-red-400 bg-white relative overflow-hidden group h-fit"
                onClick={() => handleArticleClick(article)}
              >
                <div className="absolute top-0 right-0 bg-gradient-to-l from-red-500 to-orange-500 text-white px-2 py-1 text-xs font-semibold rounded-bl-md">
                  LIVE
                </div>
                <CardContent className="p-4">
                  <h4 className="text-base font-semibold text-black mb-2 line-clamp-2 group-hover:text-red-600 transition-colors leading-tight">
                    {article.title}
                  </h4>
                  
                  <p className="text-gray-600 mb-3 text-xs leading-relaxed line-clamp-2">
                    {article.shortSummary}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {article.mainTags && article.mainTags.slice(0, 2).map(tag => (
                        <Badge key={tag} className="bg-red-500 text-white text-xs px-2 py-0 h-5">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 hover:bg-red-50 text-red-600"
                      onClick={(e) => handleExternalLink(article.link, e)}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Morning News Alert Banner */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-lg shadow-lg animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-white text-red-600 rounded-full p-2 mr-4">
                  <ExternalLink className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Administrative Alert</h3>
                  <p className="text-red-100">New regulatory fines and penalties announced - $6.7M in total penalties issued today</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-red-600"
                onClick={() => {
                  const fineArticle = MORNING_NEWS_DATA.find(article => 
                    article.type === 'penalty' || article.type === 'administrative'
                  );
                  if (fineArticle) handleArticleClick(fineArticle);
                }}
              >
                View Details
              </Button>
            </div>
          </div>
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
                className="cursor-pointer transition-all duration-300 hover:shadow-lg border-2 border-gray-200 hover:border-red-400"
                onClick={() => handleArticleClick(article)}
              >
                <CardContent className="p-6">
                  <h4 className="text-lg font-semibold text-black mb-3 line-clamp-2">
                    {article.title}
                  </h4>
                  
                  <p className="text-gray-700 mb-4 text-sm leading-relaxed line-clamp-3">
                    {article.shortSummary}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.mainTags && article.mainTags.map(tag => (
                      <Badge key={tag} className="bg-red-600 hover:bg-red-700 text-white text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredArticles.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No articles found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Article Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedArticle && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-black pr-8">
                  {selectedArticle.title}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  {selectedArticle.mainTags && selectedArticle.mainTags.map(tag => (
                    <Badge key={tag} className="bg-red-600 hover:bg-red-700 text-white">
                      {tag}
                    </Badge>
                  ))}
                  {selectedArticle.subTags && selectedArticle.subTags.map(subTag => (
                    <Badge key={subTag} variant="outline" className="border-gray-400 text-gray-700">
                      {subTag}
                    </Badge>
                  ))}
                </div>
                
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed text-base">
                    {selectedArticle.summary}
                  </p>
                </div>
                
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(selectedArticle.link, '_blank');
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Read Full Article
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
