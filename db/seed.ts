import { sql } from "drizzle-orm";
import { db } from "./index.js";
import { sites, agents, evenements, rondes, alarmes, cameras, indicateursDI } from "./schema.js";
import {
  seedSites,
  seedAgents,
  seedEvenements,
  seedRondes,
  seedAlarmes,
  seedCameras,
  seedIndicateursDI,
} from "./seed-data.js";

let seedPromise: Promise<void> | null = null;

async function runSeed() {
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(sites);
  if (Number(count) > 0) return;

  await db.insert(sites).values(seedSites).onConflictDoNothing();
  await db.insert(agents).values(seedAgents).onConflictDoNothing();
  await db.insert(cameras).values(seedCameras).onConflictDoNothing();
  await db.insert(evenements).values(seedEvenements).onConflictDoNothing();
  await db.insert(rondes).values(seedRondes).onConflictDoNothing();
  await db.insert(alarmes).values(seedAlarmes).onConflictDoNothing();
  await db.insert(indicateursDI).values(seedIndicateursDI).onConflictDoNothing();
}

export function ensureSeed(): Promise<void> {
  if (!seedPromise) {
    seedPromise = runSeed().catch((err) => {
      seedPromise = null;
      throw err;
    });
  }
  return seedPromise;
}
