# Configuração de Variáveis de Ambiente no Vercel

## ⚠️ IMPORTANTE: Configurar URL do Backend

Para o frontend funcionar corretamente em produção, você precisa configurar a variável de ambiente `VITE_API_URL` no Vercel.

## Como Configurar

### 1. Acesse o Painel do Vercel

1. Vá para: https://vercel.com/dashboard
2. Selecione o projeto `front-insta-metrics`
3. Vá em **Settings** → **Environment Variables**

### 2. Adicione a Variável

**Nome:** `VITE_API_URL`  
**Valor:** `https://back-insta-metrics.vercel.app`  
(ou a URL do seu backend no Vercel)

**Ambientes:** Marque todos (Production, Preview, Development)

### 3. Faça Novo Deploy

Após adicionar a variável:
- Vá em **Deployments**
- Clique nos 3 pontos do último deploy
- Selecione **Redeploy**

Ou faça um novo commit para trigger automático.

## Variáveis Recomendadas

```
VITE_API_URL=https://back-insta-metrics.vercel.app
```

## Como Funciona

- **Desenvolvimento local:** Usa `http://localhost:5000` (ou proxy do Vite)
- **Produção (sem VITE_API_URL):** Tenta usar `https://back-insta-metrics.vercel.app`
- **Produção (com VITE_API_URL):** Usa o valor configurado

## Verificação

Após configurar, verifique no console do navegador:
- As requisições devem ir para `https://back-insta-metrics.vercel.app/api/...`
- Não deve aparecer `localhost:5000` em produção

