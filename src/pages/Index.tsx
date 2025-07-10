
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalLink, Search, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Mock data structure for articles
interface Article {
  id: string;
  title: string;
  summary: string;
  shortSummary: string;
  mainTags: string[];
  subTags: string[];
  link: string;
}

// Mock articles data - in a real app this would come from data_new/articles
const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Revolutionary AI Technology Transforms Healthcare',
    summary: 'A comprehensive look at how artificial intelligence is revolutionizing the healthcare industry, from diagnostic tools to personalized treatment plans. Medical professionals are increasingly relying on AI-powered systems to improve patient outcomes and streamline operations.',
    shortSummary: 'AI technology is transforming healthcare with diagnostic tools and personalized treatments.',
    mainTags: ['Technology', 'Healthcare'],
    subTags: ['AI', 'Innovation', 'Medical'],
    link: 'https://example.com/ai-healthcare'
  },
  {
    id: '2',
    title: 'Global Climate Change Summit Reaches Historic Agreement',
    summary: 'World leaders gather to discuss unprecedented climate action plans, setting ambitious targets for carbon reduction and renewable energy adoption. The summit marks a turning point in global environmental policy with concrete commitments from major economies.',
    shortSummary: 'World leaders reach historic climate agreement with ambitious carbon reduction targets.',
    mainTags: ['Environment', 'Politics'],
    subTags: ['Climate Change', 'Sustainability', 'Policy'],
    link: 'https://example.com/climate-summit'
  },
  {
    id: '3',
    title: 'Stock Market Hits New All-Time High',
    summary: 'Financial markets continue their upward trajectory as investor confidence grows amid positive economic indicators. Technology stocks lead the surge with strong quarterly earnings reports from major corporations.',
    shortSummary: 'Stock market reaches new heights driven by technology sector gains.',
    mainTags: ['Finance', 'Technology'],
    subTags: ['Stock Market', 'Investment', 'Economy'],
    link: 'https://example.com/stock-market'
  },
  {
    id: '4',
    title: 'Olympic Games Set New Attendance Records',
    summary: 'This year\'s Olympic Games have broken multiple attendance records with millions of spectators worldwide. Athletes from over 200 countries compete in various disciplines, showcasing human excellence and international cooperation.',
    shortSummary: 'Olympic Games break attendance records with global participation.',
    mainTags: ['Sports', 'International'],
    subTags: ['Olympics', 'Athletics', 'Competition'],
    link: 'https://example.com/olympics'
  }
];

const Index = () => {
  const [articles, setArticles] = useState<Article[]>(mockArticles);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>(mockArticles);
  const [selectedMainTags, setSelectedMainTags] = useState<string[]>([]);
  const [selectedSubTag, setSelectedSubTag] = useState<string>('all');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

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
          
          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No articles found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
