import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import DesktopBanner from './components/DesktopBanner';
import TicketScanner from './components/TicketScanner';
import MapLayout from './components/MapLayout';
import KnowledgePanel from './components/KnowledgePanel';
import Chatbot from './components/Chatbot';
import SpeechTranslator from './components/SpeechTranslator';
import { TicketIcon, MapPinIcon, ChatIcon, ChartIcon, GlobeIcon, SoccerBallIcon } from './components/Icons';
import { localStorageUtils } from './utils/localStorage';
import { STADIUMS, MATCH_CONFIG, LANGUAGES, FALLBACK_STANDINGS, STADIUM_METADATA } from './data/matchData';
import { groqClient } from './utils/groqClient';
import { useTranslation } from './i18n/useTranslation';

interface ParsedTicket {
  stadium: string; gate: string; section: string; row: string; seat: string;
  match: string; stadium_id: string;
  coordinates: { name: string; lat: number; lng: number; city: string; country: string } | null;
}

type ActiveTab = 'ticket' | 'map' | 'chat' | 'knowledge' | 'translate';

function AppContent() {
  const { lang, setLang, t } = useTranslation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [desktopDismissed, setDesktopDismissed] = useState(() => localStorageUtils.getDesktopDismissed());
  const [activeTab, setActiveTab] = useState<ActiveTab>('ticket');
  const [parsedTicket, setParsedTicket] = useState<ParsedTicket | null>(null);
  const [userLang, setUserLang] = useState(lang);
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [isTranslatorOpen, setIsTranslatorOpen] = useState(false);

  useEffect(() => {
    const saved = localStorageUtils.getChatHistory() as Array<{ role: string; content: string }>;
    setChatHistory(saved);
  }, []);

  const detectLanguage = useCallback(() => {
    const saved = localStorageUtils.getLanguage();
    if (saved && saved !== 'en') return saved;
    return navigator.language.split('-')[0];
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const detected = detectLanguage();
    const saved = localStorageUtils.getLanguage();
    const finalLang = saved || detected;
    setUserLang(finalLang);
    setLang(finalLang);
  }, [detectLanguage, setLang]);

  useEffect(() => {
    const saved = localStorageUtils.getTicket() as ParsedTicket | null;
    if (saved) setParsedTicket(saved);
  }, []);

  useEffect(() => {
    localStorageUtils.setChatHistory(chatHistory);
  }, [chatHistory]);

  const handleTicketParsed = (ticket: ParsedTicket) => {
    setParsedTicket(ticket);
    localStorageUtils.setTicket(ticket as any);
    setActiveTab('map');
  };

  const handleManualSeat = (data: { stadium_id: string; gate: string; section: string; row: string; seat: string }) => {
    const stadium = STADIUMS.find(s => s.id === data.stadium_id);
    const ticket: ParsedTicket = {
      stadium: stadium?.name || data.stadium_id,
      gate: data.gate, section: data.section, row: data.row, seat: data.seat,
      match: `${MATCH_CONFIG.match.home_team} vs ${MATCH_CONFIG.match.away_team}`,
      stadium_id: data.stadium_id,
      coordinates: stadium ? { name: stadium.name, lat: stadium.lat, lng: stadium.lng, city: stadium.city, country: stadium.country } : null,
    };
    setParsedTicket(ticket);
    localStorageUtils.setTicket(ticket as any);
    setActiveTab('map');
  };

  const handleClearTicket = () => {
    setParsedTicket(null);
    localStorageUtils.clearTicket();
  };

  const handleLangChange = (code: string) => {
    setUserLang(code);
    setLang(code);
  };

  const tabs: { id: ActiveTab; labelKey: string; icon: React.ReactNode; mobileOnly?: boolean }[] = [
    { id: 'ticket', labelKey: 'tabTicket', icon: <TicketIcon size={20} /> },
    { id: 'map', labelKey: 'tabMap', icon: <MapPinIcon size={20} /> },
    { id: 'chat', labelKey: 'tabChat', icon: <ChatIcon size={20} /> },
    { id: 'knowledge', labelKey: 'tabLive', icon: <ChartIcon size={20} /> },
    { id: 'translate', labelKey: 'tabVoice', icon: <GlobeIcon size={20} />, mobileOnly: true },
  ];

  return (
    <div className="min-h-screen bg-gray-950 safe-top safe-bottom">
      {!isMobile && !desktopDismissed && <DesktopBanner t={t} onDismiss={() => { setDesktopDismissed(true); localStorageUtils.setDesktopDismissed(true); }} />}

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-gray-800/50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fifa-blue to-fifa-gold flex items-center justify-center shadow-lg shadow-fifa-blue/20">
              <SoccerBallIcon size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">
                {t('appName')} <span className="text-fifa-gold text-[10px] align-super">AI</span>
              </h1>
              <p className="text-[10px] text-gray-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                {MATCH_CONFIG.match.home_team} vs {MATCH_CONFIG.match.away_team}
              </p>
            </div>
          </div>
          <button onClick={() => navigate('/')} className="bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white text-xs font-medium py-1.5 px-3 rounded-lg border border-gray-700/50 transition-all duration-200 flex items-center gap-1.5" title="Back to Landing Page">
            ← Home
          </button>
          <div className="flex items-center gap-2">
            <select value={userLang} onChange={(e) => handleLangChange(e.target.value)} className="bg-gray-800/80 border border-gray-700/50 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-fifa-gold/50">
              {LANGUAGES.map((l: { code: string; name: string }) => (<option key={l.code} value={l.code}>{l.name}</option>))}
            </select>
            {!isMobile && (
              <button onClick={() => setIsTranslatorOpen(!isTranslatorOpen)} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5">
                <GlobeIcon size={14} />
                {t('btnTranslator')}
              </button>
            )}
          </div>
        </div>
      </header>

      {isTranslatorOpen && !isMobile && (
        <div className="max-w-5xl mx-auto px-4 py-3">
          <SpeechTranslator userLang={userLang} languages={LANGUAGES} getAi={groqClient} onClose={() => setIsTranslatorOpen(false)} t={t} />
        </div>
      )}

      {/* Main Content */}
      <main className={`mx-auto px-4 pb-24 ${!isMobile ? 'max-w-5xl' : 'max-w-lg'}`}>
        <div className="pt-4">
          {activeTab === 'ticket' && (
            <TicketScanner isMobile={isMobile} stadiums={STADIUMS} onTicketParsed={handleTicketParsed} onManualSeat={handleManualSeat} parsedTicket={parsedTicket} onClearTicket={handleClearTicket} getAi={groqClient} userLang={userLang} stadiumMetadata={STADIUM_METADATA} t={t} />
          )}
          {activeTab === 'map' && (
            <MapLayout parsedTicket={parsedTicket} stadiums={STADIUMS} isMobile={isMobile} t={t} />
          )}
          {activeTab === 'chat' && (
            <Chatbot parsedTicket={parsedTicket} chatHistory={chatHistory} setChatHistory={setChatHistory} getAi={groqClient} userLang={userLang} isMobile={isMobile} matchInfo={MATCH_CONFIG.match} stadiumMetadata={STADIUM_METADATA} t={t} />
          )}
          {activeTab === 'knowledge' && (
            <KnowledgePanel matchInfo={MATCH_CONFIG.match} stadiums={STADIUMS} parsedTicket={parsedTicket} userLang={userLang} fallbackStandings={FALLBACK_STANDINGS} getAi={groqClient} t={t} />
          )}
          {activeTab === 'translate' && isMobile && (
            <SpeechTranslator userLang={userLang} languages={LANGUAGES} getAi={groqClient} t={t} />
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-gray-800/50 safe-bottom z-50">
        <div className={`mx-auto flex ${!isMobile ? 'max-w-5xl justify-center' : 'justify-around'} py-2 px-2`}>
          {tabs.filter(tab => !tab.mobileOnly || isMobile).map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all duration-200 ${activeTab === tab.id ? 'nav-item-active' : 'nav-item-inactive'}`}>
              {tab.icon}
              <span className="text-[10px] font-medium">{t(tab.labelKey as any)}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<AppContent />} />
    </Routes>
  );
}

export default App;
