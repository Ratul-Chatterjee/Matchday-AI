import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhoneIcon, MicIcon, XIcon, SoccerBallIcon } from './Icons';
import type { TranslationKey } from '../i18n/translations';

interface DesktopBannerProps {
  t: (key: TranslationKey) => string;
  onDismiss: () => void;
}

export default function DesktopBanner({ t, onDismiss }: DesktopBannerProps) {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isDesktop) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="max-w-md mx-4 card text-center animate-fade-in border-fifa-gold/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-fifa-blue/10 via-transparent to-fifa-red/10" />
        <div className="relative">
          <button onClick={onDismiss} className="absolute top-0 right-0 p-1 text-gray-500 hover:text-white transition-colors">
            <XIcon size={16} />
          </button>
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-fifa-blue to-fifa-gold flex items-center justify-center shadow-xl shadow-fifa-blue/30">
            <PhoneIcon size={28} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-3">{t('desktopTitle')}</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-6">{t('desktopMsg')}</p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-400 mb-6">
            <div className="flex items-center gap-1.5">
              <SoccerBallIcon size={14} className="text-fifa-gold" />
              <span>{t('desktopFeatures1')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MicIcon size={14} className="text-fifa-gold" />
              <span>{t('desktopFeatures2')}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={onDismiss} className="btn-primary w-full text-sm">
              {t('desktopBtn')}
            </button>
            <button onClick={() => { onDismiss(); navigate('/'); }} className="w-full text-sm text-gray-400 hover:text-white transition-colors py-2">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
