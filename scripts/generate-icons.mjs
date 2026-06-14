import sharp from "sharp";
import { mkdirSync } from "fs";

mkdirSync("public/icons", { recursive: true });

// SVG source inline — même design que public/icon.svg
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#171717"/>
  <path d="M128 278h256v62H128z" fill="#1E8A6A"/>
  <path d="M92 184h72v156H92zM348 184h72v156h-72z" fill="#F7F7F2"/>
  <path d="M194 126h124v62H194z" fill="#D7932F"/>
</svg>`;

const svgBuf = Buffer.from(svg);

// Icône standard 192x192
await sharp(svgBuf).resize(192, 192).png().toFile("public/icons/icon-192.png");
console.log("✓ icon-192.png");

// Icône standard 512x512
await sharp(svgBuf).resize(512, 512).png().toFile("public/icons/icon-512.png");
console.log("✓ icon-512.png");

// Icône maskable 512x512 — padding 20% (safe zone)
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#171717"/>
  <rect x="56" y="56" width="400" height="400" rx="72" fill="#171717"/>
  <path d="M155 298h202v50H155z" fill="#1E8A6A"/>
  <path d="M118 214h58v124h-58zM336 214h58v124h-58z" fill="#F7F7F2"/>
  <path d="M204 152h104v50H204z" fill="#D7932F"/>
</svg>`;

await sharp(Buffer.from(maskableSvg)).resize(512, 512).png().toFile("public/icons/icon-maskable-512.png");
console.log("✓ icon-maskable-512.png");

console.log("Icônes PWA générées dans public/icons/");
