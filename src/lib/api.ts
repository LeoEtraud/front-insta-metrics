// CONFIGURAÇÃO DA URL DA API - DETECTA AMBIENTE E USA URL CORRETA
const getApiBaseUrl = (): string => {
  // Se VITE_API_URL estiver definido, usa ele (prioridade)
  if (import.meta.env.VITE_API_URL) {
    console.log('[API] Usando VITE_API_URL:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  // Em produção (Vercel), tenta detectar URL do backend
  if (import.meta.env.PROD) {
    // Se estiver no Vercel, usa a URL do backend no Render
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://back-insta-metrics.onrender.com";
    console.log('[API] Produção - Usando backend:', backendUrl);
    return backendUrl;
  }
  
  // Em desenvolvimento, usa localhost
  console.log('[API] Desenvolvimento - Usando localhost:5000');
  return "http://localhost:5000";
};

const API_BASE_URL = getApiBaseUrl();
console.log('[API] URL base configurada:', API_BASE_URL);

// CONSTRÓI URL COMPLETA DA API BASEADO NO PATH - USA PROXY EM DESENVOLVIMENTO
export function getApiUrl(path: string): string {
  // If path already starts with http, return as is
  if (path.startsWith("http")) {
    return path;
  }
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  
  // In development, use proxy (path starts with /api)
  // In production, use full URL
  if (import.meta.env.DEV && cleanPath.startsWith("/api")) {
    return cleanPath;
  }
  
  // Remove trailing slash from API_BASE_URL and ensure clean path
  const baseUrl = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const finalPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
  
  const finalUrl = `${baseUrl}${finalPath}`;
  console.log('[API] URL construída:', finalUrl);
  return finalUrl;
}

// RETORNA HEADERS HTTP COM TOKEN DE AUTORIZAÇÃO DO LOCALSTORAGE
export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("accessToken");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
}

