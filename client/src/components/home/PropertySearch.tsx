import { Link } from "wouter";

export default function PropertySearch() {
  return (
    <section className="bg-white py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg -mt-16 relative z-10 p-6 md:p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-serif font-semibold text-gray-800 mb-4">Find Your Perfect Property</h2>
            <p className="text-gray-600 mb-6">Browse our exclusive collection of extraordinary homes and estates, each carefully selected to meet the highest standards of luxury living.</p>
            
            <Link 
              href="/properties"
              className="inline-flex items-center px-8 py-4 bg-[#C5975C] hover:bg-[#B8864F] text-white font-semibold text-lg rounded-md transition-colors shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse All Properties
            </Link>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Use advanced search filters and browse by location, price range, property type, and more
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}