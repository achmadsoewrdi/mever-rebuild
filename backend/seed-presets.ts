import { db } from "./src/loaders/postgres";
import { qualityPresets } from "./drizzle/schema";

const seed = async () => {
  const presets = [
    {
      name: "4k",
      codec: "h264",
      format: "hls",
      resolution: "4k",
      bitrateKbps: 15000,
      isActive: true,
    },
    {
      name: "1440p",
      codec: "h264",
      format: "hls",
      resolution: "1440p",
      bitrateKbps: 8000,
      isActive: true,
    },
    {
      name: "1080p",
      codec: "h264",
      format: "hls",
      resolution: "1080p",
      bitrateKbps: 4000,
      isActive: true,
    },
    {
      name: "720p",
      codec: "h264",
      format: "hls",
      resolution: "720p",
      bitrateKbps: 2500,
      isActive: true,
    },
    {
      name: "480p",
      codec: "h264",
      format: "hls",
      resolution: "480p",
      bitrateKbps: 1000,
      isActive: true,
    },
    {
      name: "360p",
      codec: "h264",
      format: "hls",
      resolution: "360p",
      bitrateKbps: 600,
      isActive: true,
    },
  ];

  try {
    await db.insert(qualityPresets).values(presets);
    console.log("Seeding presets success!");
  } catch (error) {
    console.error("Seeding failed:", error);
  }
  process.exit(0);
};

seed();
