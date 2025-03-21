import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroCarousel from "@/components/home/HeroCarousel";
import NewsCarousel from "@/components/home/NewsCarousel";
import PropertySearch from "@/components/home/PropertySearch";
import PropertyCarousel from "@/components/home/PropertyCarousel";
import FeaturedProperty from "@/components/home/FeaturedProperty";
import Services from "@/components/home/Services";
import Testimonials from "@/components/home/Testimonials";
import ContactCTA from "@/components/home/ContactCTA";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Suspense fallback={<HeroLoadingSkeleton />}>
          <HeroCarousel />
        </Suspense>
        <NewsCarousel />
        <PropertySearch />
        
        <Suspense fallback={<PropertyLoadingSkeleton />}>
          <PropertyCarousel />
        </Suspense>
        
        <Suspense fallback={<FeaturedPropertySkeleton />}>
          <FeaturedProperty />
        </Suspense>
        
        <Services />
        
        <Suspense fallback={<TestimonialsSkeleton />}>
          <Testimonials />
        </Suspense>
        
        <ContactCTA />
      </main>
      <Footer />
    </div>
  );
}

// Loading skeletons for lazy-loaded components
function HeroLoadingSkeleton() {
  return (
    <section className="relative bg-gray-800 h-[70vh] overflow-hidden">
      <Skeleton className="absolute inset-0" />
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
        <div className="max-w-2xl">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-12 w-1/2 mb-6" />
          <Skeleton className="h-6 w-full max-w-xl mb-8" />
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-12 w-40" />
            <Skeleton className="h-12 w-40" />
          </div>
        </div>
      </div>
    </section>
  );
}

function PropertyLoadingSkeleton() {
  return (
    <section className="py-16 bg-[#F9F6F2]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-10 w-80" />
          </div>
          <Skeleton className="h-8 w-40 mt-4 md:mt-0" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md">
              <Skeleton className="h-60 w-full" />
              <div className="p-6">
                <Skeleton className="h-6 w-28 mb-2" />
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-5 w-40 mb-4" />
                <Skeleton className="h-px w-full mb-4" />
                <div className="flex space-x-4">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedPropertySkeleton() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="md:w-1/2">
            <Skeleton className="h-[400px] w-full rounded-lg" />
          </div>
          <div className="md:w-1/2">
            <Skeleton className="h-6 w-36 mb-2" />
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-28 w-full mb-6" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Skeleton className="h-12 w-full sm:w-40" />
              <Skeleton className="h-12 w-full sm:w-40" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSkeleton() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Skeleton className="h-5 w-32 mx-auto mb-2" />
          <Skeleton className="h-10 w-80 mx-auto mb-4" />
          <Skeleton className="h-16 w-full mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#F9F6F2] rounded-lg shadow-md p-8">
              <Skeleton className="h-5 w-32 mb-4" />
              <Skeleton className="h-24 w-full mb-6" />
              <div className="flex items-center">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="ml-4">
                  <Skeleton className="h-5 w-40 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
