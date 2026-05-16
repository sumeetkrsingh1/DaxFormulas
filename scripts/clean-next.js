const fs = require("node:fs");
const path = require("node:path");

const nextDir = path.resolve(process.cwd(), ".next");

try {
  if (fs.existsSync(nextDir)) {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log("Removed .next to avoid stale Next.js artifacts.");
  }
} catch (error) {
  console.warn("Could not remove .next:", error);
}
