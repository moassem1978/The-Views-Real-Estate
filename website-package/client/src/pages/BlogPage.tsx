import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Calendar, Clock, User, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author_name: string;
  featured_image?: string;
  category: string;
  tags: string[];
  is_featured: boolean;
  published_at: string;
  view_count: number;
  reading_time: number;
}

interface ArticlesResponse {
  data: Article[];
  totalCount: number;
  pageCount: number;
  currentPage: number;
}

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: articles, isLoading } = useQuery<ArticlesResponse>({
    queryKey: ['/api/articles', { page: currentPage, category: selectedCategory }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '9'
      });
      if (selectedCategory) params.append('category', selectedCategory);
      
      const response = await fetch(`/api/articles?${params}`);
      if (!response.ok) throw new Error('Failed to fetch articles');
      return response.json();
    }
  });

  const { data: categories } = useQuery<{category: string, count: number}[]>({
    queryKey: ['/api/articles/categories'],
  });

  const { data: featuredArticles } = useQuery<ArticlesResponse>({
    queryKey: ['/api/articles', { featured: true }],
    queryFn: async () => {
      const response = await fetch('/api/articles?featured=true&limit=3');
      if (!response.ok) throw new Error('Failed to fetch featured articles');
      return response.json();
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderSkeleton = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-6">
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-4" />
        <div className="flex items-center space-x-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#B87333] to-[#A66323] py-20">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              Luxury Real Estate Insights
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
              Expert advice, market trends, and insider knowledge to guide your luxury property journey
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Featured Articles */}
        {featuredArticles?.data && featuredArticles.data.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-serif font-bold text-gray-800 mb-8 text-center">
              Featured Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredArticles.data.map((article) => (
                <div key={article.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  {article.featured_image && (
                    <div className="h-48 bg-gray-200 bg-cover bg-center" 
                         style={{backgroundImage: `url(${article.featured_image})`}}>
                    </div>
                  )}
                  <div className="p-6">
                    <Badge className="mb-3 bg-[#D4AF37] hover:bg-[#BF9B30]">
                      {article.category}
                    </Badge>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 line-clamp-2">
                      <Link href={`/blog/${article.slug}`} className="hover:text-[#B87333]">
                        {article.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{article.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>{article.author_name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{article.reading_time} min read</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="lg:w-2/3">
            {/* Category Filter */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Browse by Category</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === "" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("")}
                  className={selectedCategory === "" ? "bg-[#B87333] hover:bg-[#A66323]" : ""}
                >
                  All Articles
                </Button>
                {categories?.map((cat) => (
                  <Button
                    key={cat.category}
                    variant={selectedCategory === cat.category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(cat.category)}
                    className={selectedCategory === cat.category ? "bg-[#B87333] hover:bg-[#A66323]" : ""}
                  >
                    {cat.category} ({cat.count})
                  </Button>
                ))}
              </div>
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {isLoading ? (
                Array(6).fill(0).map((_, index) => renderSkeleton())
              ) : articles?.data.length === 0 ? (
                <div className="col-span-2 text-center py-12">
                  <p className="text-gray-500 text-lg">No articles found in this category.</p>
                </div>
              ) : (
                articles?.data.map((article) => (
                  <article key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    {article.featured_image && (
                      <div className="h-48 bg-gray-200 bg-cover bg-center" 
                           style={{backgroundImage: `url(${article.featured_image})`}}>
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="secondary" className="bg-[#F5F0E6] text-[#B87333]">
                          {article.category}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(article.published_at)}
                        </div>
                      </div>
                      
                      <h2 className="text-xl font-semibold text-gray-800 mb-3 line-clamp-2">
                        <Link href={`/blog/${article.slug}`} className="hover:text-[#B87333] transition-colors">
                          {article.title}
                        </Link>
                      </h2>
                      
                      <p className="text-gray-600 mb-4 line-clamp-3">{article.excerpt}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {article.author_name}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {article.reading_time} min read
                          </div>
                        </div>
                        
                        <Link href={`/blog/${article.slug}`}>
                          <Button variant="ghost" className="text-[#B87333] hover:text-[#A66323] hover:bg-[#F5F0E6]">
                            Read More →
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>

            {/* Pagination */}
            {articles && articles.pageCount > 1 && (
              <div className="flex justify-center space-x-2">
                {Array.from({ length: articles.pageCount }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? "bg-[#B87333] hover:bg-[#A66323]" : ""}
                  >
                    {page}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-xl font-semibold mb-4">Stay Updated</h3>
              <p className="text-gray-600 mb-4">
                Get the latest luxury real estate insights and exclusive property listings delivered to your inbox.
              </p>
              <NewsletterForm />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Popular Categories</h3>
              <div className="space-y-2">
                {categories?.slice(0, 5).map((cat) => (
                  <button
                    key={cat.category}
                    onClick={() => setSelectedCategory(cat.category)}
                    className="w-full text-left p-2 hover:bg-gray-50 rounded-md transition-colors flex justify-between items-center"
                  >
                    <span className="text-gray-700">{cat.category}</span>
                    <Badge variant="secondary">{cat.count}</Badge>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          firstName,
          source: 'blog_sidebar'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setEmail("");
        setFirstName("");
      } else {
        setMessage(data.message || "Failed to subscribe");
      }
    } catch (error) {
      setMessage("Failed to subscribe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#B87333]"
      />
      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#B87333]"
      />
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#B87333] hover:bg-[#A66323] text-white"
      >
        {isSubmitting ? "Subscribing..." : "Subscribe"}
      </Button>
      {message && (
        <p className={`text-sm ${message.includes("success") || message.includes("Welcome") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </form>
  );
}