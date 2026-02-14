import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerServiceWorker } from "./utils/pwa";

// REGISTRA SERVICE WORKER PARA PWA
registerServiceWorker();

// VERIFICA SE O ELEMENTO ROOT EXISTE ANTES DE RENDERIZAR
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Elemento root não encontrado!");
}

// RENDERIZA APP COM TRATAMENTO DE ERRO
try {
  const root = createRoot(rootElement);
  root.render(<App />);
} catch (error) {
  console.error("Erro ao renderizar aplicação:", error);
  rootElement.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; flex-direction: column; gap: 1rem; font-family: system-ui;">
      <h1 style="color: #ef4444;">Erro ao carregar aplicação</h1>
      <p>Por favor, recarregue a página (Ctrl+Shift+R ou Cmd+Shift+R)</p>
      <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">
        Recarregar Página
      </button>
    </div>
  `;
}
