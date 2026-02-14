// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
  
  return `${API_BASE_URL}${cleanPath}`;
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

