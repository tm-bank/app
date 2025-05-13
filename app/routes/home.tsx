import type { Route } from "./+types/home";
import Scenery from "../scenery/scenery";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Trackmania Scenery Bank" },
    { name: "description", content: "Welcome to Scenery Bank!" },
  ];
}

export default function Home() {
  return <Scenery />;
}
