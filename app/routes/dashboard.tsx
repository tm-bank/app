import type { Route } from "./+types/home";
import Dash from "./dashboard/dashboard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "TM Bank | Dashboard" },
    { name: "description", content: "Welcome to the TM Bank!" },
  ];
}

export default function Dashboard() {
  return <Dash />;
}
