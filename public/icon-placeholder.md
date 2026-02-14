# Ícones PWA

Este arquivo é um placeholder. Para gerar os ícones PNG necessários para o PWA:

## Opção 1: Usar o script Node.js (Recomendado)

1. Instale o sharp:
```bash
npm install --save-dev sharp
```

2. Execute o script:
```bash
node scripts/generate-icons.js
```

## Opção 2: Gerar manualmente

Use uma ferramenta online como:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

Ou use o favicon.svg como base e gere os seguintes tamanhos:
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

Coloque todos os arquivos na pasta `public/` com os nomes:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

