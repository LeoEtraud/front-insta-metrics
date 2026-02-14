import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { canInstallPWA, promptInstallPWA } from "@/utils/pwa";

// COMPONENTE DE BOTÃO PARA INSTALAR PWA - EXIBE QUANDO DISPONÍVEL E PERMITE INSTALAÇÃO
export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // Verifica se pode instalar
    if (!canInstallPWA()) {
      return;
    }

    // Escuta o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      // Previne o prompt automático
      e.preventDefault();
      // Salva o evento para usar depois
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Verifica se já está instalado
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setShowInstallButton(false);
      }
    };

    checkIfInstalled();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      const installed = await promptInstallPWA(deferredPrompt);
      if (installed) {
        setShowInstallButton(false);
        setDeferredPrompt(null);
      }
    }
  };

  if (!showInstallButton) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <div className="bg-card border border-border rounded-2xl shadow-2xl p-4 max-w-sm">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">Instalar Insta Metrics</h3>
            <p className="text-xs text-muted-foreground">
              Instale o app para acesso rápido e funcionalidades offline
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setShowInstallButton(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Button
          onClick={handleInstallClick}
          className="w-full gap-2"
          size="sm"
        >
          <Download className="h-4 w-4" />
          Instalar App
        </Button>
      </div>
    </div>
  );
}

