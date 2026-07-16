import { useState, useRef, useEffect } from 'react';
import { ChatIcon, SendIcon, BrainIcon, XIcon } from './Icons';
import type { TranslationKey } from '../i18n/translations';

interface AIWrapper {
  models: {
    generateContent: (opts: { model: string; contents: string; systemInstruction?: string }) => Promise<{ text: string }>;
  };
}

interface ParsedTicket { stadium: string; gate: string; section: string; row: string; seat: string; match: string; stadium_id: string; coordinates: { name: string; lat: number; lng: number; city: string; country: string } | null; }
interface ChatMessage { role: string; content: string; }
interface MatchInfo { home_team: string; away_team: string; date: string; time: string; stage: string; }
interface ChatbotProps {
  parsedTicket: ParsedTicket | null; chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  getAi: AIWrapper; userLang: string; isMobile: boolean;
  matchInfo: MatchInfo; stadiumMetadata: Record<string, any>;
  t: (key: TranslationKey) => string;
}

const LANG_MAP: Record<string, string> = {
  en: 'English', es: 'Spanish', fr: 'French', de: 'German', pt: 'Portuguese',
  ar: 'Arabic', zh: 'Chinese', ja: 'Japanese', ko: 'Korean', hi: 'Hindi',
  it: 'Italian', ru: 'Russian',
};

export default function Chatbot({ parsedTicket, chatHistory, setChatHistory, getAi, userLang, isMobile, matchInfo, stadiumMetadata, t }: ChatbotProps) {
  const [query, setQuery] = useState('');
  const [sending, setSending] = useState(false);
  const suggestions = [t('chatSug1'), t('chatSug2'), t('chatSug3'), t('chatSug4'), t('chatSug5')];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const sendMessage = async (message: string) => {
    if (!message.trim() || sending) return;
    const userMsg: ChatMessage = { role: 'user', content: message };
    setChatHistory(prev => [...prev, userMsg]);
    setQuery('');
    setSending(true);
    try {
      if (!getAi) throw new Error('AI not available');
      const langName = LANG_MAP[userLang] || 'English';
      const systemPrompt = `You are a FIFA World Cup 2026 stadium assistant named Matchday AI. You help fans navigate stadiums, find amenities, and answer match-related questions. Match: ${matchInfo.home_team} vs ${matchInfo.away_team} (${matchInfo.stage}). Date: ${matchInfo.date} at ${matchInfo.time}. User's seat: Gate ${parsedTicket?.gate || 'unknown'}, Section ${parsedTicket?.section || 'unknown'}, Row ${parsedTicket?.row || 'unknown'}, Seat ${parsedTicket?.seat || 'unknown'}. Stadium: ${parsedTicket?.stadium || 'unknown'}. IMPORTANT: You MUST respond entirely in ${langName} (${userLang}). Be concise, friendly, and helpful. Answer in 2-3 sentences max.`;
      const resp = await getAi.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: message,
        systemInstruction: systemPrompt,
      });
      let reply = resp.text || "I'm not sure about that. Try asking something else!";
      reply = reply.replace(/^(Assistant:|AI:|Bot:)\s*/i, '');
      const botMsg: ChatMessage = { role: 'assistant', content: reply };
      setChatHistory(prev => [...prev, botMsg]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setChatHistory(prev => [...prev, { role: 'assistant', content: t('chatError') + ` (${msg})` }]);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); sendMessage(query); };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fifa-gold/20 to-fifa-red/20 flex items-center justify-center">
            <BrainIcon size={16} className="text-fifa-gold" />
          </div>
          <h2 className="text-lg font-bold">{t('chatTitle')}</h2>
        </div>
        {chatHistory.length > 0 && (
          <button onClick={() => setChatHistory([])} className="text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1">
            <XIcon size={12} />
            {t('chatClear')}
          </button>
        )}
      </div>
      {!parsedTicket && (
        <div className="card text-center py-6 hover-glow border-fifa-gold/10">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-fifa-gold/20 to-fifa-red/20 flex items-center justify-center">
            <ChatIcon size={24} className="text-fifa-gold" />
          </div>
          <p className="text-sm text-gray-400">{t('chatScanPrompt')}</p>
          <p className="text-xs text-gray-600 mt-1">{t('chatStillAsk')}</p>
        </div>
      )}
      <div className={`card space-y-3 overflow-y-auto ${isMobile ? 'max-h-[60vh]' : 'max-h-[55vh]'}`}>
        {chatHistory.length === 0 && (
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-fifa-blue to-fifa-gold flex items-center justify-center shadow-xl shadow-fifa-blue/20">
              <BrainIcon size={28} className="text-white" />
            </div>
            <p className="text-sm text-gray-400">{t('chatGreeting')}</p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => sendMessage(s)} className="text-xs bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 px-3 py-1.5 rounded-full transition-all border border-gray-700/50 hover:border-fifa-gold/30 hover:text-fifa-gold">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {chatHistory.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-gradient-to-r from-fifa-blue to-blue-700 text-white rounded-br-md shadow-lg shadow-fifa-blue/20' : 'bg-gray-800/80 text-gray-200 rounded-bl-md border border-gray-700/50'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-gray-800/80 border border-gray-700/50 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-fifa-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-fifa-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-fifa-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('chatInputPlaceholder')} className="input-field flex-1 text-sm" disabled={sending} />
        <button type="submit" disabled={sending || !query.trim()} className="btn-primary px-5 text-sm disabled:opacity-50 flex items-center gap-1.5">
          <SendIcon size={16} />
          {t('chatSend')}
        </button>
      </form>
    </div>
  );
}
