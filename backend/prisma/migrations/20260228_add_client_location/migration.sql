-- Add location fields to Client table for geolocation verification
ALTER TABLE "clients" ADD COLUMN "latitude" DOUBLE PRECISION;
ALTER TABLE "clients" ADD COLUMN "longitude" DOUBLE PRECISION;
ALTER TABLE "clients" ADD COLUMN "location_address" TEXT;
ALTER TABLE "clients" ADD COLUMN "location_radius_meters" INTEGER DEFAULT 100;

-- Add location verification to service sessions
ALTER TABLE "service_sessions" ADD COLUMN "location_verified" BOOLEAN DEFAULT false;
ALTER TABLE "service_sessions" ADD COLUMN "distance_from_client" INTEGER; -- Distance in meters
ALTER TABLE "service_sessions" ADD COLUMN "verification_message" TEXT;

-- Create index for location queries
CREATE INDEX "clients_location_idx" ON "clients"("latitude", "longitude");
