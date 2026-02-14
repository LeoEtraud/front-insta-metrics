// SCRIPT PARA GERAR ÍCONES PNG A PARTIR DO SVG - EXECUTA: node scripts/generate-icons.js
// Requer: npm install --save-dev sharp

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Tamanhos de ícones necessários
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// SVG base (mesmo do favicon.svg)
const svgContent = `<svg width="512" height="512" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="8" fill="#FACC15"/>
  <g fill="#0F172A" stroke="#0F172A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="7" y="18" width="4" height="8" rx="1" fill="#0F172A"/>
    <rect x="13" y="14" width="4" height="12" rx="1" fill="#0F172A"/>
    <rect x="19" y="10" width="4" height="16" rx="1" fill="#0F172A"/>
  </g>
</svg>`;

async function generateIcons() {
  try {
    // Verifica se sharp está instalado
    let sharp;
    try {
      sharp = (await import('sharp')).default;
    } catch (e) {
      console.error('❌ Erro: sharp não está instalado.');
      console.log('💡 Execute: npm install --save-dev sharp');
      process.exit(1);
    }

    const publicDir = path.join(__dirname, '..', 'public');
    
    // Cria SVG temporário
    const tempSvgPath = path.join(publicDir, 'temp-icon.svg');
    fs.writeFileSync(tempSvgPath, svgContent);

    console.log('🎨 Gerando ícones PNG...\n');

    // Gera cada tamanho
    for (const size of sizes) {
      const outputPath = path.join(publicDir, `icon-${size}x${size}.png`);
      
      await sharp(tempSvgPath)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Gerado: icon-${size}x${size}.png`);
    }

    // Remove SVG temporário
    fs.unlinkSync(tempSvgPath);

    console.log('\n✨ Todos os ícones foram gerados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao gerar ícones:', error);
    process.exit(1);
  }
}

generateIcons();

