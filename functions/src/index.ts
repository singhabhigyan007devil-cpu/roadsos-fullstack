import * as logger from "firebase-functions/logger";
import { defineSecret } from "firebase-functions/params";
import { onRequest } from "firebase-functions/v2/https";

const googleMapsApiKey = defineSecret("GOOGLE_MAPS_API_KEY");

export const nearby = onRequest(
  {
    secrets: [googleMapsApiKey],
    cors: true,
    region: "asia-south1",
    minInstances: 0,
  },
  async (req, res) => {
    try {
      const lat = req.query.lat;
      const lon = req.query.lon;
      const radius = req.query.radius || "2500";

      if (!lat || !lon) {
        res.status(400).json({
          error: "Missing lat or lon",
        });
        return;
      }

      const apiKey = googleMapsApiKey.value();

      const hospitalUrl =
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
        `?location=${lat},${lon}` +
        `&radius=${radius}` +
        `&type=hospital` +
        `&key=${apiKey}`;

      const policeUrl =
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
        `?location=${lat},${lon}` +
        `&radius=${radius}` +
        `&type=police` +
        `&key=${apiKey}`;

      const [hospitalResponse, policeResponse] = await Promise.all([
        fetch(hospitalUrl),
        fetch(policeUrl),
      ]);

      const hospitalData = await hospitalResponse.json();
      const policeData = await policeResponse.json();

      const hospitals = (hospitalData.results || []).map((place: any) => ({
        id: place.place_id,
        name: place.name,
        type: "hospital",
        latitude: place.geometry?.location?.lat,
        longitude: place.geometry?.location?.lng,
        vicinity: place.vicinity,
      }));

      const policeStations = (policeData.results || []).map((place: any) => ({
        id: place.place_id,
        name: place.name,
        type: "police",
        latitude: place.geometry?.location?.lat,
        longitude: place.geometry?.location?.lng,
        vicinity: place.vicinity,
      }));

    res.status(200).json({
  places: [...hospitals, ...policeStations],
  source: "firebase-google-places",
});
    } catch (error) {
      logger.error("Nearby places error", error);

      res.status(500).json({
        error: "Failed to fetch nearby places",
      });
    }
  }
);