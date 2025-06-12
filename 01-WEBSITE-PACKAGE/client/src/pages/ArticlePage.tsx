import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Calendar, Clock, User, ArrowLeft, Share2, Heart } from "lucide-react";
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
  author_full_name: string;
  featured_image?: string;
  category: string;
  tags: string[];
  meta_title?: string;
  meta_description?: string;
  published_at: string;
  view_count: number;
  reading_time: number;
}

export default function ArticlePage() {
  const [match, params] = useRoute("/blog/:slug");
  const slug = params?.slug;

  const { data: article, isLoading, error } = useQuery<Article>({
    queryKey: ['/api/articles', slug],
    queryFn: async () => {
      const response = await fetch(`/api/articles/${slug}`);
      if (!response.ok) throw new Error('Article not found');
      return response.json();
    },
    enabled: !!slug
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href
        });
      } catch (err) {
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-6">The article you're looking for doesn't exist.</p>
          <Link href="/blog">
            <Button className="bg-[#B87333] hover:bg-[#A66323] text-white">
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-32 mb-6" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-6 w-3/4 mb-8" />
            <Skeleton className="h-64 w-full mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Meta Tags would be handled by a meta component in a real app */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Navigation */}
          <div className="mb-8">
            <Link href="/blog">
              <Button variant="ghost" className="text-[#B87333] hover:text-[#A66323] hover:bg-[#F5F0E6]">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Badge className="bg-[#D4AF37] hover:bg-[#BF9B30]">
                {article.category}
              </Badge>
              <div className="flex items-center text-sm text-gray-500 space-x-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(article.published_at)}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {article.reading_time} min read
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {article.author_full_name || article.author_name}
                </div>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-800 mb-6 leading-tight">
              {article.title}
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {article.excerpt}
            </p>

            {/* Social Actions */}
            <div className="flex items-center space-x-4 mb-8">
              <Button
                onClick={handleShare}
                variant="outline"
                className="border-[#B87333] text-[#B87333] hover:bg-[#B87333] hover:text-white"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Article
              </Button>
              <div className="text-sm text-gray-500">
                {article.view_count} views
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {article.featured_image && (
            <div className="mb-12">
              <img
                src={article.featured_image}
                alt={article.title}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Article Content */}
          <article className="prose prose-lg max-w-none mb-12">
            <div 
              className="text-gray-700 leading-relaxed"
              style={{
                fontSize: '18px',
                lineHeight: '1.8',
                whiteSpace: 'pre-line'
              }}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </article>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mb-12">
              <h3 className="text-lg font-semibold mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-[#F5F0E6] text-[#B87333]">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Author Bio */}
          <div className="bg-white rounded-lg p-8 shadow-md mb-12">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-[#B87333] rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {article.author_full_name || article.author_name}
                </h3>
                <p className="text-gray-600">Luxury Real Estate Expert</p>
              </div>
            </div>
            <p className="text-gray-700">
              Specializing in luxury properties and providing expert insights into the high-end real estate market. 
              With years of experience in luxury real estate, our experts deliver valuable content to help you make 
              informed decisions in your property journey.
            </p>
          </div>

          {/* Lead Capture Form */}
          <div className="bg-gradient-to-r from-[#B87333] to-[#A66323] rounded-lg p-8 text-white">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Interested in Luxury Properties?</h3>
              <p className="text-lg opacity-90">
                Get personalized property recommendations and exclusive market insights.
              </p>
            </div>
            <LeadCaptureForm />
          </div>
        </div>
      </div>
    </div>
  );
}

function LeadCaptureForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          source: 'blog_article',
          message: formData.message || "Inquiry from blog article page"
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          message: ""
        });
      } else {
        setMessage(data.message || "Failed to submit inquiry");
      }
    } catch (error) {
      setMessage("Failed to submit inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          className="p-3 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
          required
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          className="p-3 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          className="p-3 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          className="p-3 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
        />
      </div>
      <textarea
        name="message"
        placeholder="Tell us about your property preferences..."
        value={formData.message}
        onChange={handleChange}
        rows={3}
        className="w-full p-3 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
      />
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-white text-[#B87333] hover:bg-gray-100 font-semibold"
      >
        {isSubmitting ? "Sending..." : "Get Expert Consultation"}
      </Button>
      {message && (
        <p className={`text-sm text-center ${message.includes("Thank you") ? "text-green-200" : "text-red-200"}`}>
          {message}
        </p>
      )}
    </form>
  );
}

import { useState } from "react";