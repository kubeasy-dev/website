"use client"

import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

/**
 * A simplified version of SearchFilters specifically for loading states
 * This prevents issues with passing server functions to client components
 */
export default function SearchFiltersLoading() {
  return (
    <div className="mx-auto py-8 max-w-2xl">
      <div className="flex w-full items-center space-x-2">
        <Input
          type="text"
          placeholder="Search challenges..."
          value=""
          disabled={true}
          className="flex-grow"
        />
      </div>
      <div className="flex items-center space-x-2 mt-4">
        <Switch 
          id="show-achieved" 
          checked={false} 
          disabled={true} 
        />
        <Label 
          htmlFor="show-achieved"
          className="text-muted-foreground"
        >
          Show achieved challenges
        </Label>
      </div>
    </div>
  );
}
