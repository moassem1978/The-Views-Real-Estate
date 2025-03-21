import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { formatDate } from "@/lib/utils";

// Define news/announcement item structure
interface NewsItem {
  id: number;
  title: string;
  date: string;
  description: string;
  link?: string;
  tag: 'news' | 'announcement' | 'event';
}

// Sample news data - In a real application, this would come from an API
const sampleNews: NewsItem[] = [
  {
    id: 1,
    title: "The Views Real Estate Launches Exclusive Beachfront Collection",
    date: "2025-03-15",
    description: "Discover our newest collection of luxury beachfront properties with exclusive access to private beaches and panoramic ocean views.",
    link: "/properties?tag=beachfront",
    tag: 'announcement'
  },
  {
    id: 2,
    title: "Luxury Property Market Report for Q1 2025 Now Available",
    date: "2025-03-10",
    description: "Our comprehensive analysis of the luxury property market trends, investment opportunities, and forecasts for the upcoming year.",
    link: "/market-report",
    tag: 'news'
  },
  {
    id: 3,
    title: "Spring Showcase: Luxury Villa Open House Weekend",
    date: "2025-04-05",
    description: "Join us for a special open house weekend showcasing our most luxurious villa properties with complimentary champagne and gourmet catering.",
    link: "/events/spring-showcase",
    tag: 'event'
  }
];

export default function NewsCarousel() {
  const [news] = useState<NewsItem[]>(sampleNews);
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  
  // Autoplay functionality
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (autoplay && news.length > 0) {
      interval = setInterval(() => {
        setActiveIndex((current) => (current + 1) % news.length);
      }, 7000); // Change news item every 7 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoplay, news.length]);
  
  // Pause autoplay on hover
  const pauseAutoplay = () => setAutoplay(false);
  const resumeAutoplay = () => setAutoplay(true);

  if (!news || news.length === 0) {
    return null;
  }
  
  return (
    <section 
      className="py-4 bg-[#F9F6F2] border-b border-[#E8DACB]"
      onMouseEnter={pauseAutoplay}
      onMouseLeave={resumeAutoplay}
    >
      <div className="container mx-auto px-4">
        <Carousel 
          opts={{ loop: true }} 
          className="w-full"
          setApi={(api) => {
            // When the carousel is mounted, we can add event listeners
            api?.on('select', () => {
              setActiveIndex(api.selectedScrollSnap());
            });
          }}
        >
          <CarouselContent>
            {news.map((item, index) => (
              <CarouselItem key={item.id}>
                <div className="flex flex-col md:flex-row items-center justify-between py-2">
                  <div className="flex items-center mb-2 md:mb-0">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.tag === 'news' 
                        ? 'bg-blue-100 text-blue-800' 
                        : item.tag === 'announcement' 
                          ? 'bg-[#F1E5CC] text-[#B87333]' 
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {item.tag === 'news' 
                        ? 'News' 
                        : item.tag === 'announcement' 
                          ? 'Announcement' 
                          : 'Event'}
                    </span>
                    <span className="ml-3 text-sm text-gray-500">
                      {formatDate(item.date)}
                    </span>
                  </div>
                  
                  <div className="flex-1 mx-4 text-center md:text-left">
                    <h3 className="text-base font-medium text-gray-900">
                      {item.title}
                    </h3>
                  </div>
                  
                  {item.link && (
                    <Link 
                      href={item.link}
                      className="text-sm font-medium text-[#B87333] hover:text-[#955A28] transition-colors"
                    >
                      Learn More &rarr;
                    </Link>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-1 flex items-center space-x-1">
            {news.map((_, index) => (
              <button
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  index === activeIndex 
                    ? 'bg-[#B87333] w-4' 
                    : 'bg-gray-300'
                }`}
                onClick={() => {
                  setActiveIndex(index);
                  setAutoplay(false);
                }}
                aria-label={`Go to announcement ${index + 1}`}
              />
            ))}
          </div>
        </Carousel>
      </div>
    </section>
  );
}