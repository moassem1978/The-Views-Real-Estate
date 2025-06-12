import React, { useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Announcement } from "../../types";
import { ArrowRight, Calendar, ChevronRight } from "lucide-react";
import { formatDate, getImageUrl } from "@/lib/utils";

// Simplified loading skeleton to improve performance
const LoadingSkeleton = () => (
  <section className="py-16 bg-[#F9F6F2]">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
        <div>
          <div className="h-5 w-40 bg-gray-300 animate-pulse rounded mb-2"></div>
          <div className="h-10 w-64 bg-gray-300 animate-pulse rounded"></div>
        </div>
        <div className="h-10 w-32 bg-gray-300 animate-pulse rounded mt-4 md:mt-0"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-300 animate-pulse"></div>
            <div className="p-6">
              <div className="h-4 w-24 bg-gray-200 animate-pulse rounded mb-3"></div>
              <div className="h-6 w-full bg-gray-200 animate-pulse rounded mb-3"></div>
              <div className="h-16 w-full bg-gray-200 animate-pulse rounded mb-4"></div>
              <div className="h-6 w-32 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Optimized announcement card component to reduce re-renders
const AnnouncementCard = ({ announcement }: { announcement: Announcement }) => {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <div className="h-48 overflow-hidden relative">
        <img
          src={getImageUrl(announcement.imageUrl) || '/uploads/default-announcement.svg'}
          alt={announcement.title}
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {announcement.isFeatured && (
          <Badge className="absolute top-3 right-3 bg-[#B87333] text-white">
            Featured
          </Badge>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Calendar size={14} className="mr-1" />
          <span>{formatDate(announcement.startDate)}</span>
        </div>
        <CardTitle className="text-xl font-serif">{announcement.title}</CardTitle>
      </CardHeader>
      
      <CardContent>
        <p className="text-gray-600 line-clamp-3">
          {announcement.content}
        </p>
      </CardContent>
      
      <CardFooter>
        <Button
          asChild
          variant="ghost"
          className="text-[#B87333] hover:text-[#B87333]/80 hover:bg-[#B87333]/10 p-0 flex items-center gap-1"
        >
          <Link href={`/announcements/${announcement.id}`}>
            Read more <ArrowRight size={14} />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function AnnouncementsSection() {
  // Define the paginated response type
  interface PaginatedResponse {
    data: Announcement[];
    totalCount: number;
    pageCount: number;
    page: number;
    pageSize: number;
  }
  
  // Optimized query with increased stale time
  const { data: announcementsResponse, isLoading } = useQuery<PaginatedResponse>({
    queryKey: ['/api/announcements'],
    staleTime: 300000, // Increased to 5 minutes
  });

  // Memoized filtering of announcements
  const activeAnnouncements = useMemo(() => {
    // Extract the actual announcements array from the response
    const announcements = announcementsResponse?.data;
    
    if (!announcements || !Array.isArray(announcements)) return [];
    
    return announcements
      .filter((announcement: Announcement) => announcement.isActive)
      .sort((a: Announcement, b: Announcement) => {
        // Sort by startDate (newest first)
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      })
      .slice(0, 3); // Display up to 3 announcements
  }, [announcementsResponse]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!activeAnnouncements.length) {
    return null;
  }

  return (
    <section className="py-16 bg-[#F9F6F2]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <h2 className="text-sm uppercase tracking-wider text-[#B87333] font-semibold mb-2">
              Latest News
            </h2>
            <h3 className="text-3xl font-serif font-semibold text-gray-900">
              Announcements & Updates
            </h3>
          </div>
          
          <Button
            asChild
            variant="outline"
            className="mt-4 md:mt-0 border-[#B87333] text-[#B87333] hover:bg-[#B87333] hover:text-white"
          >
            <Link href="/announcements">
              View All <ChevronRight size={16} />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeAnnouncements.map((announcement: Announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
        </div>
      </div>
    </section>
  );
}