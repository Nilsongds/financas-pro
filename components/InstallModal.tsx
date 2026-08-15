import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, CheckCircle, Share, MoreVertical, ArrowRight, ShieldCheck, WifiOff } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if already in standalone PWA mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    const android = /android/.test(userAgent);
    setIsIOS(ios);
    setIsAndroid(android);

    // Capture beforeinstallprompt event on Chrome/Android
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
        {/* Modal Header */}
        <div className="bg-slate-900 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
            title="Fechar"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2.5 rounded-2xl shadow-md">
              <Smartphone size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Instalar Finanças Pro</h3>
              <p className="text-xs text-slate-400">Gratuito e 100% Offline no Celular</p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {isInstalled ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={36} />
              </div>
              <h4 className="text-base font-bold text-slate-800">Aplicativo Já Instalado!</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                O aplicativo já está instalado no seu dispositivo e pronto para uso direto da tela inicial.
              </p>
            </div>
          ) : (
            <>
              {/* Direct Install Button if Chrome Prompt is available */}
              {deferredPrompt && (
                <div className="space-y-3">
                  <button
                    onClick={handleInstallClick}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-base"
                  >
                    <Download size={20} />
                    Instalar Agora no Android
                  </button>
                  <p className="text-[11px] text-center text-slate-400">
                    Clique acima para adicionar direto à sua tela de aplicativos.
                  </p>
                </div>
              )}

              {/* Step by step instructions for Android Chrome */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {isIOS ? 'Como Instalar no iPhone (iOS):' : 'Como Instalar no Android (Google Chrome):'}
                </p>

                {isIOS ? (
                  <div className="space-y-2.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[10px]">1</span>
                      <span>Toque no botão <strong className="inline-flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-slate-200"><Share size={12} /> Compartilhar</strong> no Safari</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[10px]">2</span>
                      <span>Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong></span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[10px]">3</span>
                      <span>Toque em <strong>"Adicionar"</strong> no topo direito</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">1</span>
                      <span>No Chrome, toque nos <strong>3 pontinhos</strong> (<MoreVertical size={13} className="inline text-slate-600" />) no canto superior</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">2</span>
                      <span>Toque em <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong></span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">3</span>
                      <span>Confirme em <strong>"Instalar"</strong> para ter o ícone no seu celular</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Benefits badge */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                  <span>100% Gratuito e Seguro</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
                  <WifiOff size={16} className="text-slate-600 shrink-0" />
                  <span>Funciona Sem Internet</span>
                </div>
              </div>
            </>
          )}

          <button 
            onClick={onClose}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-xs"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
