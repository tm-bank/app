import { useParams } from "react-router";
import type { Route } from "./+types/home";
import { MapPage } from "./map/map";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "TM Bank | Map" },
    { name: "description", content: "Welcome to the TM Bank!" },
  ];
}

export default function Map() {
  return <MapPage />;
}
