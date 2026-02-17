import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";

// COMPONENTE QUE BLOQUEIA ORIENTAÇÃO HORIZONTAL EM DISPOSITIVOS MÓVEIS
// Mostra uma mensagem quando o dispositivo está em modo landscape
export function OrientationLock() {
  const [isLandscape, setIsLandscape] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Verifica se é dispositivo móvel
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= 768 || 
                            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
      return isMobileDevice;
    };

    // Verifica orientação
    const checkOrientation = (mobile: boolean) => {
      const isLandscapeMode = window.innerWidth > window.innerHeight;
      setIsLandscape(isLandscapeMode && mobile);
    };

    // Verifica inicialmente
    const initialMobile = checkMobile();
    checkOrientation(initialMobile);

    // Escuta mudanças de orientação
    const handleResize = () => {
      const mobile = checkMobile();
      checkOrientation(mobile);
    };

    // Escuta evento de orientação (mais confiável em mobile)
    const handleOrientationChange = () => {
      setTimeout(() => {
        const mobile = checkMobile();
        checkOrientation(mobile);
      }, 100);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleOrientationChange);
    
    // Media query para orientação
    const mediaQuery = window.matchMedia("(orientation: landscape)");
    const handleMediaQuery = (e: MediaQueryListEvent) => {
      const mobile = checkMobile();
      if (mobile) {
        setIsLandscape(e.matches);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleMediaQuery);
    } else {
      // Fallback para navegadores antigos
      mediaQuery.addListener(handleMediaQuery);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleMediaQuery);
      } else {
        mediaQuery.removeListener(handleMediaQuery);
      }
    };
  }, []);

  // Não mostra nada se não for mobile ou se estiver em portrait
  if (!isMobile || !isLandscape) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex items-center justify-center p-4">
      <div className="bg-primary text-primary-foreground rounded-2xl p-8 max-w-md text-center shadow-2xl">
        <div className="flex flex-col items-center gap-4">
          <RotateCcw className="w-16 h-16 animate-spin-slow" />
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Gire seu dispositivo
            </h2>
            <p className="text-lg opacity-90">
              Por favor, gire seu dispositivo para o modo retrato (vertical) para continuar usando o aplicativo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

