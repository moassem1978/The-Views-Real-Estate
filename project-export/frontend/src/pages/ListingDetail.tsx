
import React, { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Property } from "../types";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { formatPrice } from "../lib/utils";
import PropertyImage from "../components/properties/PropertyImage";
import { Loader2 } from "lucide-react";

interface ListingDetailProps {}

const ListingDetail: React.FC<ListingDetailProps> = () => {
  const [match, params] = useRoute("/listing/:id");
  const [listing, setListing] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const listingId = params?.id;

  useEffect(() => {
    if (!listingId) {
      setError("No listing ID provided");
      setLoading(false);
      return;
    }

    const fetchListing = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/properties/${listingId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch listing: ${response.statusText}`);
        }
        
        const data = await response.json();
        setListing(data);
      } catch (err) {
        console.error("Error fetching listing:", err);
        setError(err instanceof Error ? err.message : "Failed to load listing");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-[#B87333]" />
            <p className="text-gray-600">Loading listing...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">Error Loading Listing</h2>
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-[#B87333] text-white rounded hover:bg-[#A0632D] transition-colors"
            >
              Go Back
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">Listing Not Found</h2>
            <p className="text-gray-600">The requested listing could not be found.</p>
            <button 
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-[#B87333] text-white rounded hover:bg-[#A0632D] transition-colors"
            >
              Go Back
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Process images array safely
  let images: string[] = [];
  if (listing.images) {
    if (Array.isArray(listing.images)) {
      images = listing.images;
    } else if (typeof listing.images === 'string') {
      try {
        const parsed = JSON.parse(listing.images);
        images = Array.isArray(parsed) ? parsed : [listing.images];
      } catch {
        images = [listing.images];
      }
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div style={{ padding: 24 }} className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-800 mb-4">
              {listing.title}
            </h2>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <p className="text-2xl md:text-3xl font-bold text-[#D4AF37]">
                {formatPrice(listing.price)}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="px-3 py-1 bg-[#B87333] text-white rounded">
                  {listing.listingType || 'Primary'}
                </span>
                {listing.propertyType && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded">
                    {listing.propertyType}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-700">Bedrooms:</span>
              <span className="text-gray-600">{listing.bedrooms}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-700">Bathrooms:</span>
              <span className="text-gray-600">{listing.bathrooms}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-700">Area:</span>
              <span className="text-gray-600">
                {listing.builtUpArea ? `${listing.builtUpArea.toLocaleString()} m²` : 'N/A'}
              </span>
            </div>
          </div>

          {/* Image Gallery */}
          {images.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Photos</h3>
              <div style={{ display: "flex", gap: 10 }} className="flex-wrap">
                {images.map((photo, i) => (
                  <div key={i} className="flex-shrink-0">
                    <PropertyImage
                      src={photo}
                      alt={`${listing.title} - Photo ${i + 1}`}
                      style={{ width: 200, height: "auto" }}
                      className="rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => {
                        // Optional: Add lightbox functionality here
                        window.open(photo, '_blank');
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Description</h3>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Location</h3>
            <p className="text-gray-700">
              {listing.address && `${listing.address}, `}
              {listing.city}, {listing.state}
              {listing.zipCode && ` ${listing.zipCode}`}
            </p>
          </div>

          {/* Payment Information */}
          {(listing.downPayment || listing.installmentAmount || listing.isFullCash) && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Payment Options</h3>
              <div className="space-y-2">
                {listing.downPayment && (
                  <p className="text-gray-700">
                    <span className="font-medium">Down Payment:</span> {formatPrice(listing.downPayment)}
                  </p>
                )}
                {listing.installmentAmount && (
                  <p className="text-gray-700">
                    <span className="font-medium">Monthly Installment:</span> {formatPrice(listing.installmentAmount)}
                    {listing.installmentPeriod && (
                      <span className="ml-1">for {Math.floor(listing.installmentPeriod/12)} years</span>
                    )}
                  </p>
                )}
                {listing.isFullCash && (
                  <p className="text-emerald-700 font-medium">✓ Full Cash Payment Available</p>
                )}
              </div>
            </div>
          )}

          {/* Contact CTA */}
          <div className="bg-[#F5F0E6] p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Interested in this property?</h3>
            <p className="text-gray-700 mb-4">
              Contact us today to schedule a viewing or get more information about this listing.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="px-6 py-3 bg-[#B87333] text-white rounded hover:bg-[#A0632D] transition-colors">
                Contact Agent
              </button>
              <button className="px-6 py-3 border border-[#B87333] text-[#B87333] rounded hover:bg-[#B87333] hover:text-white transition-colors">
                Schedule Viewing
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ListingDetail;
