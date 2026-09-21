import { feature, mesh } from "topojson-client";
import { geoArea, geoCentroid, geoGraticule10, geoNaturalEarth1, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, Geometry, MultiPolygon, Polygon } from "geojson";
import world from "world-atlas/countries-110m.json";
import { visitedById } from "../data/visited-countries";

export const MAP_WIDTH = 1000;
export const MAP_HEIGHT = 520;

export interface MapCountry {
  id: string;
  name: string;
  d: string;
  visited: boolean;
  bounds: [number, number, number, number];
  cx: number;
  cy: number;
}

interface NamedFeature extends Feature<Geometry, { name: string }> {
  id?: string | number;
}

function isoId(id: string | number | undefined) {
  return String(id ?? "").padStart(3, "0");
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function polygonFeature(coordinates: Polygon["coordinates"]): Feature<Polygon> {
  return {
    type: "Feature",
    properties: {},
    geometry: { type: "Polygon", coordinates },
  };
}

function clipFrance(geometry: Geometry): Geometry {
  if (geometry.type !== "MultiPolygon") return geometry;
  const kept = (geometry as MultiPolygon).coordinates.filter((poly) => {
    const [lon, lat] = geoCentroid(polygonFeature(poly));
    return lon > -20 && lat > 35;
  });
  if (kept.length === 1) return { type: "Polygon", coordinates: kept[0] };
  return { type: "MultiPolygon", coordinates: kept };
}

function largestPiece(geometry: Geometry): Geometry {
  if (geometry.type !== "MultiPolygon") return geometry;
  let best = geometry.coordinates[0];
  let bestArea = -1;
  for (const poly of geometry.coordinates) {
    const area = geoArea(polygonFeature(poly));
    if (area > bestArea) {
      bestArea = area;
      best = poly;
    }
  }
  return { type: "Polygon", coordinates: best };
}

export function buildWorldMap() {
  const projection = geoNaturalEarth1().fitExtent(
    [
      [14, 20],
      [MAP_WIDTH - 14, MAP_HEIGHT - 12],
    ],
    { type: "Sphere" },
  );
  const path = geoPath(projection).digits(1);
  const collection = feature(world, world.objects.countries) as FeatureCollection<Geometry, { name: string }>;

  const countries: MapCountry[] = collection.features
    .map((raw) => {
      const item = raw as NamedFeature;
      const id = isoId(item.id);
      const geometry = id === "250" ? clipFrance(item.geometry) : item.geometry;
      const drawFeature: Feature<Geometry, { name: string }> = {
        type: "Feature",
        properties: item.properties,
        geometry,
      };
      const d = path(drawFeature);
      if (!d) return null;
      const visited = visitedById.get(id);
      const focus: Feature<Geometry> = {
        type: "Feature",
        properties: {},
        geometry: largestPiece(geometry),
      };
      const bounds = path.bounds(focus);
      const centroid = path.centroid(focus);
      return {
        id,
        name: visited?.name ?? item.properties.name,
        d,
        visited: Boolean(visited),
        bounds: [round(bounds[0][0]), round(bounds[0][1]), round(bounds[1][0]), round(bounds[1][1])] as [
          number,
          number,
          number,
          number,
        ],
        cx: round(centroid[0]),
        cy: round(centroid[1]),
      };
    })
    .filter((country): country is MapCountry => Boolean(country));

  return {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    sphere: path({ type: "Sphere" }) ?? "",
    graticule: path(geoGraticule10()) ?? "",
    borders: path(mesh(world, world.objects.countries, (a, b) => a !== b)) ?? "",
    countries,
  };
}
