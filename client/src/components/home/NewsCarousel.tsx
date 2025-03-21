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
  image: string;
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
    image: "https://images.unsplash.com/photo-1545566239-0d773a881c74?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    link: "/properties?tag=beachfront",
    tag: 'announcement'
  },
  {
    id: 2,
    title: "Luxury Property Market Report for Q1 2025 Now Available",
    date: "2025-03-10",
    description: "Our comprehensive analysis of the luxury property market trends, investment opportunities, and forecasts for the upcoming year.",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    link: "/market-report",
    tag: 'news'
  },
  {
    id: 3,
    title: "Spring Showcase: Luxury Villa Open House Weekend",
    date: "2025-04-05",
    description: "Join us for a special open house weekend showcasing our most luxurious villa properties with complimentary champagne and gourmet catering.",
    image: "https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
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
      className="py-8 bg-[#F9F6F2] border-b border-[#E8DACB]"
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
                <Link 
                  href={item.link || "#"} 
                  className="block w-full hover:opacity-95 transition-opacity"
                >
                  <div className="flex flex-col md:flex-row items-center justify-between py-4 gap-4">
                    {/* Left - Image */}
                    <div className="w-full md:w-1/3 h-44 rounded-lg overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Right - Content */}
                    <div className="w-full md:w-2/3 flex flex-col">
                      <div className="flex items-center mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.tag === 'news' 
                            ? 'bg-black text-[#F9F6F2]' 
                            : item.tag === 'announcement' 
                              ? 'bg-[#B87333] text-white' 
                              : 'bg-[#F1E5CC] text-black'
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
                      
                      <h3 className="text-xl font-serif font-semibold text-gray-900 mb-2">
                        {item.title}
                      </h3>
                      
                      <p className="text-gray-700 mb-2 line-clamp-2">
                        {item.description}
                      </p>
                      
                      <div className="mt-auto">
                        <span className="inline-flex items-center text-sm font-medium text-[#B87333]">
                          Learn More
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="ml-1 h-4 w-4" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M14 5l7 7m0 0l-7 7m7-7H3" 
                            />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
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