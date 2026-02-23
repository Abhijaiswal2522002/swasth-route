'use client';

import { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface MedicineSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function MedicineSearch({ onSearch, placeholder = 'Search medicines, symptoms...' }: MedicineSearchProps) {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const handleSearch = useCallback(
    (searchQuery: string) => {
      if (searchQuery.trim()) {
        setRecentSearches((prev) => [searchQuery, ...prev.filter((s) => s !== searchQuery)].slice(0, 5));
        onSearch(searchQuery);
      }
    },
    [onSearch]
  );

  const handleClear = useCallback(() => {
    setQuery('');
  }, []);

  return (
    <div className="w-full space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          className="pl-10 pr-8"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(query);
            }
          }}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Recent Searches */}
      {recentSearches.length > 0 && !query && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase">Recent Searches</p>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search) => (
              <button
                key={search}
                className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => {
                  setQuery(search);
                  handleSearch(search);
                }}
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popular Searches */}
      {!query && recentSearches.length === 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase">Popular</p>
          <div className="flex flex-wrap gap-2">
            {['Paracetamol', 'Ibuprofen', 'Cough Syrup', 'Antacid', 'Allergy Relief'].map((medicine) => (
              <button
                key={medicine}
                className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => {
                  handleSearch(medicine);
                }}
              >
                {medicine}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Button */}
      {query && (
        <Button
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => handleSearch(query)}
        >
          Search
        </Button>
      )}
    </div>
  );
}
