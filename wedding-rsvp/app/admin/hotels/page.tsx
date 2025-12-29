'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Hotel, Plus, Edit, Trash2, Loader2, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface HotelData {
  id: string;
  name: string;
  price_min: number;
  price_max: number;
  proximity: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  website_url: string | null;
  description: string | null;
  is_active: boolean;
  display_order: number;
}

export default function HotelsManagementPage() {
  const { toast } = useToast();
  const [hotels, setHotels] = useState<HotelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<HotelData | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price_min: '',
    price_max: '',
    proximity: '',
    contact_phone: '',
    contact_email: '',
    website_url: '',
    description: '',
  });

  // Get admin email from localStorage when needed
  const getAdminEmail = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminEmail');
    }
    return null;
  };

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    const adminEmail = getAdminEmail();
    if (!adminEmail) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/hotels?email=${adminEmail}`);
      const data = await response.json();
      
      if (response.ok) {
        setHotels(data.hotels || []);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to load hotels",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load hotels",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price_min: '',
      price_max: '',
      proximity: '',
      contact_phone: '',
      contact_email: '',
      website_url: '',
      description: '',
    });
    setEditingHotel(null);
  };

  const handleEdit = (hotel: HotelData) => {
    setEditingHotel(hotel);
    setFormData({
      name: hotel.name,
      price_min: hotel.price_min.toString(),
      price_max: hotel.price_max.toString(),
      proximity: hotel.proximity || '',
      contact_phone: hotel.contact_phone || '',
      contact_email: hotel.contact_email || '',
      website_url: hotel.website_url || '',
      description: hotel.description || '',
    });
    setEditDialogOpen(true);
  };

  const handleSubmit = async () => {
    const adminEmail = getAdminEmail();
    
    if (!formData.name || !formData.price_min) {
      toast({
        title: "Validation Error",
        description: "Name and minimum price are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const method = editingHotel ? 'PUT' : 'POST';
      const response = await fetch('/api/admin/hotels', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail,
          ...(editingHotel && { id: editingHotel.id }),
          name: formData.name,
          price_min: parseFloat(formData.price_min),
          price_max: formData.price_max ? parseFloat(formData.price_max) : parseFloat(formData.price_min),
          proximity: formData.proximity || null,
          contact_phone: formData.contact_phone || null,
          contact_email: formData.contact_email || null,
          website_url: formData.website_url || null,
          description: formData.description || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: editingHotel ? "Hotel updated successfully" : "Hotel added successfully",
        });
        setEditDialogOpen(false);
        resetForm();
        loadHotels();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to save hotel",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const adminEmail = getAdminEmail();
    
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;

    try {
      const response = await fetch('/api/admin/hotels', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail, id }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Hotel deleted successfully",
        });
        loadHotels();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete hotel",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (hotel: HotelData) => {
    const adminEmail = getAdminEmail();
    
    try {
      const response = await fetch('/api/admin/hotels', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail,
          id: hotel.id,
          is_active: !hotel.is_active,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Hotel ${hotel.is_active ? 'deactivated' : 'activated'}`,
        });
        loadHotels();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update hotel status",
        variant: "destructive",
      });
    }
  };

  const handleReorder = async (hotel: HotelData, direction: 'up' | 'down') => {
    const adminEmail = getAdminEmail();
    const currentIndex = hotels.findIndex(h => h.id === hotel.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= hotels.length) return;

    const targetHotel = hotels[targetIndex];

    try {
      await fetch('/api/admin/hotels', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail,
          id: hotel.id,
          display_order: targetHotel.display_order,
        }),
      });

      await fetch('/api/admin/hotels', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail,
          id: targetHotel.id,
          display_order: hotel.display_order,
        }),
      });

      loadHotels();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reorder hotels",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-mahogany-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-serif text-mahogany-800 mb-2">Hotel Management</h1>
          <p className="text-bronze-600">Manage accommodation options for your guests</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-mahogany-700">{hotels.length}</p>
                  <p className="text-sm text-muted-foreground">Total Hotels</p>
                </div>
                <Hotel className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {hotels.filter(h => h.is_active).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
                <Eye className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-red-600">
                    {hotels.filter(h => !h.is_active).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Inactive</p>
                </div>
                <EyeOff className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <Dialog open={editDialogOpen} onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-mahogany-600 hover:bg-mahogany-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Hotel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingHotel ? 'Edit Hotel' : 'Add New Hotel'}</DialogTitle>
                <DialogDescription>
                  {editingHotel ? 'Update hotel information' : 'Add a new accommodation option'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Hotel Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Rusinga Island Lodge"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price_min">Min Price (KES) *</Label>
                    <Input
                      id="price_min"
                      type="number"
                      value={formData.price_min}
                      onChange={(e) => setFormData({ ...formData, price_min: e.target.value })}
                      placeholder="12000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price_max">Max Price (KES)</Label>
                    <Input
                      id="price_max"
                      type="number"
                      value={formData.price_max}
                      onChange={(e) => setFormData({ ...formData, price_max: e.target.value })}
                      placeholder="12000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proximity">Distance from Venue</Label>
                  <Input
                    id="proximity"
                    value={formData.proximity}
                    onChange={(e) => setFormData({ ...formData, proximity: e.target.value })}
                    placeholder="On-site (Wedding Venue)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website_url">Website URL</Label>
                  <Input
                    id="website_url"
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    placeholder="https://www.hotel.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Contact Phone</Label>
                    <Input
                      id="contact_phone"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      placeholder="+254712345678"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      placeholder="info@hotel.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the hotel..."
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} className="bg-mahogany-600 hover:bg-mahogany-700">
                  {editingHotel ? 'Update Hotel' : 'Add Hotel'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Hotels ({hotels.length})</CardTitle>
            <CardDescription>Drag to reorder, or use up/down arrows</CardDescription>
          </CardHeader>
          <CardContent>
            {hotels.length === 0 ? (
              <div className="text-center py-12">
                <Hotel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hotels added yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Add your first accommodation option
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {hotels.map((hotel, index) => (
                  <Card key={hotel.id} className={hotel.is_active ? 'border-bronze-200' : 'border-gray-200 opacity-60'}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReorder(hotel, 'up')}
                            disabled={index === 0}
                            className="h-6 w-6 p-0"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReorder(hotel, 'down')}
                            disabled={index === hotels.length - 1}
                            className="h-6 w-6 p-0"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-mahogany-800">{hotel.name}</h3>
                              <p className="text-sm text-bronze-600">
                                KES {hotel.price_min.toLocaleString()}
                                {hotel.price_max !== hotel.price_min && ` - ${hotel.price_max.toLocaleString()}`}
                                /night
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleActive(hotel)}
                              >
                                {hotel.is_active ? (
                                  <><Eye className="h-4 w-4 mr-1" />Active</>
                                ) : (
                                  <><EyeOff className="h-4 w-4 mr-1" />Inactive</>
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(hotel)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(hotel.id, hotel.name)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {hotel.description && (
                            <p className="text-sm text-muted-foreground mb-2">{hotel.description}</p>
                          )}

                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {hotel.proximity && (
                              <p className="text-bronze-600">📍 {hotel.proximity}</p>
                            )}
                            {hotel.website_url && (
                              <a
                                href={hotel.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-mahogany-600 hover:underline"
                              >
                                🌐 Visit Website
                              </a>
                            )}
                            {hotel.contact_phone && (
                              <p className="text-bronze-600">📞 {hotel.contact_phone}</p>
                            )}
                            {hotel.contact_email && (
                              <p className="text-bronze-600">✉️ {hotel.contact_email}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}