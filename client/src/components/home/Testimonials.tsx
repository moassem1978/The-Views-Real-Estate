import { useQuery } from "@tanstack/react-query";
import { Testimonial } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function Testimonials() {
  const { data: testimonials, isLoading, error } = useQuery<Testimonial[]>({
    queryKey: ['/api/testimonials'],
  });

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <svg 
        key={i} 
        xmlns="http://www.w3.org/2000/svg" 
        className={`h-5 w-5 ${i < rating ? 'text-[#D4AF37]' : 'text-gray-300'}`} 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const renderSkeletons = () => {
    return Array(3).fill(0).map((_, index) => (
      <div key={index} className="bg-[#F9F6F2] rounded-lg shadow-md p-8">
        <Skeleton className="h-5 w-24 mb-4" />
        <Skeleton className="h-24 w-full mb-6" />
        <div className="flex items-center">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="ml-4">
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    ));
  };

  if (error) {
    return (
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-500">
            Error loading testimonials. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-[#D4AF37] font-medium">Client Experiences</span>
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-gray-800 mt-2">What Our Clients Say</h2>
          <p className="mt-4 text-gray-600">
            The satisfaction of our discerning clientele is the ultimate measure of our success.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            renderSkeletons()
          ) : testimonials && testimonials.length > 0 ? (
            testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-[#F9F6F2] rounded-lg shadow-md p-8">
                <div className="flex items-center mb-4">
                  <div className="text-[#D4AF37] flex">
                    {renderStars(testimonial.rating)}
                  </div>
                </div>
                <p className="italic text-gray-800">
                  "{testimonial.testimonial}"
                </p>
                <div className="mt-6 flex items-center">
                  <div className="h-12 w-12 rounded-full bg-[#E9D787] flex items-center justify-center text-white font-serif font-semibold">
                    {testimonial.initials}
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-gray-800">{testimonial.clientName}</p>
                    <p className="text-sm text-gray-600">{testimonial.clientLocation}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-500 py-12">
              No testimonials available at the moment.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
