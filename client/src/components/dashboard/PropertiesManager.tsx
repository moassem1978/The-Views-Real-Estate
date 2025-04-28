import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Property } from "../../types";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, MoreHorizontal, Plus, Search, Edit, Star, Trash2, Filter, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import PropertyForm from "./PropertyForm";

export default function PropertiesManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [listingTypeFilter, setListingTypeFilter] = useState<string>("all");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("");
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  
  const pageSize = 10;

  // Fetch properties with search and filters
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/properties", page, searchQuery, listingTypeFilter, propertyTypeFilter, cityFilter],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('pageSize', pageSize.toString());
      
      if (searchQuery) {
        queryParams.append('search', searchQuery);
      }
      
      if (listingTypeFilter && listingTypeFilter !== 'all') {
        queryParams.append('listingType', listingTypeFilter);
      }
      
      if (propertyTypeFilter && propertyTypeFilter !== 'all') {
        queryParams.append('propertyType', propertyTypeFilter);
      }
      
      if (cityFilter) {
        queryParams.append('city', cityFilter);
      }
      
      const response = await apiRequest("GET", `/api/properties?${queryParams.toString()}`);
      return response.json();
    },
  });

  // Delete property mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/properties/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Property deleted",
        description: "The property has been successfully deleted.",
      });
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete property",
        variant: "destructive",
      });
    },
  });

  // Toggle featured property mutation
  const toggleFeatureMutation = useMutation({
    mutationFn: async ({ id, isFeatured }: { id: number, isFeatured: boolean }) => {
      const response = await apiRequest("PATCH", `/api/properties/${id}`, {
        isFeatured,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Property updated",
        description: "The property has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update property",
        variant: "destructive",
      });
    },
  });

  // Toggle highlighted property mutation
  const toggleHighlightMutation = useMutation({
    mutationFn: async ({ id, isHighlighted }: { id: number, isHighlighted: boolean }) => {
      const response = await apiRequest("PATCH", `/api/properties/${id}`, {
        isHighlighted,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Property updated",
        description: "The property has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update property",
        variant: "destructive",
      });
    },
  });

  // Handle edit property
  const handleEditProperty = async (id: number) => {
    try {
      // Log the intent to edit
      console.log("Setting property for edit, ID:", id);
      
      // Check if the property exists in the current properties array
      const propertyExists = properties?.data?.some(p => p.id === id);
      
      if (!propertyExists) {
        console.warn(`Property ID ${id} not found in current properties list`);
        
        // Double-check with the server directly
        try {
          const response = await fetch(`/api/properties/${id}`, {
            credentials: "include",
            headers: {
              'Accept': 'application/json',
              'Cache-Control': 'no-cache',
            }
          });
          
          if (response.status === 404) {
            toast({
              title: "Property not found",
              description: `The property with ID ${id} doesn't exist or was deleted.`,
              variant: "destructive",
            });
            return;
          }
          
          if (!response.ok) {
            throw new Error(`Error checking property: ${response.status}`);
          }
          
          // Property exists, continue with edit
          console.log(`Property ${id} verified with server`);
        } catch (checkError) {
          console.error("Error verifying property:", checkError);
          // Property verification failed, but we'll continue anyway
          // The PropertyForm will handle detailed error presentation
        }
      }
      
      // Set the ID and show the form - the PropertyForm will handle detailed fetching
      setEditingPropertyId(id);
      setShowPropertyForm(true);
      
      // Pre-invalidate the query to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["/api/properties", id] });
    } catch (error) {
      console.error("Error preparing property edit:", error);
      toast({
        title: "Error",
        description: "Failed to prepare property edit. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle delete property
  const handleDeleteProperty = (property: Property) => {
    setPropertyToDelete(property);
    setDeleteDialogOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (propertyToDelete) {
      deleteMutation.mutate(propertyToDelete.id);
    }
  };

  // Property modal
  const PropertyModal = () => (
    <Dialog open={showPropertyForm} onOpenChange={setShowPropertyForm}>
      <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingPropertyId ? "Edit Property" : "Add New Property"}</DialogTitle>
          <DialogDescription>
            {editingPropertyId 
              ? "Update the property information below" 
              : "Fill in the details to create a new property listing"
            }
          </DialogDescription>
        </DialogHeader>
        <PropertyForm 
          propertyId={editingPropertyId || undefined} 
          onSuccess={() => {
            setShowPropertyForm(false);
            setEditingPropertyId(null);
          }}
          onCancel={() => {
            setShowPropertyForm(false);
            setEditingPropertyId(null);
          }}
        />
      </DialogContent>
    </Dialog>
  );

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setListingTypeFilter("all");
    setPropertyTypeFilter("all");
    setCityFilter("");
    setPage(1);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
    // The query will be updated in the state already
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-[#B87333]" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Failed to load properties</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/properties"] })}>
          Try Again
        </Button>
      </div>
    );
  }

  const properties = data?.data || [];
  const totalCount = data?.totalCount || 0;
  const pageCount = data?.pageCount || 1;

  return (
    <div className="space-y-6">
      {/* Property form modal */}
      <PropertyModal />
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the property "{propertyToDelete?.title}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Header with add button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Properties</h2>
          <p className="text-muted-foreground">
            Manage property listings ({totalCount} total)
          </p>
        </div>
        <Button 
          className="bg-[#B87333] hover:bg-[#964B00]"
          onClick={() => {
            setEditingPropertyId(null);
            setShowPropertyForm(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Property
        </Button>
      </div>
      
      {/* Search and filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </form>
        </div>
        
        <div>
          <Select
            value={listingTypeFilter}
            onValueChange={setListingTypeFilter}
          >
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Listing Type" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Listing Types</SelectItem>
              <SelectItem value="Primary">Primary</SelectItem>
              <SelectItem value="Resale">Resale</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select
            value={propertyTypeFilter}
            onValueChange={setPropertyTypeFilter}
          >
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Property Type" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Property Types</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="penthouse">Penthouse</SelectItem>
              <SelectItem value="villa">Villa</SelectItem>
              <SelectItem value="twinhouse">Twinhouse</SelectItem>
              <SelectItem value="townhouse">Townhouse</SelectItem>
              <SelectItem value="chalet">Chalet</SelectItem>
              <SelectItem value="office">Office</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Results table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Price (L.E)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-muted-foreground">No properties found</p>
                  {(searchQuery || listingTypeFilter || propertyTypeFilter || cityFilter) && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={resetFilters}
                      className="mt-2"
                    >
                      Clear Filters
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              properties.map((property: Property) => (
                <TableRow key={property.id}>
                  <TableCell className="font-medium">{property.title}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{property.listingType || property.listing_type}</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {property.propertyType || property.property_type || "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{property.city}</span>
                      <span className="text-xs text-muted-foreground">
                        {property.projectName || property.project_name || "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {property.price?.toLocaleString()}
                    {(property.listingType === 'Primary' || property.listing_type === 'Primary') && (
                      <div className="text-xs text-muted-foreground">
                        {property.downPayment || property.down_payment 
                          ? `Down: ${(property.downPayment || property.down_payment)?.toLocaleString()}`
                          : "Full payment"
                        }
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(property.isFeatured || property.is_featured) && (
                        <Badge variant="outline" className="border-[#B87333] text-[#B87333]">
                          Featured
                        </Badge>
                      )}
                      {(property.isHighlighted || property.is_highlighted) && (
                        <Badge variant="outline" className="border-[#B87333] text-[#B87333]">
                          Highlighted
                        </Badge>
                      )}
                      {(property.isNewListing || property.is_new_listing) && (
                        <Badge variant="outline" className="border-green-500 text-green-500">
                          New
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => window.open(`/properties/${property.id}`, '_blank')}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleEditProperty(property.id)}
                          className="flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => toggleFeatureMutation.mutate({
                            id: property.id,
                            isFeatured: !(property.isFeatured || property.is_featured),
                          })}
                          className="flex items-center gap-2"
                        >
                          <Star className="h-4 w-4" />
                          {(property.isFeatured || property.is_featured) ? "Unmark Featured" : "Mark as Featured"}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => toggleHighlightMutation.mutate({
                            id: property.id,
                            isHighlighted: !(property.isHighlighted || property.is_highlighted),
                          })}
                          className="flex items-center gap-2"
                        >
                          <Star className="h-4 w-4" />
                          {(property.isHighlighted || property.is_highlighted) ? "Unmark Highlighted" : "Mark as Highlighted"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteProperty(property)}
                          className="text-red-500 flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
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
      {pageCount > 1 && (
        <Pagination className="justify-center">
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="gap-1 pl-2.5"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>
            </PaginationItem>
            
            {Array.from({ length: Math.min(5, pageCount) }).map((_, i) => {
              let pageNumber: number;
              
              // Logic to show paginated pages around current
              if (pageCount <= 5) {
                pageNumber = i + 1;
              } else if (page <= 3) {
                pageNumber = i + 1;
              } else if (page >= pageCount - 2) {
                pageNumber = pageCount - 4 + i;
              } else {
                pageNumber = page - 2 + i;
              }
              
              if (pageNumber > pageCount) return null;
              
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    isActive={pageNumber === page}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            {pageCount > 5 && page < pageCount - 2 && (
              <>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink onClick={() => setPage(pageCount)}>
                    {pageCount}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}
            
            <PaginationItem>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(pageCount, page + 1))}
                disabled={page === pageCount}
                className="gap-1 pr-2.5"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}