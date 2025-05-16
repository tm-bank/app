import { useParams } from "react-router";
import type { Route } from "./+types/home";
import Scenery from "./scenery/scenery";
import { MapPage } from "./map/map";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "TM Bank | Map" },
    { name: "description", content: "Welcome to the TM Bank!" },
  ];
}

export default function Map() {
  const { mapId } = useParams();
  return <MapPage mapId={mapId}/>;
}
