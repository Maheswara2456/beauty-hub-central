import * as React from "react";
import { SlidersHorizontal, Star, IndianRupee, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export type ParlourFilterState = {
  search: string;
  minRating: number;
  maxPrice: number;
  category: string;
  sortBy: "rating" | "reviews" | "name" | "";
};

export function ParlourFilters({
  value,
  onChange,
  onReset,
  categories,
}: {
  value: ParlourFilterState;
  onChange: (next: ParlourFilterState) => void;
  onReset: () => void;
  categories: string[];
}) {
  return (
    <Card className="glass noise-overlay p-4 md:p-5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="inline-flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl border bg-gradient-to-br from-primary/14 to-accent/12 grid place-items-center shadow-soft">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <div>
            <div className="font-semibold">Filters</div>
            <div className="text-xs text-muted-foreground">Refine by rating, category, and budget</div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="secondary" onClick={onReset}>
            Reset
          </Button>
          <Button
            onClick={() => {
              // Small delight: set a "best first" sort quickly
              onChange({ ...value, sortBy: value.sortBy === "rating" ? "" : "rating" });
            }}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Best rated
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-4">
          <div className="text-xs font-semibold text-muted-foreground mb-2">Search</div>
          <Input
            value={value.search}
            onChange={(e) => onChange({ ...value, search: e.target.value })}
            placeholder="Search parlour name, area…"
            type="search"
          />
        </div>

        <div className="md:col-span-3">
          <div className="text-xs font-semibold text-muted-foreground mb-2">Category</div>
          <Select
            value={value.category || "all"}
            onValueChange={(v) => onChange({ ...value, category: v === "all" ? "" : v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <div className="text-xs font-semibold text-muted-foreground mb-2">Sort</div>
          <Select
            value={value.sortBy || "none"}
            onValueChange={(v) => onChange({ ...value, sortBy: v === "none" ? "" : (v as any) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Default</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="reviews">Reviews</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-3">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Star className="h-3.5 w-3.5" />
              Min rating
            </span>
            <span className="tabular-nums">{value.minRating.toFixed(1)}</span>
          </div>
          <div className="mt-3">
            <Slider
              value={[value.minRating]}
              min={0}
              max={5}
              step={0.5}
              onValueChange={(v) => onChange({ ...value, minRating: v[0] ?? 0 })}
            />
          </div>

          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <IndianRupee className="h-3.5 w-3.5" />
              Max service price
            </span>
            <span className="tabular-nums">₹{Math.round(value.maxPrice)}</span>
          </div>
          <div className="mt-3">
            <Slider
              value={[value.maxPrice]}
              min={300}
              max={6000}
              step={50}
              onValueChange={(v) => onChange({ ...value, maxPrice: v[0] ?? 3000 })}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
