import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Property, Announcement } from "@/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

type SlideItem = {
  id: number;
  type: 'property' | 'announcement';
  data: Property | Announcement;
};

export default function HeroCarousel() {
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [propertiesResponse, announcementsResponse] = await Promise.all([
          fetch('/api/properties/highlighted'),
          fetch('/api/announcements/highlighted')
        ]);

        let properties: Property[] = [];
        if (propertiesResponse.ok) {
          properties = await propertiesResponse.json();
        }

        let announcements: Announcement[] = [];
        if (announcementsResponse.ok) {
          announcements = await announcementsResponse.json();
        }

        const propertySlides: SlideItem[] = properties.map(property => ({
          id: property.id,
          type: 'property',
          data: property
        }));

        const announcementSlides: SlideItem[] = announcements.map(announcement => ({
          id: announcement.id,
          type: 'announcement',
          data: announcement
        }));

        setSlides([...propertySlides, ...announcementSlides]);
      } catch (error) {
        console.error("Error fetching carousel data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (autoplay && slides.length > 0) {
      interval = setInterval(() => {
        setActiveIndex((current) => (current + 1) % slides.length);
      }, 8000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoplay, slides.length]);

  if (isLoading) {
    return (
      <section className="relative h-[80vh] bg-gray-900">
        <Skeleton className="h-full w-full" />
      </section>
    );
  }

  if (slides.length === 0) {
    return (
      <section className="relative h-[80vh] bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/80 to-black/70" />
      </section>
    );
  }

  return (
    <section 
      className="relative h-[80vh] overflow-hidden"
      onMouseEnter={() => setAutoplay(false)}
      onMouseLeave={() => setAutoplay(true)}
    >
      <Carousel 
        className="h-full" 
        opts={{ loop: true }}
        setApi={(api) => {
          api?.on('select', () => {
            setActiveIndex(api.selectedScrollSnap());
          });
          if (activeIndex > 0) {
            api?.scrollTo(activeIndex);
          }
        }}
      >
        <CarouselContent className="h-full">
          {slides.map((item) => (
            <CarouselItem key={`${item.type}-${item.id}`} className="h-full">
              <div className="relative h-full">
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img 
                    src={item.type === 'property' 
                      ? ((item.data as Property).images?.[0] || "/default-property.svg")
                      : ((item.data as Announcement).imageUrl || "/default-announcement.svg")
                    }
                    alt={item.data.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
                </div>

                {/* Type Badge - Top Left */}
                <div className="absolute top-6 left-6">
                  <Badge variant="secondary" className="bg-black/60 text-white text-xs px-3 py-1">
                    {item.type === 'property' 
                      ? (item.data as Property).propertyType
                      : 'Announcement'
                    }
                  </Badge>
                </div>

                {/* Title and Location - Bottom Left */}
                <div className="absolute bottom-0 left-0 w-full p-6">
                  <div className="container mx-auto">
                    <h2 className="text-white text-3xl font-serif mb-1">
                      {item.data.title}
                    </h2>
                    {item.type === 'property' && (
                      <p className="text-white/80 text-sm">
                        {(item.data as Property).city}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious 
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 border-none text-white h-10 w-10"
        />
        <CarouselNext 
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 border-none text-white h-10 w-10"
        />
      </Carousel>
    </section>
  );
}