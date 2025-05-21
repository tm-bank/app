import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  route("/", "routes/home.tsx"),
  route("/dashboard", "routes/dashboard.tsx"),
  route("/map", "routes/redirects/home.tsx"),
  route("/map/:mapId", "routes/map.tsx"),
  route("/auth/callback", "routes/auth.tsx"),
  route("/blocks", "routes/blocks/blocks.tsx")
] satisfies RouteConfig;
