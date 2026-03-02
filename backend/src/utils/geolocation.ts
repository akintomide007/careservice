/**
 * Geolocation utilities for location verification
 */

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Check if DSP is within acceptable range of client location
 * @param dspLat DSP's current latitude
 * @param dspLon DSP's current longitude
 * @param clientLat Client's latitude
 * @param clientLon Client's longitude
 * @param maxDistanceMeters Maximum allowed distance in meters (default: 100m)
 * @returns Object with verification status and distance
 */
export function verifyLocation(
  dspLat: number,
  dspLon: number,
  clientLat: number,
  clientLon: number,
  maxDistanceMeters: number = 100
): { verified: boolean; distance: number; message: string } {
  const distance = calculateDistance(dspLat, dspLon, clientLat, clientLon);
  
  const verified = distance <= maxDistanceMeters;
  
  let message = '';
  if (verified) {
    message = `Location verified. You are ${Math.round(distance)}m from client location.`;
  } else {
    message = `Location verification failed. You are ${Math.round(distance)}m from client location. Must be within ${maxDistanceMeters}m.`;
  }
  
  return {
    verified,
    distance: Math.round(distance),
    message
  };
}

/**
 * Format distance for display
 * @param meters Distance in meters
 * @returns Formatted distance string
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(2)}km`;
}
