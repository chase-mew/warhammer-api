import { Hono } from "hono";
import { fetchData } from "../utils/data.js";
import { formatSuccess, formatError } from "../utils/format.js";

interface FactionScores {
  fun_to_play: number;
  ease_of_play: number;
  army_size: number;
  cost_effective: number;
  ease_of_painting: number;
  games_workshop_support: number;
  community: number;
  model_variety: number;
  creators_aesthetic_preference: number;
  color: string;
  icon: string;
  description: string;
}

interface FactionIndexEntry extends FactionScores {
  id: string;
  name: string;
  slug: string;
  datasheetCount: number;
}

interface FactionManifest extends FactionScores {
  id: string;
  name: string;
  slug: string;
  link: string;
  datasheetCount: number;
  datasheets: { id: string; name: string; slug: string; role: string | null }[];
}

const factions = new Hono();

factions.get("/", async (c) => {
  const data = await fetchData<FactionIndexEntry[]>("factions/_index.json");
  return c.json(formatSuccess(data));
});

factions.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  try {
    const data = await fetchData<FactionManifest>(
      `factions/${slug}/_manifest.json`
    );
    return c.json(formatSuccess(data));
  } catch {
    return c.json(formatError(`Faction not found: ${slug}`), 404);
  }
});

factions.get("/:slug/datasheets", async (c) => {
  const slug = c.req.param("slug");
  try {
    const manifest = await fetchData<FactionManifest>(
      `factions/${slug}/_manifest.json`
    );
    return c.json(formatSuccess(manifest.datasheets));
  } catch {
    return c.json(formatError(`Faction not found: ${slug}`), 404);
  }
});

export default factions;
