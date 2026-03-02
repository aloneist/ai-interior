import fs from "fs";

const required = [
  "OPENAI_API_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
];

const optional = [
  "STABILITY_API_KEY",
  "CLOUDINARY_NAME",
  "CLOUDINARY_KEY",
  "CLOUDINARY_SECRET",
];

const missingRequired = required.filter((k) => !process.env[k]);
if (missingRequired.length) {
  console.error("❌ Missing REQUIRED env vars:");
  for (const k of missingRequired) console.error(" -", k);
  process.exit(1);
}

const missingOptional = optional.filter((k) => !process.env[k]);
if (missingOptional.length) {
  console.warn("⚠️ Missing OPTIONAL env vars (dev will still run):");
  for (const k of missingOptional) console.warn(" -", k);
}

const all = [...required, ...optional].filter((k, i, arr) => arr.indexOf(k) === i);
const present = all.filter((k) => process.env[k]);

const content = present.map((k) => `${k}=${process.env[k]}\n`).join("");
fs.writeFileSync(".env.local", content, { encoding: "utf8" });

console.log(`✅ .env.local generated (${present.length} vars written)`);