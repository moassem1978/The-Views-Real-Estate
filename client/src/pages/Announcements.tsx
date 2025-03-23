import React from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Calendar, Filter } from "lucide-react";
import { formatDate, getImageUrl } from "@/lib/utils";
import { Announcement } from "../types";

export default function Announcements() {
  // Fetch all announcements, optimized for performance
  const { data: announcements, isLoading } = useQuery({
    queryKey: ['/api/announcements'],
    staleTime: 300000, // 5 minutes
  });

  // Filter active announcements and sort by newest
  const activeAnnouncements = React.useMemo(() => {
    if (!announcements || !Array.isArray(announcements)) return [];
    
    return announcements
      .filter((announcement: Announcement) => announcement.isActive)
      .sort((a: Announcement, b: Announcement) => {
        // Sort by startDate (newest first)
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      });
  }, [announcements]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-12 bg-[#F9F6F2]">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-serif font-semibold mb-4">
              Announcements & Updates
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Stay informed with the latest news, property launches, and special offerings from The Views Real Estate.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-6">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-8 w-full mb-3" />
                    <Skeleton className="h-20 w-full mb-4" />
                    <Skeleton className="h-10 w-32" />
                  </div>
                </Card>
              ))}
            </div>
          ) : activeAnnouncements.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-serif font-medium mb-4">No Announcements</h2>
              <p className="text-gray-600 mb-8">
                There are currently no active announcements. Please check back later.
              </p>
              <Button asChild className="bg-[#B87333] hover:bg-[#B87333]/90 text-white">
                <Link href="/">
                  Return to Home
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeAnnouncements.map((announcement: Announcement) => (
                <Card key={announcement.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={getImageUrl(announcement.imageUrl) || '/uploads/default-announcement.svg'}
                      alt={announcement.title}
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
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
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}