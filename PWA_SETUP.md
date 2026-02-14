# Configuração PWA - Insta Metrics

O projeto está configurado como Progressive Web App (PWA) e pode ser instalado em dispositivos móveis e desktop.

## ✅ O que já está implementado:

1. **Manifest.json** - Configuração do app (nome, ícones, tema)
2. **Service Worker** - Cache offline e funcionalidades PWA
3. **Registro automático** - Service worker é registrado automaticamente
4. **Botão de instalação** - Aparece quando o app pode ser instalado
5. **Meta tags** - Configurações para iOS e Android

## 📱 Como instalar:

### Android (Chrome/Edge):
1. Abra o app no navegador
2. Toque no menu (3 pontos) → "Instalar app" ou "Adicionar à tela inicial"
3. Ou aguarde o banner de instalação aparecer

### iOS (Safari):
1. Abra o app no Safari
2. Toque no botão de compartilhar (quadrado com seta)
3. Selecione "Adicionar à Tela de Início"
4. Confirme a instalação

### Desktop (Chrome/Edge):
1. Abra o app no navegador
2. Clique no ícone de instalação na barra de endereços
3. Ou use o botão "Instalar App" que aparece no canto inferior direito

## 🎨 Gerar ícones:

Para gerar os ícones PNG necessários:

```bash
# Instale o sharp (se ainda não tiver)
npm install --save-dev sharp

# Execute o script de geração
node scripts/generate-icons.js
```

Isso criará todos os ícones necessários na pasta `public/`:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## 🔧 Funcionalidades PWA:

- ✅ **Instalação** - Pode ser instalado como app nativo
- ✅ **Offline** - Funciona parcialmente offline (cache de assets)
- ✅ **Atualizações** - Notifica quando há nova versão
- ✅ **Tema** - Cores personalizadas (amarelo #FACC15)
- ✅ **Standalone** - Abre em janela própria sem barra do navegador

## 📝 Notas:

- O service worker cacheia apenas assets estáticos
- Requisições de API sempre vão para o servidor (não são cacheadas)
- Em produção, certifique-se de que o service worker está sendo servido via HTTPS
- Os ícones são gerados a partir do favicon.svg

## 🚀 Deploy:

Para produção, certifique-se de:
1. Servir via HTTPS (obrigatório para PWA)
2. Ter todos os ícones gerados na pasta `public/`
3. O service worker deve estar acessível em `/sw.js`
4. O manifest deve estar acessível em `/manifest.json`

