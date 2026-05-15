export type MetroLine = 
  | 'RED' 
  | 'YELLOW' 
  | 'BLUE' 
  | 'BLUE_BRANCH' 
  | 'GREEN' 
  | 'VIOLET' 
  | 'PINK' 
  | 'MAGENTA' 
  | 'GREY' 
  | 'ORANGE' 
  | 'AQUA' 
  | 'RAPID';

export interface Station {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  lines: MetroLine[];
  isInterchange: boolean;
  facilities?: {
    parking: boolean;
    lift: boolean;
    atm: boolean;
  };
}

export interface RouteSegment {
  from: string;
  to: string;
  line: MetroLine;
  stations: string[];
  durationMinutes: number;
}

export interface RoutePlan {
  totalDuration: number;
  totalFare: number;
  interchanges: number;
  segments: RouteSegment[];
}

export interface MetroNews {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'INFO' | 'WARNING' | 'CRITICAL';
}
