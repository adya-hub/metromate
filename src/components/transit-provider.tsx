"use client";

/**
 * TransitProvider — now a passthrough.
 *
 * All transit data is loaded from the Express backend API.
 * This component previously blocked rendering while loading
 * a mock local metro graph. That logic has been removed.
 *
 * The backend API at http://localhost:3001 serves all 10,559 stops.
 */
export function TransitProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
