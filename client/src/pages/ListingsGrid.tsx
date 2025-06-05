import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ListingCard from "../components/properties/ListingCard";
import { Property } from "../types";
import { Loader2 } from "lucide-react";

interface ListingsResponse {
  data: Property[];
  totalCount: number;
  pageCount: number;
  page: number;
  pageSize: number;
}

const ListingsGrid = () => {
  const [page, setPage] = useState(1);
  const pageSize = 24;

  const { data: listings, isLoading, error } = useQuery<ListingsResponse>({
    queryKey: ['listings', page, pageSize],
    queryFn: async () => {
      const response = await fetch(`/api/listings?page=${page}&pageSize=${pageSize}`);
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#B87333]" />
        <span className="ml-2 text-[#B87333]">Loading listings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Listings</h2>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Property Listings</h1>
        <p className="text-gray-600">
          Showing {listings?.data.length || 0} of {listings?.totalCount || 0} properties
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {listings?.data.map(listing => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      {/* Pagination */}
      {listings && listings.pageCount > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-[#B87333] text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#A0632D] transition-colors"
          >
            Previous
          </button>

          <span className="px-4 py-2 bg-gray-100 rounded">
            Page {page} of {listings.pageCount}
          </span>

          <button
            onClick={() => setPage(Math.min(listings.pageCount, page + 1))}
            disabled={page === listings.pageCount}
            className="px-4 py-2 bg-[#B87333] text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#A0632D] transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ListingsGrid;