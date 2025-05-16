import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  route("/app/", "routes/home.tsx"),
  route("/app/dashboard", "routes/dashboard.tsx"),
  route("/app/map/:mapId", "routes/map.tsx"),
] satisfies RouteConfig;
