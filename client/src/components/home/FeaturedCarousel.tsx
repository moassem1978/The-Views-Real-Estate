import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { Property, Announcement } from "../../types";
import { ArrowRight } from "lucide-react";

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

export default function FeaturedCarousel() {
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);

  // Fetch featured properties
  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: ['/api/properties/featured'],
    staleTime: 60000,
  });

  // Fetch featured announcements
  const { data: announcements, isLoading: announcementsLoading } = useQuery({
    queryKey: ['/api/announcements/featured'],
    staleTime: 60000,
  });

  useEffect(() => {
    const items: CarouselItem[] = [];

    // Add properties to carousel items
    if (properties && Array.isArray(properties)) {
      properties.forEach((property: Property) => {
        items.push({
          id: property.id,
          title: property.title,
          description: property.description.length > 120 ? 
            property.description.substring(0, 120) + '...' : 
            property.description,
          imageUrl: property.images && property.images.length > 0 ? 
            property.images[0] : 
            '/uploads/default-property.svg',
          type: 'property',
          price: property.price,
          badge: property.listingType,
          detailsUrl: `/properties/${property.id}`
        });
      });
    }

    // Add announcements to carousel items
    if (announcements && Array.isArray(announcements)) {
      announcements.forEach((announcement: Announcement) => {
        items.push({
          id: announcement.id,
          title: announcement.title,
          description: announcement.content.length > 120 ? 
            announcement.content.substring(0, 120) + '...' : 
            announcement.content,
          imageUrl: announcement.imageUrl || '/uploads/default-announcement.svg',
          type: 'announcement',
          detailsUrl: `/announcements/${announcement.id}`
        });
      });
    }

    // Sort by newest items first (assuming the id is incremental)
    items.sort((a, b) => b.id - a.id);
    
    setCarouselItems(items);
  }, [properties, announcements]);

  const isLoading = propertiesLoading || announcementsLoading;

  if (isLoading) {
    return (
      <section className="relative bg-black/90 h-[70vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/80 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <div className="h-8 w-40 bg-gradient-to-r from-gray-300 to-gray-100 animate-pulse rounded mb-4"></div>
              <div className="h-16 w-80 bg-gradient-to-r from-gray-300 to-gray-100 animate-pulse rounded mb-8"></div>
              <div className="h-20 w-full max-w-xl bg-gradient-to-r from-gray-300 to-gray-100 animate-pulse rounded-md mb-8"></div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="h-12 w-40 bg-gradient-to-r from-gray-300 to-gray-100 animate-pulse rounded"></div>
                <div className="h-12 w-40 bg-gradient-to-r from-gray-300 to-gray-100 animate-pulse rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!carouselItems.length) {
    return null;
  }

  return (
    <section className="relative bg-black/95 min-h-[70vh] max-h-[90vh] overflow-hidden">
      <Carousel className="w-full" opts={{ loop: true }}>
        <CarouselContent>
          {carouselItems.map((item, index) => (
            <CarouselItem key={`${item.type}-${item.id}`}>
              <div className="relative h-[70vh] w-full">
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img 
                    src={getImageUrl(item.imageUrl)} 
                    alt={item.title}
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/80"></div>
                </div>
                
                {/* Content */}
                <div className="relative h-full flex items-center">
                  <div className="container mx-auto px-4">
                    <div className="max-w-2xl text-white">
                      <div className="mb-4">
                        {item.badge && (
                          <Badge 
                            variant="secondary" 
                            className="bg-[#B87333] hover:bg-[#B87333]/80 text-white mb-3"
                          >
                            {item.badge}
                          </Badge>
                        )}
                        {!item.badge && item.type === 'announcement' && (
                          <Badge 
                            variant="secondary" 
                            className="bg-[#B87333] hover:bg-[#B87333]/80 text-white mb-3"
                          >
                            Announcement
                          </Badge>
                        )}
                      </div>
                      
                      <h1 className="text-4xl sm:text-5xl font-serif font-semibold mb-3">
                        {item.title}
                      </h1>
                      
                      {item.price && (
                        <p className="text-2xl sm:text-3xl font-serif text-[#E6CCB2] mb-4">
                          {formatPrice(item.price)} L.E
                        </p>
                      )}
                      
                      <p className="text-lg text-gray-200 mb-8">
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
                        
                        {item.type === 'property' && (
                          <Button 
                            asChild
                            size="lg" 
                            variant="outline" 
                            className="border-white text-white hover:bg-white hover:text-black transition-colors"
                          >
                            <Link href="/properties">
                              Browse All Properties
                            </Link>
                          </Button>
                        )}
                        
                        {item.type === 'announcement' && (
                          <Button 
                            asChild
                            size="lg" 
                            variant="outline" 
                            className="border-white text-white hover:bg-white hover:text-black transition-colors"
                          >
                            <Link href="/announcements">
                              View All Announcements
                            </Link>
                          </Button>
                        )}
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