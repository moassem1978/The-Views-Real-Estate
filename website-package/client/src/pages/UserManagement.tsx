import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User } from '@/types';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Home } from 'lucide-react';

// Components from shadcn
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Separator } from '@/components/ui/separator';

// Form schema for creating a new user
const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().optional(),
  role: z.enum(['user', 'admin', 'owner']),
  isAgent: z.boolean().default(false),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

export default function UserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('list');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  // Form for creating new users
  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      fullName: '',
      phone: '',
      role: 'user',
      isAgent: false,
    },
  });

  // Fetch users
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/users');
      return await res.json();
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserFormValues) => {
      const res = await apiRequest('POST', '/api/users', userData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      form.reset();
      setActiveTab('list');
      toast({
        title: 'User created successfully',
        description: 'The new user has been added to the system.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create user',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Toggle user active status mutation
  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await apiRequest('PATCH', `/api/users/${id}`, { isActive });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: 'User status updated',
        description: 'The user status has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update user status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update user role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: number; role: string }) => {
      const res = await apiRequest('PATCH', `/api/users/${id}`, { role });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: 'User role updated',
        description: 'The user role has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update user role',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Function to handle form submission
  function onSubmit(values: CreateUserFormValues) {
    createUserMutation.mutate(values);
  }

  // Filter users by role if a role is selected
  const filteredUsers = selectedRole
    ? users?.filter(user => user.role === selectedRole)
    : users;

  // Function to get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Check if the current user can manage a specific user role
  // Owner can manage all, admin can manage users
  const canManageRole = (role: string) => {
    if (currentUser?.role === 'owner') return true;
    if (currentUser?.role === 'admin' && role === 'user') return true;
    return false;
  };

  // Check if the current user can change active status
  const canToggleStatus = (userToEdit: User) => {
    return canManageRole(userToEdit.role) && userToEdit.id !== currentUser?.id;
  };

  // Check if the current user can change the role of another user
  const canChangeRole = (userToEdit: User) => {
    return canManageRole(userToEdit.role) && userToEdit.id !== currentUser?.id;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back to Website button at the top */}
      <div className="mb-6">
        <Button 
          variant="outline" 
          className="bg-cream hover:bg-cream-dark text-copper"
          onClick={() => setLocation("/")}
        >
          <Home className="mr-2 h-4 w-4" />
          Back to Website
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-rich-black mb-2">User Management</h1>
          <p className="text-rich-black-light mb-4">
            Create, view, and manage users in The Views Real Estate platform.
          </p>
        </div>
        
        {(currentUser?.role === 'owner' || currentUser?.role === 'admin') && (
          <Button 
            className="bg-copper hover:bg-copper-dark text-white" 
            onClick={() => setActiveTab('create')}
          >
            Add New User
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="border border-copper/20">
          <TabsTrigger value="list">User List</TabsTrigger>
          {(currentUser?.role === 'owner' || currentUser?.role === 'admin') && (
            <TabsTrigger value="create">Create User</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          <Card className="border-copper/10">
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Manage existing users and their permissions</CardDescription>
              
              <div className="mt-4">
                <Label htmlFor="filter-role" className="mb-2 block text-sm font-medium">
                  Filter by Role:
                </Label>
                <ToggleGroup 
                  type="single" 
                  value={selectedRole || ''} 
                  onValueChange={(value) => setSelectedRole(value || null)}
                  className="justify-start"
                >
                  <ToggleGroupItem value="owner" className="text-sm">
                    Owner
                  </ToggleGroupItem>
                  <ToggleGroupItem value="admin" className="text-sm">
                    Admin
                  </ToggleGroupItem>
                  <ToggleGroupItem value="user" className="text-sm">
                    User
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </CardHeader>
            
            <CardContent>
              {isLoadingUsers ? (
                <div className="text-center py-4">Loading users...</div>
              ) : filteredUsers && filteredUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.fullName}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`user-status-${user.id}`}
                                checked={user.isActive !== false}
                                disabled={!canToggleStatus(user)}
                                onCheckedChange={(isActive) => {
                                  toggleUserStatusMutation.mutate({
                                    id: user.id,
                                    isActive
                                  });
                                }}
                              />
                              <Label htmlFor={`user-status-${user.id}`} className="text-sm">
                                {user.isActive !== false ? 'Active' : 'Inactive'}
                              </Label>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {canChangeRole(user) && (
                              <Select
                                disabled={!canChangeRole(user)}
                                value={user.role}
                                onValueChange={(newRole) => {
                                  updateUserRoleMutation.mutate({
                                    id: user.id,
                                    role: newRole
                                  });
                                }}
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue placeholder="Change Role" />
                                </SelectTrigger>
                                <SelectContent>
                                  {currentUser?.role === 'owner' && (
                                    <>
                                      <SelectItem value="admin">Admin</SelectItem>
                                      <SelectItem value="user">User</SelectItem>
                                    </>
                                  )}
                                  {currentUser?.role === 'admin' && (
                                    <SelectItem value="user">User</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 border rounded-md bg-gray-50">
                  <p className="text-rich-black-light">No users found</p>
                  {selectedRole && (
                    <p className="text-sm mt-1">Try selecting a different role filter</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="create">
          <Card className="border-copper/10">
            <CardHeader>
              <CardTitle>Create New User</CardTitle>
              <CardDescription>Add a new user to the platform with specific permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="johndoe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone (Optional)</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="+20 123 456 7890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {currentUser?.role === 'owner' && (
                                <>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="user">User</SelectItem>
                                </>
                              )}
                              {currentUser?.role === 'admin' && (
                                <SelectItem value="user">User</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <FormField
                    control={form.control}
                    name="isAgent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Property Agent</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Mark this user as a property agent who can be assigned to property listings.
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <CardFooter className="px-0 flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab('list')}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-copper hover:bg-copper-dark text-white"
                      disabled={createUserMutation.isPending}
                    >
                      {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}