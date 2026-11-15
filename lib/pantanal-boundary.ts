import type { Meta } from "@/lib/types";

// Fallback copied from mocks/meta.json so the map remains usable when /meta is unavailable.
export const PANTANAL_BOUNDARY: Meta["pantanal_boundary"] = {
  type: "Feature",
  properties: { name: "Pantanal" },
  geometry: {
    type: "MultiPolygon",
    coordinates: [[[
      [-58.2, -15.9], [-56.2, -16.1], [-55.6, -17.6], [-55.4, -19.6],
      [-56.2, -21.4], [-57.6, -22.0], [-58.0, -20.2], [-57.8, -18.0],
      [-58.2, -15.9],
    ]]],
  },
};
