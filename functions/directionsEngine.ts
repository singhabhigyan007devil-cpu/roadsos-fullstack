export type RouteStep = {
  instruction: string;
  distanceText: string;
  durationText: string;
};

export type RouteResult = {
  coordinates: { latitude: number; longitude: number }[];
  steps: RouteStep[];
  distanceText: string;
  durationText: string;
};

function decodePolyline(encoded: string) {
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;
  const coordinates: { latitude: number; longitude: number }[] = [];

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coordinates.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return coordinates;
}

function cleanHtml(text: string) {
  return text.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ");
}

const getRoadRoute = async (
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number },
  apiKey: string
): Promise<RouteResult | null> => {
  const url =
    `https://maps.googleapis.com/maps/api/directions/json` +
    `?origin=${origin.latitude},${origin.longitude}` +
    `&destination=${destination.latitude},${destination.longitude}` +
    `&mode=driving` +
    `&alternatives=false` +
    `&key=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== "OK") {
  console.log("GOOGLE DIRECTIONS STATUS:", data.status);
  console.log("GOOGLE DIRECTIONS ERROR:", data.error_message);
  return null;
}

if (!data.routes?.length) {
  console.log("GOOGLE DIRECTIONS: no routes found");
  return null;
}

  const route = data.routes[0];
  const leg = route.legs[0];

  return {
    coordinates: decodePolyline(route.overview_polyline.points),
    distanceText: leg.distance.text,
    durationText: leg.duration.text,
    steps: leg.steps.map((step: any) => ({
      instruction: cleanHtml(step.html_instructions),
      distanceText: step.distance.text,
      durationText: step.duration.text,
    })),
  };
};
export default getRoadRoute;