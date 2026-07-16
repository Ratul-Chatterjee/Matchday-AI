import { useState, useRef, useCallback } from 'react';
import { GlobeIcon, MicIcon, StopIcon, VolumeIcon, CopyIcon, XIcon, SwapIcon, LanguagesIcon } from './Icons';
import type { TranslationKey } from '../i18n/translations';

interface AIWrapper {
  models: {
    generateContent: (opts: { model: string; contents: string; systemInstruction?: string }) => Promise<{ text: string }>;
  };
}

interface Language { code: string; name: string; }
interface SpeechTranslatorProps { userLang: string; languages: Language[]; getAi: AIWrapper | null; onClose?: () => void; t: (key: TranslationKey) => string; }

const LANG_MAP: Record<string, string> = {
  en: 'English', es: 'Spanish', fr: 'French', de: 'German', pt: 'Portuguese',
  ar: 'Arabic', zh: 'Chinese (Mandarin)', ja: 'Japanese', ko: 'Korean', hi: 'Hindi',
  it: 'Italian', ru: 'Russian',
};

export default function SpeechTranslator({ userLang, languages, getAi, onClose, t }: SpeechTranslatorProps) {
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [transcript, setTranscript] = useState('');
  const [translated, setTranslated] = useState('');
  const [targetLang, setTargetLang] = useState(userLang === 'en' ? 'es' : userLang);
  const [sourceLang, setSourceLang] = useState('auto');
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState('');
  const [translating, setTranslating] = useState(false);
  const recognitionRef = useRef<any>(null);

  const translateText = async (text: string) => {
    if (!getAi) { setError('AI service not configured.'); return; }
    if (!text.trim()) { setError('Please enter some text to translate.'); return; }
    setTranslating(true);
    setError('');
    try {
      const langName = LANG_MAP[targetLang] || targetLang;
      const srcHint = sourceLang === 'auto' ? 'auto-detect the source language' : `the source language is ${LANG_MAP[sourceLang] || sourceLang}`;
      const prompt = `Translate the following text to ${langName}. ${srcHint}. Return ONLY the translated text, nothing else. Do not add quotes, explanations, or any prefix/suffix. Text: "${text}"`;
      const resp = await getAi.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        systemInstruction: 'You are a professional translator. Return ONLY the translated text with no additional content, no quotation marks, no explanations.',
      });
      const translatedText = (resp.text || '').replace(/^["']|["']$/g, '').trim();
      if (translatedText) {
        setTranslated(translatedText);
        speakText(translatedText);
      } else {
        setError('Translation returned empty. Please try again.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Translation failed: ${msg}`);
    } finally {
      setTranslating(false);
    }
  };

  const handleTextTranslate = () => {
    if (!inputText.trim()) return;
    setTranscript(inputText);
    translateText(inputText);
  };

  const startListening = useCallback(() => {
    setError('');
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setError('Speech recognition is not supported in this browser. Please type your text instead.');
      return;
    }
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = sourceLang === 'auto' ? (userLang || 'en') : sourceLang;
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setInputText(text);
      translateText(text);
    };
    recognition.onerror = (e: any) => {
      if (e.error === 'not-allowed') {
        setError('Microphone access denied. Please type your text instead.');
      } else {
        setError('Could not recognize speech. Please try again or type your text.');
      }
      setIsListening(false);
    };
    recognition.onend = () => { setIsListening(false); };
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [userLang, sourceLang, targetLang]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const speakText = (text: string) => {
    if (!window.speechSynthesis) { return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLang;
    utterance.rate = 0.9;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => { setSpeaking(false); };
    window.speechSynthesis.speak(utterance);
  };

  const swapLanguages = () => {
    if (sourceLang === 'auto') return;
    const prevSource = sourceLang;
    const prevTarget = targetLang;
    setSourceLang(prevTarget);
    setTargetLang(prevSource);
    if (translated) {
      setInputText(translated);
      setTranscript(translated);
    }
  };

  return (
    <div className="card space-y-4 animate-slide-up hover-glow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-400/20 flex items-center justify-center">
            <LanguagesIcon size={14} className="text-emerald-400" />
          </div>
          <h3 className="text-sm font-semibold">{t('voiceTitle')}</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-gray-800">
            <XIcon size={16} />
          </button>
        )}
      </div>

      {/* Language Selectors */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="text-[10px] text-gray-500 mb-1 block uppercase tracking-wider">{t('voiceFrom')}</label>
          <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)} className="input-field text-sm">
            <option value="auto">{t('voiceAutoDetect')}</option>
            {languages.map((l: Language) => (<option key={l.code} value={l.code}>{l.name}</option>))}
          </select>
        </div>
        <button onClick={swapLanguages} className="mb-1 p-2 text-gray-400 hover:text-fifa-gold transition-colors rounded-lg hover:bg-gray-800" title="Swap languages">
          <SwapIcon size={18} />
        </button>
        <div className="flex-1">
          <label className="text-[10px] text-gray-500 mb-1 block uppercase tracking-wider">{t('voiceTo')}</label>
          <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} className="input-field text-sm">
            {languages.map((l: Language) => (<option key={l.code} value={l.code}>{l.name}</option>))}
          </select>
        </div>
      </div>

      {/* Text Input */}
      <div>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t('voiceTypePlaceholder')}
          rows={2}
          className="input-field text-sm resize-none"
        />
      </div>

      {/* Translate Button */}
      <button onClick={handleTextTranslate} disabled={translating || !inputText.trim()} className="btn-primary w-full text-sm disabled:opacity-50 flex items-center justify-center gap-2">
        {translating ? (
          <>
            <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {t('voiceTranslating')}
          </>
        ) : (
          <>
            <GlobeIcon size={16} />
            {t('voiceTranslateBtn')}
          </>
        )}
      </button>

      {/* Microphone Button */}
      <div className="flex justify-center">
        {!isListening ? (
          <button onClick={startListening} className="w-16 h-16 bg-gradient-to-br from-fifa-red to-rose-700 rounded-full flex items-center justify-center hover:from-rose-700 hover:to-fifa-red transition-all active:scale-90 shadow-xl shadow-fifa-red/30" title="Speak to translate">
            <MicIcon size={24} className="text-white" />
          </button>
        ) : (
          <div className="text-center">
            <button onClick={stopListening} className="w-16 h-16 bg-gradient-to-br from-red-900 to-red-800 rounded-full flex items-center justify-center animate-pulse-slow shadow-xl shadow-red-900/30">
              <StopIcon size={24} className="text-white" />
            </button>
            <p className="text-xs text-gray-500 mt-2 animate-pulse">{t('voiceListening')}</p>
          </div>
        )}
      </div>

      {/* Transcript */}
      {transcript && (
        <div>
          <label className="text-xs text-gray-500 mb-1 block uppercase tracking-wider">{t('voiceOriginal')}</label>
          <div className="bg-gray-800/60 rounded-xl px-3 py-2 text-sm text-gray-200 border border-gray-700/30">{transcript}</div>
        </div>
      )}

      {/* Translation */}
      {translated && (
        <div>
          <label className="text-xs text-gray-500 mb-1 block uppercase tracking-wider">{t('voiceTranslated')}</label>
          <div className="bg-fifa-blue/10 border border-fifa-blue/20 rounded-xl px-3 py-2 text-sm text-white">{translated}</div>
        </div>
      )}

      {/* Audio/Copy Controls */}
      {translated && (
        <div className="flex gap-2">
          {!speaking ? (
            <button onClick={() => speakText(translated)} className="btn-secondary flex-1 text-xs flex items-center justify-center gap-1.5">
              <VolumeIcon size={14} />
              {t('voiceListen')}
            </button>
          ) : (
            <button onClick={stopSpeaking} className="btn-danger flex-1 text-xs flex items-center justify-center gap-1.5">
              <StopIcon size={14} />
              {t('voiceStop')}
            </button>
          )}
          <button onClick={() => { navigator.clipboard.writeText(translated); }} className="btn-secondary text-xs px-3 flex items-center gap-1.5">
            <CopyIcon size={14} />
            {t('voiceCopy')}
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/50 border border-red-800/50 rounded-xl px-3 py-2 text-xs text-red-300 flex items-center gap-2">
          <XIcon size={12} className="flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
