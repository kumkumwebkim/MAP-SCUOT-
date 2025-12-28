export interface Business {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewCount?: number;
  website: string;
  lat: number;
  lng: number;
  issues: string[];
  salesPitch: string;
  industry?: string;
}

export interface SearchState {
  industry: string;
  city: string;
  loading: boolean;
  error: string | null;
}

export interface FilterState {
  minRating: number;
}
