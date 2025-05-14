import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Loader2, MoreHorizontal, Search, Edit, Star, Trash2, Plus, Calendar, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AnnouncementsManagerProps {
  onEditAnnouncement?: (announcementId: number) => void;
}

// Main component for managing announcements
export default function AnnouncementsManager({ onEditAnnouncement }: AnnouncementsManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State variables
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Fetch announcements with pagination and search
  const { data, isLoading: isLoadingAnnouncements, error } = useQuery({
    queryKey: ['/api/announcements', currentPage, searchQuery],
    queryFn: async () => {
      let url = `/api/announcements?page=${currentPage}&pageSize=10`;
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch announcements');
      }
      return response.json();
    },
  });
  
  // Toggle featured status mutation
  const toggleFeatureMutation = useMutation({
    mutationFn: async (announcementId: number) => {
      const announcement = data?.data.find((a: any) => a.id === announcementId);
      if (!announcement) return;
      
      return apiRequest('PUT', `/api/announcements/${announcementId}`, {
        ...announcement,
        isFeatured: !announcement.isFeatured
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/announcements'] });
      toast({
        title: "Success",
        description: "Announcement status updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update announcement",
        variant: "destructive",
      });
    }
  });
  
  // Toggle highlighted status mutation
  const toggleHighlightMutation = useMutation({
    mutationFn: async (announcementId: number) => {
      const announcement = data?.data.find((a: any) => a.id === announcementId);
      if (!announcement) return;
      
      return apiRequest('PUT', `/api/announcements/${announcementId}`, {
        ...announcement,
        isHighlighted: !announcement.isHighlighted
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/announcements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/announcements/highlighted'] });
      toast({
        title: "Success",
        description: "Announcement highlight status updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update announcement",
        variant: "destructive",
      });
    }
  });
  
  // Delete announcement mutation
  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (announcementId: number) => {
      return apiRequest('DELETE', `/api/announcements/${announcementId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/announcements'] });
      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      });
      setShowDeleteDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete announcement",
        variant: "destructive",
      });
      setShowDeleteDialog(false);
    }
  });
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };
  
  // Handle edit click
  const handleEdit = (announcementId: number) => {
    if (onEditAnnouncement) {
      onEditAnnouncement(announcementId);
    }
  };
  
  // Initialize delete dialog
  const handleDelete = (announcementId: number) => {
    setDeleteId(announcementId);
    setShowDeleteDialog(true);
  };
  
  // Confirm and execute deletion
  const confirmDelete = () => {
    if (deleteId) {
      deleteAnnouncementMutation.mutate(deleteId);
    }
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // View announcement details
  const handleViewDetails = (announcementId: number) => {
    window.open(`/announcements/${announcementId}`, '_blank');
  };
  
  // Render loading state
  if (isLoadingAnnouncements) {
    return (
      <div className="w-full py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md">
        An error occurred while loading announcements. Please try again.
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Search and filters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search announcements..."
              className="pl-8 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            type="submit" 
            className="whitespace-nowrap bg-[#B87333] hover:bg-[#964B00]"
          >
            Search
          </Button>
        </form>
      </div>
      
      {/* Announcements table */}
      <div className="bg-white rounded-md shadow">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No announcements found. Create your first announcement to get started.
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.map((announcement: any) => (
                <TableRow key={announcement.id}>
                  <TableCell className="font-medium max-w-xs truncate">
                    {announcement.title}
                  </TableCell>
                  <TableCell className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4 text-gray-500" />
                    <span>{formatDate(announcement.createdAt)}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {announcement.isFeatured && (
                        <Badge className="bg-[#B87333]">Featured</Badge>
                      )}
                      {announcement.isHighlighted && (
                        <Badge variant="outline" className="border-[#B87333] text-[#B87333]">
                          Highlighted
                        </Badge>
                      )}
                      {!announcement.isFeatured && !announcement.isHighlighted && (
                        <Badge variant="outline">Standard</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[180px]">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewDetails(announcement.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(announcement.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleFeatureMutation.mutate(announcement.id)}>
                          <Star className={`mr-2 h-4 w-4 ${announcement.isFeatured ? "text-yellow-500 fill-yellow-500" : ""}`} />
                          {announcement.isFeatured ? "Unfeature" : "Feature"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleHighlightMutation.mutate(announcement.id)}>
                          <Star className={`mr-2 h-4 w-4 ${announcement.isHighlighted ? "text-blue-500 fill-blue-500" : ""}`} />
                          {announcement.isHighlighted ? "Unhighlight" : "Highlight"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(announcement.id)}
                          className="text-red-600 hover:text-red-700 focus:text-red-700"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {data?.pageCount > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) {
                    handlePageChange(currentPage - 1);
                  }
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {Array.from({ length: Math.min(5, data.pageCount) }, (_, i) => {
              let pageNum;
              if (data.pageCount <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= data.pageCount - 2) {
                pageNum = data.pageCount - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(pageNum);
                    }}
                    isActive={pageNum === currentPage}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            {data.pageCount > 5 && currentPage < data.pageCount - 2 && (
              <>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(data.pageCount);
                    }}
                  >
                    {data.pageCount}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}
            
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < data.pageCount) {
                    handlePageChange(currentPage + 1);
                  }
                }}
                className={currentPage === data.pageCount ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this announcement. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleteAnnouncementMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}