import React from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDate, getImageUrl } from "@/lib/utils";
import { Calendar, ArrowLeft, Clock } from "lucide-react";
import { Announcement } from "../types";

export default function AnnouncementDetails() {
  // Get the announcement ID from the URL
  const [, params] = useRoute("/announcements/:id");
  const id = params?.id ? parseInt(params.id, 10) : null;

  // Fetch the specific announcement
  const { data: announcement, isLoading, error } = useQuery({
    queryKey: ['/api/announcements', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await fetch(`/api/announcements/${id}`);
      if (!response.ok) {
        throw new Error('Failed to load announcement');
      }
      return response.json();
    },
    enabled: !!id,
    staleTime: 300000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow pt-8 pb-16">
          <div className="container mx-auto px-4">
            <Skeleton className="h-10 w-40 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <Skeleton className="h-64 w-full mb-6 rounded-lg" />
                <Skeleton className="h-8 w-3/4 mb-4" />
                <div className="flex gap-4 mb-6">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
              <div className="md:col-span-1">
                <Skeleton className="h-40 w-full rounded-lg mb-4" />
                <Skeleton className="h-10 w-full mb-2" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-serif font-semibold mb-4">Announcement Not Found</h1>
            <p className="text-gray-600 mb-8">
              The announcement you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild className="bg-[#B87333] hover:bg-[#B87333]/90 text-white">
              <Link href="/announcements">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Announcements
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const announcementData = announcement as Announcement;
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Button 
              asChild
              variant="outline" 
              className="mb-6"
            >
              <Link href="/announcements">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Announcements
              </Link>
            </Button>
            
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <Badge className="bg-[#B87333] text-white">
                Announcement
              </Badge>
              
              {announcementData.isFeatured && (
                <Badge variant="outline" className="border-[#B87333] text-[#B87333]">
                  Featured
                </Badge>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-serif font-semibold mb-4">
              {announcementData.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8">
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span className="text-sm">Posted on {formatDate(announcementData.createdAt)}</span>
              </div>
              
              {announcementData.endDate && (
                <div className="flex items-center gap-2">
                  <Clock size={18} />
                  <span className="text-sm">Valid until {formatDate(announcementData.endDate)}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <div className="mb-8 rounded-lg overflow-hidden">
                <img 
                  src={getImageUrl(announcementData.imageUrl) || '/uploads/default-announcement.svg'} 
                  alt={announcementData.title}
                  className="w-full h-auto max-h-[500px] object-cover"
                />
              </div>
              
              <div className="prose prose-lg max-w-none">
                <div className="whitespace-pre-wrap">
                  {announcementData.content}
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-[#F9F6F2] p-6 rounded-lg mb-6">
                <h3 className="text-xl font-serif font-semibold mb-4">Contact Us</h3>
                <p className="text-gray-700 mb-6">
                  Interested in this announcement? Get in touch with our team for more information.
                </p>
                <Button 
                  asChild
                  className="w-full bg-[#B87333] hover:bg-[#B87333]/90 text-white"
                >
                  <Link href="/contact">
                    Contact Our Team
                  </Link>
                </Button>
              </div>
              
              <div className="bg-[#F9F6F2] p-6 rounded-lg">
                <h3 className="text-xl font-serif font-semibold mb-4">View Properties</h3>
                <p className="text-gray-700 mb-6">
                  Explore our exclusive collection of luxury properties.
                </p>
                <Button 
                  asChild
                  variant="outline"
                  className="w-full border-[#B87333] text-[#B87333] hover:bg-[#B87333] hover:text-white"
                >
                  <Link href="/properties">
                    Browse Properties
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}