"use client";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

/**
 * Interface for search and filters props
 */
interface SearchFiltersProps {
  isLoading?: boolean;
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
  showAchieved?: boolean;
  setShowAchieved?: (show: boolean) => void;
}

/**
 * Component for search and filters that can be used both during loading and after loading
 */
const SearchFilters = ({ isLoading = false, searchTerm = "", setSearchTerm = () => {}, showAchieved = false, setShowAchieved = () => {} }: SearchFiltersProps) => {
  return (
    <div className='mx-auto py-8 max-w-2xl'>
      <div className='flex w-full items-center space-x-2'>
        <Input type='text' placeholder='Search challenges...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} disabled={isLoading} className='flex-grow' />
      </div>
      <div className='flex items-center space-x-2 mt-4'>
        <Switch id='show-achieved' checked={showAchieved} onCheckedChange={setShowAchieved} disabled={isLoading} />
        <Label htmlFor='show-achieved' className={isLoading ? "text-muted-foreground" : ""}>
          Show achieved challenges
        </Label>
      </div>
    </div>
  );
};

export default SearchFilters;
