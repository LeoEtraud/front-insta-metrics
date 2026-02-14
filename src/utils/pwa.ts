// UTILITÁRIOS PARA PWA - REGISTRO DE SERVICE WORKER E DETECÇÃO DE INSTALAÇÃO

// REGISTRA O SERVICE WORKER PARA HABILITAR FUNCIONALIDADES PWA
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    // REGISTRA IMEDIATAMENTE, NÃO ESPERA LOAD (EVITA TELA BRANCA)
    navigator.serviceWorker
      .register('/sw.js', { updateViaCache: 'none' })
      .then((registration) => {
        console.log('[PWA] Service Worker registrado com sucesso:', registration.scope);

        // VERIFICA ATUALIZAÇÕES A CADA 60 SEGUNDOS
        setInterval(() => {
          registration.update();
        }, 60000);

        // Verifica atualizações quando encontradas
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // NOVA VERSÃO DISPONÍVEL - FORÇA ATUALIZAÇÃO AUTOMÁTICA
                console.log('[PWA] Nova versão disponível! Atualizando...');
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                // FORÇA RELOAD APÓS 1 SEGUNDO PARA DAR TEMPO DO SW ATIVAR
                setTimeout(() => {
                  window.location.reload();
                }, 1000);
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('[PWA] Erro ao registrar Service Worker:', error);
      });
  }
}

// VERIFICA SE O APP PODE SER INSTALADO
export function canInstallPWA(): boolean {
  return 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window;
}

// DETECTA SE O APP ESTÁ SENDO EXECUTADO COMO PWA INSTALADO
export function isPWAInstalled(): boolean {
  // Verifica se está em modo standalone (instalado)
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  // Verifica se está em modo fullscreen (tela cheia)
  if (window.matchMedia('(display-mode: fullscreen)').matches) {
    return true;
  }
  
  // Verifica se está em modo minimal-ui (iOS)
  if (window.matchMedia('(display-mode: minimal-ui)').matches) {
    return true;
  }
  
  // Verifica se está rodando em tela cheia no mobile
  if ((window.navigator as any).standalone === true) {
    return true;
  }
  
  return false;
}

// SOLICITA INSTALAÇÃO DO PWA (CHAMADO APÓS EVENTO beforeinstallprompt)
export async function promptInstallPWA(deferredPrompt: any): Promise<boolean> {
  if (!deferredPrompt) {
    return false;
  }

  try {
    // Mostra o prompt de instalação
    deferredPrompt.prompt();
    
    // Aguarda a resposta do usuário
    const { outcome } = await deferredPrompt.userChoice;
    
    // Limpa o prompt
    deferredPrompt = null;
    
    if (outcome === 'accepted') {
      console.log('[PWA] Usuário aceitou a instalação');
      return true;
    } else {
      console.log('[PWA] Usuário recusou a instalação');
      return false;
    }
  } catch (error) {
    console.error('[PWA] Erro ao solicitar instalação:', error);
    return false;
  }
}

