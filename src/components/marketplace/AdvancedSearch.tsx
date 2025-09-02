import { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';

interface ProductCategory {
  id: string;
  name: string;
  description?: string;
}

interface SearchFilters {
  searchTerm: string;
  categoryId: string;
  minPrice: number;
  maxPrice: number;
  condition: string;
  inStockOnly: boolean;
  rating: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface AdvancedSearchProps {
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
}

export default function AdvancedSearch({ onFiltersChange, onSearch }: AdvancedSearchProps) {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    categoryId: '',
    minPrice: 0,
    maxPrice: 10000,
    condition: '',
    inStockOnly: false,
    rating: 0,
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const updatedFilters = {
      ...filters,
      minPrice: priceRange[0],
      maxPrice: priceRange[1]
    };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  }, [priceRange]);

  const fetchCategories = async () => {
    // Use hardcoded categories until migration is executed
    const defaultCategories = [
      { id: '1', name: 'Electronics', description: 'Electronic devices and gadgets' },
      { id: '2', name: 'Clothing', description: 'Apparel and accessories' },
      { id: '3', name: 'Home & Garden', description: 'Home improvement and garden supplies' },
      { id: '4', name: 'Books', description: 'Books and educational materials' },
      { id: '5', name: 'Sports', description: 'Sports and fitness equipment' }
    ];
    setCategories(defaultCategories);
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      searchTerm: '',
      categoryId: '',
      minPrice: 0,
      maxPrice: 10000,
      condition: '',
      inStockOnly: false,
      rating: 0,
      sortBy: 'created_at',
      sortOrder: 'desc'
    };
    setFilters(clearedFilters);
    setPriceRange([0, 10000]);
    onFiltersChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.categoryId) count++;
    if (filters.minPrice > 0 || filters.maxPrice < 10000) count++;
    if (filters.condition) count++;
    if (filters.inStockOnly) count++;
    if (filters.rating > 0) count++;
    return count;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Advanced Search
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {getActiveFiltersCount()}
                </Badge>
              )}
              <ChevronDown className={`h-4 w-4 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
            </Button>
            {getActiveFiltersCount() > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Term */}
        <div className="flex gap-2">
          <Input
            placeholder="Search products..."
            value={filters.searchTerm}
            onChange={(e) => updateFilter('searchTerm', e.target.value)}
            className="flex-1"
          />
          <Button onClick={onSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <CollapsibleContent className="space-y-4">
            {/* Category and Sort */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={filters.categoryId} onValueChange={(value) => updateFilter('categoryId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Newest First</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="title">Name</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="view_count">Popularity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Order</label>
                <Select value={filters.sortOrder} onValueChange={(value: 'asc' | 'desc') => updateFilter('sortOrder', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Price Range: RM{priceRange[0]} - RM{priceRange[1]}
              </label>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={10000}
                min={0}
                step={10}
                className="w-full"
              />
            </div>

            {/* Condition and Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Condition</label>
                <Select value={filters.condition} onValueChange={(value) => updateFilter('condition', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any condition</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="like_new">Like New</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
                <Select value={filters.rating.toString()} onValueChange={(value) => updateFilter('rating', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Any rating</SelectItem>
                    <SelectItem value="1">1+ stars</SelectItem>
                    <SelectItem value="2">2+ stars</SelectItem>
                    <SelectItem value="3">3+ stars</SelectItem>
                    <SelectItem value="4">4+ stars</SelectItem>
                    <SelectItem value="5">5 stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Stock Filter */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="inStockOnly"
                checked={filters.inStockOnly}
                onChange={(e) => updateFilter('inStockOnly', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="inStockOnly" className="text-sm">
                Show only items in stock
              </label>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}