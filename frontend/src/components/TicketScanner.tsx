import { useState, useRef, useCallback } from 'react';
import { CameraIcon, ScanIcon, PenIcon, MapPinIcon, XIcon, SoccerBallIcon, TicketIcon } from './Icons';
import type { TranslationKey } from '../i18n/translations';

interface AIWrapper {
  models: {
    generateContent: (opts: { model: string; contents: string; systemInstruction?: string }) => Promise<{ text: string }>;
  };
}

interface Stadium { id: string; name: string; city: string; country: string; }
interface ParsedTicket { stadium: string; gate: string; section: string; row: string; seat: string; match: string; stadium_id: string; coordinates: { name: string; lat: number; lng: number; city: string; country: string } | null; }
interface TicketScannerProps {
  isMobile: boolean; stadiums: Stadium[]; onTicketParsed: (ticket: ParsedTicket) => void;
  onManualSeat: (data: { stadium_id: string; gate: string; section: string; row: string; seat: string }) => void;
  parsedTicket: ParsedTicket | null; onClearTicket: () => void; getAi: AIWrapper; userLang: string;
  stadiumMetadata: Record<string, any>; t: (key: TranslationKey) => string;
}

export default function TicketScanner({ isMobile, stadiums, onTicketParsed, onManualSeat, parsedTicket, onClearTicket, getAi, userLang, stadiumMetadata, t }: TicketScannerProps) {
  const [scanMode, setScanMode] = useState<'scan' | 'manual'>('scan');
  const [scannedText, setScannedText] = useState('');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [manualForm, setManualForm] = useState({ stadium_id: '', gate: '', section: '', row: '', seat: '' });
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  const stopCamera = useCallback(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
  }, []);

  const parseTicketWithAI = async (text: string) => {
    setScanning(true);
    setError('');
    try {
      const stadiumList = stadiums.map(s => `${s.id}: ${s.name}, ${s.city}`).join('; ');
      const prompt = `Parse the following ticket text for FIFA World Cup 2026. Extract: stadium_id (match one of these stadium IDs: ${stadiumList}), gate, section, row, seat. Return ONLY valid JSON with keys: stadium, gate, section, row, seat, match (format as "TeamA vs TeamB"), stadium_id. If a stadium name is found but doesn't match an ID, set stadium_id to the closest matching stadium ID. Ticket text: "${text}"`;
      const resp = await getAi.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        systemInstruction: 'You are a ticket parsing AI. Return ONLY valid JSON, no other text.',
      });
      const raw = resp.text || '';
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Could not parse AI response');
      const data = JSON.parse(jsonMatch[0]);
      const stadium = stadiums.find(s => s.id === data.stadium_id);
      const ticket: ParsedTicket = {
        stadium: data.stadium || stadium?.name || data.stadium_id,
        gate: data.gate || '',
        section: data.section || '',
        row: data.row || '',
        seat: data.seat || '',
        match: data.match || 'FIFA World Cup 2026',
        stadium_id: data.stadium_id || '',
        coordinates: stadium ? { name: stadium.name, lat: (stadium as any).lat, lng: (stadium as any).lng, city: stadium.city, country: stadium.country } : null,
      };
      onTicketParsed(ticket);
      setScannedText('');
    } catch (err: unknown) {
      setError(`${t('ticketFailedParse')} ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setScanning(false);
    }
  };

  const startCamera = async () => {
    setError('');
    setScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        await videoRef.current.play();
        const scanLoop = () => {
          if (!streamRef.current) return;
          const canvas = canvasRef.current;
          const video = videoRef.current;
          if (!canvas || !video) { animationRef.current = requestAnimationFrame(scanLoop); return; }
          const ctx = canvas.getContext('2d');
          if (!ctx) { animationRef.current = requestAnimationFrame(scanLoop); return; }
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          try {
            const jsQRModule = (window as unknown as Record<string, unknown>).jsQR;
            if (typeof jsQRModule === 'function') {
              const result = (jsQRModule as (data: Uint8ClampedArray, w: number, h: number) => { data: string } | null)(imageData.data, canvas.width, canvas.height);
              if (result?.data) { setScannedText(result.data); stopCamera(); parseTicketWithAI(result.data); return; }
            }
          } catch {}
          animationRef.current = requestAnimationFrame(scanLoop);
        };
        animationRef.current = requestAnimationFrame(scanLoop);
      }
    } catch {
      setError(t('ticketCameraError'));
      setScanMode('manual');
      setScanning(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.stadium_id || !manualForm.gate || !manualForm.section || !manualForm.row || !manualForm.seat) {
      setError(t('ticketAllFields'));
      return;
    }
    setError('');
    onManualSeat(manualForm);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <canvas ref={canvasRef} className="hidden" />

      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fifa-gold/20 to-fifa-blue/20 flex items-center justify-center">
            <TicketIcon size={16} className="text-fifa-gold" />
          </div>
          <h2 className="text-lg font-bold">{t('ticketTitle')}</h2>
        </div>
        <div className="flex gap-1 bg-gray-800/50 rounded-lg p-1">
          <button onClick={() => setScanMode('scan')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${scanMode === 'scan' ? 'bg-fifa-blue text-white shadow-lg shadow-fifa-blue/20' : 'text-gray-400 hover:text-white'}`}>
            <ScanIcon size={14} />
            {t('ticketScan')}
          </button>
          <button onClick={() => { setScanMode('manual'); stopCamera(); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${scanMode === 'manual' ? 'bg-fifa-blue text-white shadow-lg shadow-fifa-blue/20' : 'text-gray-400 hover:text-white'}`}>
            <PenIcon size={14} />
            {t('ticketManual')}
          </button>
        </div>
      </div>

      {/* Camera Scan */}
      {!parsedTicket && scanMode === 'scan' && isMobile && (
        <div className="card space-y-3 hover-glow">
          {!scanning ? (
            <button onClick={startCamera} className="btn-primary w-full flex items-center justify-center gap-2">
              <CameraIcon size={18} />
              {t('ticketOpenCamera')}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3]">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-2 border-fifa-gold/50 rounded-xl" />
                <div className="absolute top-3 left-3 right-3 flex justify-center">
                  <div className="bg-green-900/80 backdrop-blur-sm text-green-300 px-3 py-1 rounded-full text-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    {t('ticketScanning')}
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-2 border-fifa-gold/60 rounded-xl" />
                </div>
              </div>
              <button onClick={stopCamera} className="btn-secondary w-full text-sm flex items-center justify-center gap-2">
                <XIcon size={14} />
                {t('ticketCancel')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Manual Entry */}
      {(scanMode === 'manual' || !isMobile) && !parsedTicket && (
        <form onSubmit={handleManualSubmit} className="card space-y-3 hover-glow">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1">
                <MapPinIcon size={10} className="text-fifa-gold" />
                {t('ticketStadium')}
              </label>
              <select value={manualForm.stadium_id} onChange={(e) => setManualForm(p => ({ ...p, stadium_id: e.target.value }))} className="input-field text-sm">
                <option value="">{t('ticketSelectStadium')}</option>
                {stadiums.map((s) => (<option key={s.id} value={s.id}>{s.name} ({s.city})</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('ticketGate')}</label>
              <input type="text" placeholder="e.g. A" value={manualForm.gate} onChange={(e) => setManualForm(p => ({ ...p, gate: e.target.value }))} className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('ticketSection')}</label>
              <input type="text" placeholder="e.g. 124" value={manualForm.section} onChange={(e) => setManualForm(p => ({ ...p, section: e.target.value }))} className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('ticketRow')}</label>
              <input type="text" placeholder="e.g. 15" value={manualForm.row} onChange={(e) => setManualForm(p => ({ ...p, row: e.target.value }))} className="input-field text-sm" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">{t('ticketSeat')}</label>
              <input type="text" placeholder="e.g. 12A" value={manualForm.seat} onChange={(e) => setManualForm(p => ({ ...p, seat: e.target.value }))} className="input-field text-sm" />
            </div>
          </div>
          <button type="submit" className="btn-gold w-full text-sm flex items-center justify-center gap-2">
            <MapPinIcon size={16} />
            {t('ticketFindSeat')}
          </button>
        </form>
      )}

      {/* Paste Text */}
      {!parsedTicket && (scanMode === 'scan' || !isMobile) && (
        <div className="card space-y-2 hover-glow">
          <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1">
            <ScanIcon size={10} className="text-fifa-gold" />
            {t('ticketPasteText')}
          </label>
          <textarea value={scannedText} onChange={(e) => setScannedText(e.target.value)} placeholder={t('ticketPastePlaceholder')} rows={3} className="input-field text-sm resize-none" />
          <button onClick={() => parseTicketWithAI(scannedText)} disabled={scanning || !scannedText.trim()} className="btn-secondary w-full text-sm disabled:opacity-50 flex items-center justify-center gap-2">
            {scanning ? (
              <>
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t('ticketParsing')}
              </>
            ) : (
              <>
                <SoccerBallIcon size={14} />
                {t('ticketParseBtn')}
              </>
            )}
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/50 border border-red-800/50 rounded-xl px-4 py-3 text-sm text-red-300 animate-slide-up flex items-center gap-2">
          <XIcon size={14} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Parsed Ticket */}
      {parsedTicket && (
        <div className="card-glow space-y-3 animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-fifa-gold to-amber-500 flex items-center justify-center">
                <TicketIcon size={12} className="text-white" />
              </div>
              <h3 className="text-sm font-semibold text-fifa-gold">{t('ticketParsed')}</h3>
            </div>
            <button onClick={onClearTicket} className="text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1">
              <XIcon size={12} />
              {t('ticketClear')}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-800/40 rounded-lg p-2">
              <span className="text-gray-500 text-[10px] uppercase tracking-wider flex items-center gap-1">
                <MapPinIcon size={8} className="text-fifa-gold" />
                {t('ticketStadium')}
              </span>
              <p className="text-white font-medium text-xs mt-0.5">{parsedTicket.stadium}</p>
            </div>
            <div className="bg-gray-800/40 rounded-lg p-2">
              <span className="text-gray-500 text-[10px] uppercase tracking-wider">{t('ticketGate')}</span>
              <p className="text-white font-medium text-xs mt-0.5">{parsedTicket.gate}</p>
            </div>
            <div className="bg-gray-800/40 rounded-lg p-2">
              <span className="text-gray-500 text-[10px] uppercase tracking-wider">{t('ticketSection')}</span>
              <p className="text-white font-medium text-xs mt-0.5">{parsedTicket.section}</p>
            </div>
            <div className="bg-gray-800/40 rounded-lg p-2">
              <span className="text-gray-500 text-[10px] uppercase tracking-wider">{t('ticketRowSeat')}</span>
              <p className="text-white font-medium text-xs mt-0.5">{parsedTicket.row} / {parsedTicket.seat}</p>
            </div>
            <div className="col-span-2 bg-gray-800/40 rounded-lg p-2">
              <span className="text-gray-500 text-[10px] uppercase tracking-wider flex items-center gap-1">
                <SoccerBallIcon size={8} className="text-fifa-gold" />
                {t('ticketMatch')}
              </span>
              <p className="text-white font-medium text-xs mt-0.5">{parsedTicket.match}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
