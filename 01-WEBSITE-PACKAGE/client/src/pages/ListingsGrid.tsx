
import React, { useEffect, useState } from "react";
import ListingCard from "../components/properties/ListingCard";
import { Button } from "@/components/ui/button";

interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  photos: string[];
}

const ITEMS_PER_PAGE = 12;

const ListingsPage = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [displayedListings, setDisplayedListings] = useState<Listing[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    updateDisplayedListings();
  }, [listings, currentPage]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/listings");
      const data = await res.json();
      setListings(data);
      setHasMore(data.length > ITEMS_PER_PAGE);
    } catch (error) {
      console.error("Failed to fetch listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateDisplayedListings = () => {
    const endIndex = currentPage * ITEMS_PER_PAGE;
    const newDisplayed = listings.slice(0, endIndex);
    setDisplayedListings(newDisplayed);
    setHasMore(endIndex < listings.length);
  };

  const loadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedListings.map((listing, index) => (
          <ListingCard key={listing.id} listing={listing} priority={index < 4} />
        ))}
      </div>
      
      {loading && (
        <div className="flex justify-center mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {hasMore && !loading && (
        <div className="flex justify-center mt-8">
          <Button onClick={loadMore} variant="outline" size="lg">
            Load More Listings ({listings.length - displayedListings.length} remaining)
          </Button>
        </div>
      )}
      
      {!hasMore && displayedListings.length > 0 && (
        <div className="text-center mt-8 text-gray-500">
          All listings loaded ({displayedListings.length} total)
        </div>
      )}
    </div>
  );
};

export default ListingsPage;
