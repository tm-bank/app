import type { Route } from "./+types/home";
import Scenery from "../scenery/scenery";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "TM Bank" },
    { name: "description", content: "Welcome to the TM Bank!" },
  ];
}

export default function Home() {
  return <Scenery />;
}
