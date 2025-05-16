import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  route("/", "routes/home.tsx"),
  route("/dashboard", "routes/dashboard.tsx"),
  route("/map/:mapId", "routes/map.tsx"),
] satisfies RouteConfig;
