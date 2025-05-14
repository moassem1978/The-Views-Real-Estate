import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Edit, 
  MoreVertical, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Star, 
  Calendar, 
  MessageSquare,
  Loader2
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface AnnouncementsManagerProps {
  onAddClick: () => void;
  onEditClick: (id: number) => void;
}

export default function AnnouncementsManager({ onAddClick, onEditClick }: AnnouncementsManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Delete confirmation state
  const [deleteAnnouncementId, setDeleteAnnouncementId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Fetch announcements
  const { 
    data: announcementsData, 
    isLoading: isLoadingAnnouncements,
    isError 
  } = useQuery({
    queryKey: ['/api/announcements', currentPage, pageSize],
    queryFn: async () => {
      const response = await fetch(`/api/announcements?page=${currentPage}&limit=${pageSize}`);
      if (!response.ok) {
        throw new Error('Failed to fetch announcements');
      }
      return response.json();
    },
  });
  
  // Delete announcement mutation
  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/announcements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/announcements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/announcements/highlighted'] });
      queryClient.invalidateQueries({ queryKey: ['/api/announcements/featured'] });
      
      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      });
      
      // Reset delete state
      setDeleteAnnouncementId(null);
      setShowDeleteDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete announcement",
        variant: "destructive",
      });
    },
  });
  
  // Toggle highlight/feature mutation
  const toggleAnnouncementFeatureMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: number; field: string; value: boolean }) => {
      return apiRequest('PATCH', `/api/announcements/${id}`, { [field]: value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/announcements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/announcements/highlighted'] });
      queryClient.invalidateQueries({ queryKey: ['/api/announcements/featured'] });
      
      toast({
        title: "Success",
        description: "Announcement updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update announcement",
        variant: "destructive",
      });
    },
  });
  
  // Handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleDeleteClick = (id: number) => {
    setDeleteAnnouncementId(id);
    setShowDeleteDialog(true);
  };
  
  const handleConfirmDelete = () => {
    if (deleteAnnouncementId) {
      deleteAnnouncementMutation.mutate(deleteAnnouncementId);
    }
  };
  
  const handleToggleFeature = (id: number, featured: boolean) => {
    toggleAnnouncementFeatureMutation.mutate({
      id,
      field: 'isFeatured',
      value: !featured,
    });
  };
  
  const handleToggleHighlight = (id: number, highlighted: boolean) => {
    toggleAnnouncementFeatureMutation.mutate({
      id,
      field: 'isHighlighted',
      value: !highlighted,
    });
  };
  
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Render pagination
  const renderPagination = () => {
    if (!announcementsData || !announcementsData.pageCount) return null;
    
    const pageCount = announcementsData.pageCount;
    const pages = [];
    
    // Previous button
    pages.push(
      <PaginationItem key="prev">
        <PaginationPrevious 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            if (currentPage > 1) handlePageChange(currentPage - 1);
          }}
          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
        />
      </PaginationItem>
    );
    
    // Page numbers
    for (let i = 1; i <= pageCount; i++) {
      // Show first, last, and pages around current page
      if (
        i === 1 || 
        i === pageCount || 
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(i);
              }}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      } else if (
        (i === currentPage - 2 && currentPage > 3) || 
        (i === currentPage + 2 && currentPage < pageCount - 2)
      ) {
        pages.push(
          <PaginationItem key={`ellipsis-${i}`}>
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }
    
    // Next button
    pages.push(
      <PaginationItem key="next">
        <PaginationNext 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            if (currentPage < pageCount) handlePageChange(currentPage + 1);
          }}
          className={currentPage === pageCount ? "pointer-events-none opacity-50" : ""}
        />
      </PaginationItem>
    );
    
    return <PaginationContent>{pages}</PaginationContent>;
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Announcements</CardTitle>
          <CardDescription>
            Manage site announcements and promotional content
          </CardDescription>
        </div>
        <Button className="bg-[#B87333] hover:bg-[#964B00]" onClick={onAddClick}>
          <Plus className="mr-2 h-4 w-4" /> Add Announcement
        </Button>
      </CardHeader>
      <CardContent>
        {/* Filters and search */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Select 
              value={pageSize.toString()} 
              onValueChange={(value) => {
                setPageSize(parseInt(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="10 per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 per page</SelectItem>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="20">20 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search announcements..."
              className="w-[250px]"
              // TODO: Implement search functionality
            />
          </div>
        </div>
        
        {/* Announcements Table */}
        {isLoadingAnnouncements ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-red-500">
            Error loading announcements. Please try again.
          </div>
        ) : announcementsData?.data?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No announcements found. Click "Add Announcement" to create one.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="text-center">Featured</TableHead>
                  <TableHead className="text-center">Highlighted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcementsData?.data?.map((announcement: any) => (
                  <TableRow key={announcement.id}>
                    <TableCell className="font-medium">
                      {announcement.title}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          announcement.status === 'active' 
                            ? 'default' 
                            : announcement.status === 'draft'
                            ? 'outline'
                            : 'secondary'
                        }
                      >
                        {announcement.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(announcement.startDate)}
                    </TableCell>
                    <TableCell>
                      {formatDate(announcement.endDate)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleFeature(announcement.id, announcement.isFeatured)}
                        title={announcement.isFeatured ? "Remove from featured" : "Add to featured"}
                      >
                        {announcement.isFeatured ? (
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ) : (
                          <Star className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {announcement.isFeatured ? "Featured" : "Not featured"}
                        </span>
                      </Button>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleHighlight(announcement.id, announcement.isHighlighted)}
                        title={announcement.isHighlighted ? "Remove from highlighted" : "Add to highlighted"}
                      >
                        {announcement.isHighlighted ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="sr-only">
                          {announcement.isHighlighted ? "Highlighted" : "Not highlighted"}
                        </span>
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onEditClick(announcement.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(announcement.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Pagination */}
        {announcementsData?.data?.length > 0 && (
          <div className="mt-4">
            <Pagination>
              {renderPagination()}
            </Pagination>
            <div className="text-xs text-muted-foreground mt-2 text-center">
              Showing {announcementsData?.data?.length} of {announcementsData?.totalCount} announcements
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this announcement? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteAnnouncementMutation.isPending}
            >
              {deleteAnnouncementMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}