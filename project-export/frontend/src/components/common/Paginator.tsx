import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginatorProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxDisplayed?: number;
}

const Paginator: React.FC<PaginatorProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxDisplayed = 5,
}) => {
  // Don't render if there's only one page
  if (totalPages <= 1) return null;

  // Calculate which page numbers to display
  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    
    // Always show first page
    pageNumbers.push(1);
    
    // Calculate start and end of the middle section
    let startPage = Math.max(2, currentPage - Math.floor(maxDisplayed / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxDisplayed - 3);
    
    // Adjust start if end is too close to totalPages
    if (endPage >= totalPages - 1) {
      startPage = Math.max(2, totalPages - maxDisplayed + 1);
    }
    
    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pageNumbers.push("...");
    }
    
    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pageNumbers.push("...");
    }
    
    // Always show last page if more than 1 page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center space-x-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pageNumbers.map((page, index) => {
        if (page === "...") {
          return (
            <Button
              key={`ellipsis-${index}`}
              variant="ghost"
              size="icon"
              disabled
              className="cursor-default"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          );
        }

        const pageNum = page as number;
        return (
          <Button
            key={pageNum}
            variant={pageNum === currentPage ? "default" : "outline"}
            onClick={() => onPageChange(pageNum)}
            className={pageNum === currentPage ? "bg-primary hover:bg-primary/90" : ""}
          >
            {pageNum}
          </Button>
        );
      })}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default Paginator;