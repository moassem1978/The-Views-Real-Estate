import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Property, Announcement } from "@/types";
import { formatPrice, formatDate, getResizedImageUrl } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ArrowRight, Calendar, MapPin } from "lucide-react";

type HighlightItem = {
  id: number;
  type: 'property' | 'announcement';
  data: Property | Announcement;
};

export default function HighlightsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch highlighted properties and announcements
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ['/api/properties/highlighted'],
    staleTime: 1000 * 60 * 10,
  });

  const { data: announcements = [] } = useQuery<Announcement[]>({
    queryKey: ['/api/announcements/highlighted'],
    staleTime: 1000 * 60 * 10,
  });

  // Combine and create highlight items
  const highlights: HighlightItem[] = [
    ...properties.map(property => ({
      id: property.id,
      type: 'property' as const,
      data: property
    })),
    ...announcements.map(announcement => ({
      id: announcement.id,
      type: 'announcement' as const,
      data: announcement
    }))
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || highlights.length <= 1) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % highlights.length);
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAutoPlaying, highlights.length]);

  // Navigation functions
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + highlights.length) % highlights.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % highlights.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Pause autoplay on hover
  const handleMouseEnter = () => {
    setIsAutoPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleMouseLeave = () => {
    setIsAutoPlaying(true);
  };

  if (highlights.length === 0) {
    return null;
  }

  const currentItem = highlights[currentIndex];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-800 mb-4">
            Featured Highlights
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of premium properties and latest announcements
          </p>
        </div>

        {/* Carousel Container */}
        <div 
          className="relative max-w-6xl mx-auto"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Navigation Arrows */}
          {highlights.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white text-black rounded-full shadow-lg p-3 z-20 hover:bg-[#B87333] hover:text-white transition-all duration-300"
                aria-label="Previous highlight"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white text-black rounded-full shadow-lg p-3 z-20 hover:bg-[#B87333] hover:text-white transition-all duration-300"
                aria-label="Next highlight"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Main Slide */}
          <div className="relative overflow-hidden rounded-2xl shadow-2xl h-[500px] md:h-[600px]">
            <img loading="lazy"
              src={currentItem.type === 'property' 
                ? ((currentItem.data as Property).images && (currentItem.data as Property).images.length > 0 
                    ? getResizedImageUrl((currentItem.data as Property).images[0], 'large')
                    : "/placeholder-property.svg")
                : (getResizedImageUrl((currentItem.data as Announcement).imageUrl || '', 'large') || "/placeholder-announcement.svg")
              }
              alt={currentItem.data.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = currentItem.type === 'property' ? "/placeholder-property.svg" : "/placeholder-announcement.svg";
              }}
            />

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 md:p-8 text-white">
              {/* Type Badge */}
              <div className="mb-3">
                <Badge className={currentItem.type === 'property' ? "bg-[#B87333] text-white" : "bg-blue-600 text-white"}>
                  {currentItem.type === 'property' ? 'Featured Property' : 'Latest News'}
                </Badge>
              </div>

              {currentItem.type === 'property' ? (
                <>
                  <h3 className="text-2xl md:text-3xl font-serif font-bold mb-3">
                    {(currentItem.data as Property).title}
                  </h3>
                  <div className="flex items-center gap-2 mb-2 text-sm opacity-90">
                    <MapPin className="w-4 h-4" />
                    <span>{(currentItem.data as Property).city}</span>
                  </div>
                  <div className="text-xl font-bold text-[#B87333] mb-4">
                    {formatPrice((currentItem.data as Property).price)}
                  </div>
                  <Link href={`/properties/${(currentItem.data as Property).id}`}>
                    <Button className="bg-[#B87333] hover:bg-[#964B00] text-white shadow-lg transition-all duration-300">
                      View Property <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="text-2xl md:text-3xl font-serif font-bold mb-3">
                    {(currentItem.data as Announcement).title}
                  </h3>
                  <div className="flex items-center gap-2 mb-4 text-sm opacity-90">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate((currentItem.data as Announcement).startDate)}</span>
                  </div>
                  <Link href={`/announcements/${(currentItem.data as Announcement).id}`}>
                    <Button className="bg-[#B87333] hover:bg-[#964B00] text-white shadow-lg transition-all duration-300">
                      Read More <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Dot Navigation */}
          {highlights.length > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              {highlights.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-[#B87333] scale-125 shadow-lg' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to highlight ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Thumbnail Preview */}
          {highlights.length > 1 && (
            <div className="flex justify-center mt-8 space-x-4 overflow-x-auto pb-2">
              {highlights.map((item, index) => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => goToSlide(index)}
                  className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                    index === currentIndex 
                      ? 'border-[#B87333] shadow-lg scale-110' 
                      : 'border-gray-300 hover:border-gray-400 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img loading="lazy"
                    src={item.type === 'property' 
                      ? ((item.data as Property).images && (item.data as Property).images.length > 0 
                          ? getResizedImageUrl((item.data as Property).images[0], 'small')
                          : "/placeholder-property.svg")
                      : (getResizedImageUrl((item.data as Announcement).imageUrl || '', 'small') || "/placeholder-announcement.svg")
                    }
                    alt={item.data.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = item.type === 'property' ? "/placeholder-property.svg" : "/placeholder-announcement.svg";
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}