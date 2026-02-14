import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// COMBINA CLASSES CSS COM CLSX E TAILWIND MERGE PARA RESOLVER CONFLITOS
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// TRADUZ MENSAGENS DE ERRO DO BACKEND DE INGLÊS PARA PORTUGUÊS
export function translateErrorMessage(message: string): string {
  const translations: Record<string, string> = {
    "Invalid credentials": "Credenciais inválidas",
    "Invalid token": "Token inválido",
    "Token expired": "Token expirado",
    "Validation error": "Erro de validação",
    "Internal Server Error": "Erro interno do servidor",
  };

  return translations[message] || message;
}
