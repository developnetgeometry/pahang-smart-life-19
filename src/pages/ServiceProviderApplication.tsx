import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Building, CheckCircle, Upload, X } from 'lucide-react';

// Categories and business types will be fetched from database

export default function ServiceProviderApplication() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serviceCategories, setServiceCategories] = useState<string[]>([]);
  const [businessTypes, setBusinessTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  useEffect(() => {
    fetchServiceCategories();
    fetchBusinessTypes();
  }, []);

  const fetchServiceCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setServiceCategories(data?.map(cat => cat.name) || []);
    } catch (error) {
      console.error('Error fetching service categories:', error);
      toast.error('Failed to load service categories');
    }
  };

  const fetchBusinessTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('business_types')
        .select('name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setBusinessTypes(data?.map(type => type.name) || []);
    } catch (error) {
      console.error('Error fetching business types:', error);
      toast.error('Failed to load business types');
    }
  };

  const [formData, setFormData] = useState({
    // Business Information
    businessName: '',
    businessType: '',
    businessDescription: '',
    businessRegistrationNumber: '',
    taxId: '',
    
    // Contact Information
    contactPerson: '',
    contactPhone: '',
    contactEmail: user?.email || '',
    businessAddress: '',
    
    // Services
    customService: '',
    
    // Additional Information
    websiteUrl: '',
    experienceYears: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addCustomService = () => {
    if (formData.customService.trim()) {
      setSelectedServices(prev => [...prev, formData.customService.trim()]);
      setFormData(prev => ({ ...prev, customService: '' }));
    }
  };

  const removeService = (service: string) => {
    setSelectedServices(prev => prev.filter(s => s !== service));
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to submit an application');
      return;
    }

    // Validation
    if (!formData.businessName.trim()) {
      toast.error('Business name is required');
      return;
    }

    if (!formData.businessType) {
      toast.error('Business type is required');
      return;
    }

    if (selectedCategories.length === 0) {
      toast.error('Please select at least one service category');
      return;
    }

    setLoading(true);
    
    try {
      const applicationData = {
        applicant_id: user.id,
        district_id: user.active_community_id,
        business_name: formData.businessName,
        business_type: formData.businessType,
        business_description: formData.businessDescription,
        business_registration_number: formData.businessRegistrationNumber || null,
        tax_id: formData.taxId || null,
        contact_person: formData.contactPerson,
        contact_phone: formData.contactPhone,
        contact_email: formData.contactEmail,
        business_address: formData.businessAddress,
        services_offered: selectedServices,
        service_categories: selectedCategories,
        website_url: formData.websiteUrl || null,
        experience_years: formData.experienceYears ? parseInt(formData.experienceYears) : null,
      };

      const { error } = await supabase
        .from('service_provider_applications')
        .insert(applicationData);

      if (error) throw error;

      toast.success('Application submitted successfully!');
      navigate('/my-applications');
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Building className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Service Provider Application</h1>
            <p className="text-muted-foreground">
              Apply to become an approved service provider in your community
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>
              Tell us about your business and what services you provide
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  placeholder="Enter your business name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="businessType">Business Type *</Label>
                <Select value={formData.businessType} onValueChange={(value) => handleInputChange('businessType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="businessDescription">Business Description</Label>
              <Textarea
                id="businessDescription"
                value={formData.businessDescription}
                onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                placeholder="Describe your business, experience, and what makes you unique"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="registrationNumber">Business Registration Number</Label>
                <Input
                  id="registrationNumber"
                  value={formData.businessRegistrationNumber}
                  onChange={(e) => handleInputChange('businessRegistrationNumber', e.target.value)}
                  placeholder="e.g., 202301234567"
                />
              </div>
              
              <div>
                <Label htmlFor="taxId">Tax ID / SSM Number</Label>
                <Input
                  id="taxId"
                  value={formData.taxId}
                  onChange={(e) => handleInputChange('taxId', e.target.value)}
                  placeholder="Enter tax identification number"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              How can customers and administrators contact you?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactPerson">Contact Person *</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                  placeholder="Primary contact name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="contactPhone">Contact Phone *</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  placeholder="e.g., +60123456789"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="business@example.com"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="businessAddress">Business Address *</Label>
              <Textarea
                id="businessAddress"
                value={formData.businessAddress}
                onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                placeholder="Full business address including postcode"
                rows={2}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Services & Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Services & Categories</CardTitle>
            <CardDescription>
              Select the categories and specific services you provide
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Service Categories *</Label>
              <p className="text-xs text-muted-foreground mb-3">
                Select all categories that apply to your business
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {serviceCategories.map(category => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    <Label htmlFor={category} className="text-sm">{category}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Specific Services</Label>
              <p className="text-xs text-muted-foreground mb-3">
                Add specific services you offer within the selected categories
              </p>
              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <Input
                  value={formData.customService}
                  onChange={(e) => handleInputChange('customService', e.target.value)}
                  placeholder="e.g., Plumbing repair, House cleaning, etc."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomService())}
                  className="flex-1"
                />
                <Button type="button" onClick={addCustomService} variant="outline" className="whitespace-nowrap">
                  Add
                </Button>
              </div>
              {selectedServices.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedServices.map(service => (
                    <Badge key={service} variant="secondary" className="flex items-center gap-1">
                      {service}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeService(service)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="experienceYears">Years of Experience</Label>
                <Input
                  id="experienceYears"
                  type="number"
                  min="0"
                  value={formData.experienceYears}
                  onChange={(e) => handleInputChange('experienceYears', e.target.value)}
                  placeholder="e.g., 5"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/')}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full sm:w-auto min-w-[120px]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Submit Application
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}