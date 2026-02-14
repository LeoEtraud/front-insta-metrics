import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Função para traduzir mensagens de erro do backend de inglês para português
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
