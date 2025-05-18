import React, { useState, useCallback, useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { Property, Announcement } from "../../types";
import { ArrowRight } from "lucide-react";

// Define the interface outside the component to prevent re-creation
interface CarouselItem {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  type: 'property' | 'announcement';
  price?: number;
  badge?: string;
  detailsUrl: string;
}

// Simplified loading skeleton component
const LoadingSkeleton = () => (
  <section className="relative bg-black/90 h-[70vh] overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/80 flex items-center">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl">
          <div className="h-8 w-40 bg-gradient-to-r from-gray-300 to-gray-100 animate-pulse rounded mb-4"></div>
          <div className="h-16 w-80 bg-gradient-to-r from-gray-300 to-gray-100 animate-pulse rounded mb-6"></div>
          <div className="h-16 w-full max-w-xl bg-gradient-to-r from-gray-300 to-gray-100 animate-pulse rounded-md mb-6"></div>
          <div className="flex gap-4">
            <div className="h-10 w-32 bg-gradient-to-r from-gray-300 to-gray-100 animate-pulse rounded"></div>
            <div className="h-10 w-32 bg-gradient-to-r from-gray-300 to-gray-100 animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default function FeaturedCarousel() {
  // Optimized queries with reduced re-renders
  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: ['/api/properties/featured'],
    staleTime: 300000, // Increased stale time to 5 minutes
  });

  const { data: announcements, isLoading: announcementsLoading } = useQuery({
    queryKey: ['/api/announcements/featured'],
    staleTime: 300000, // Increased stale time to 5 minutes
  });

  // Create carousel items with memoization to prevent unnecessary recalculations
  const carouselItems = useMemo(() => {
    const items: CarouselItem[] = [];

    // Process properties
    if (properties && Array.isArray(properties)) {
      properties.forEach((property: Property) => {
        // Truncate description efficiently
        const description = property.description && property.description.length > 120
          ? property.description.substring(0, 120) + '...'
          : property.description || '';

        items.push({
          id: property.id,
          title: property.title,
          description,
          imageUrl: property.images && property.images.length > 0
            ? property.images[0]
            : '/uploads/default-property.svg',
          type: 'property',
          price: property.price,
          badge: property.listingType,
          detailsUrl: `/properties/${property.id}`
        });
      });
    }

    // Process announcements
    if (announcements && Array.isArray(announcements)) {
      announcements.forEach((announcement: Announcement) => {
        // Truncate content efficiently
        const description = announcement.content && announcement.content.length > 120
          ? announcement.content.substring(0, 120) + '...'
          : announcement.content || '';

        items.push({
          id: announcement.id,
          title: announcement.title,
          description,
          imageUrl: announcement.imageUrl || '/uploads/default-announcement.svg',
          type: 'announcement',
          detailsUrl: `/announcements/${announcement.id}`
        });
      });
    }

    // Sort by newest items first
    return items.sort((a, b) => b.id - a.id);
  }, [properties, announcements]);

  const isLoading = propertiesLoading || announcementsLoading;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!carouselItems.length) {
    return null;
  }

  return (
    <section className="relative bg-black/95 min-h-[70vh] max-h-[90vh] overflow-hidden">
      <Carousel className="w-full" opts={{ loop: true }}>
        <CarouselContent>
          {carouselItems.map((item) => (
            <CarouselItem key={`${item.type}-${item.id}`}>
              <div className="relative h-[70vh] w-full">
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img 
                    src={getImageUrl(item.imageUrl)} 
                    alt={item.title}
                    className="w-full h-full object-cover object-center"
                    loading="eager" // Load eagerly for important carousel images
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/80"></div>
                </div>
                
                {/* Content */}
                <div className="relative h-full flex items-center">
                  <div className="container mx-auto px-4">
                    <div className="max-w-2xl text-white">
                      <div className="mb-4">
                        {item.badge ? (
                          <Badge 
                            variant="secondary" 
                            className="bg-[#B87333] hover:bg-[#B87333]/80 text-white mb-3"
                          >
                            {item.badge}
                          </Badge>
                        ) : item.type === 'announcement' && (
                          <Badge 
                            variant="secondary" 
                            className="bg-[#B87333] hover:bg-[#B87333]/80 text-white mb-3"
                          >
                            Announcement
                          </Badge>
                        )}
                      </div>
                      
                      <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-semibold mb-3">
                        {item.title}
                      </h1>
                      
                      {item.price && (
                        <p className="text-xl sm:text-2xl md:text-3xl font-serif text-[#E6CCB2] mb-4">
                          {item.price === 0 ? "L.E" : `${item.price.toLocaleString()} L.E`}
                        </p>
                      )}
                      
                      <p className="text-base md:text-lg text-gray-200 mb-6">
                        {item.description}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button 
                          asChild
                          size="lg" 
                          className="bg-[#B87333] hover:bg-[#B87333]/90 text-white"
                        >
                          <Link href={item.detailsUrl}>
                            View Details
                          </Link>
                        </Button>
                        
                        <Button 
                          asChild
                          size="lg" 
                          variant="outline" 
                          className="border-[#B87333] text-[#B87333] hover:bg-[#B87333] hover:text-white transition-colors"
                        >
                          <Link href={item.type === 'property' ? "/properties" : "/announcements"}>
                            {item.type === 'property' ? "Browse All Properties" : "View All Announcements"}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <div className="absolute bottom-4 right-4 z-20 flex gap-2">
          <CarouselPrevious className="bg-[#B87333]/80 text-white hover:bg-[#B87333] border-none h-10 w-10" />
          <CarouselNext className="bg-[#B87333]/80 text-white hover:bg-[#B87333] border-none h-10 w-10" />
        </div>
      </Carousel>
      
      {/* Call to action for property search */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 py-3 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <p className="text-white font-medium">
              Find your dream property in our exclusive collection
            </p>
            <Button 
              variant="link" 
              className="text-[#E6CCB2] flex items-center gap-1 no-underline"
              asChild
            >
              <Link href="#search">
                Search Properties <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}