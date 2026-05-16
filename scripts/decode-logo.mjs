import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const data = fs.readFileSync(path.join(root, "src/lib/logo-data.txt"), "utf8");
const comma = data.indexOf(",");
const b64 = data.slice(comma + 1);
fs.mkdirSync(path.join(root, "public"), { recursive: true });
fs.writeFileSync(path.join(root, "public/logo.jpg"), Buffer.from(b64, "base64"));
console.log("Wrote public/logo.jpg");
