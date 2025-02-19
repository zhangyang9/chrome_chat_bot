const sharp = require('sharp');
const fs = require('fs');

const sizes = [16, 48, 128];
const svgBuffer = fs.readFileSync('assets/icons/icon.svg');

async function generateIcons() {
  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(`assets/icons/icon-${size}.png`);
  }
}

generateIcons(); 