import type { Config } from "@netlify/functions";

export default async (req: Request) => {
  if (req.method !== "GET") {
    return Response.json({ error: "Méthode non autorisée" }, { status: 405 });
  }
  const key = Netlify.env.get("GOOGLE_MAPS_API_KEY") ?? "";
  return Response.json({ key: key ? key : null });
};

export const config: Config = {
  path: "/api/maps-config",
};
