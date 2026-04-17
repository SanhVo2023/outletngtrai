import sharp from "sharp";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const dir = "public/gifts";
const targetSize = 256;

const files = (await readdir(dir)).filter((f) => /^gift-\d+\.png$/.test(f));

for (const f of files) {
  const p = join(dir, f);
  const before = (await stat(p)).size;
  const buf = await sharp(p)
    .resize(targetSize, targetSize, { fit: "inside", withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();
  await sharp(buf).toFile(p);
  const after = (await stat(p)).size;
  console.log(`${f}: ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`);
}
