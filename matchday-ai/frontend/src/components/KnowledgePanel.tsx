import { useState, useEffect } from 'react';
import { KNOCKOUT_BRACKET } from '../data/matchData';
import { ChartIcon, RefreshIcon, TrophyIcon, SoccerBallIcon, TicketIcon, MapPinIcon, StarIcon } from './Icons';
import type { TranslationKey } from '../i18n/translations';

interface AIWrapper {
  models: {
    generateContent: (opts: { model: string; contents: string; systemInstruction?: string }) => Promise<{ text: string }>;
  };
}

interface Stadium { id: string; name: string; city: string; country: string; }
interface ParsedTicket { stadium: string; gate: string; section: string; row: string; seat: string; match: string; stadium_id: string; }
interface MatchInfo { home_team: string; away_team: string; date: string; time: string; stage: string; venue?: string; }
interface StandingGroup { group: string; teams: Array<{ name: string; pts: number; gd: number }>; }
interface LiveMatch { homeTeam: string; awayTeam: string; homeScore: number | null; awayScore: number | null; status: string; minute?: string; }
interface KnowledgePanelProps { matchInfo: MatchInfo; stadiums: Stadium[]; parsedTicket: ParsedTicket | null; userLang: string; fallbackStandings: StandingGroup[]; getAi: AIWrapper | null; t: (key: TranslationKey) => string; }

export default function KnowledgePanel({ matchInfo, stadiums, parsedTicket, userLang, fallbackStandings, getAi, t }: KnowledgePanelProps) {
  const [standings, setStandings] = useState<StandingGroup[]>(fallbackStandings);
  const [liveScores, setLiveScores] = useState<LiveMatch[]>([]);
  const [activeStandingGroup, setActiveStandingGroup] = useState(0);
  const [loading, setLoading] = useState(false);
  const [aiAvailable] = useState(!!getAi);

  const tryFetchData = async () => {
    if (!getAi) return;
    setLoading(true);
    try {
      const resp = await getAi.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: 'Generate realistic FIFA World Cup 2026 group standings (all 12 groups A-L, 4 teams each with name, pts, gd). Include teams like USA, Brazil, Argentina, France, England, Spain, Germany, Portugal, Italy, Mexico, Japan, South Korea, Morocco, Senegal, Colombia, Netherlands, Belgium, Croatia, Uruguay, Switzerland, Denmark, Poland, Turkey, Peru, Australia, Ecuador, Iran, Cameroon, Nigeria, Ghana, Egypt, Saudi Arabia, China, Canada, Costa Rica, Panama, Tunisia, Algeria, Serbia, Austria, Ukraine, Mali, New Zealand, DR Congo, Jamaica, Qatar, Panama, Iraq, Uzbekistan.',
        systemInstruction: 'You are a sports data API. Respond with ONLY valid JSON array. Format: [{"group":"A","teams":[{"name":"USA","pts":9,"gd":8}]}]. No other text, no markdown.',
      });
      const text = resp.text || '';
      const m = text.match(/\[[\s\S]*\]/);
      if (m) {
        const d = JSON.parse(m[0]);
        if (Array.isArray(d) && d.length > 0) setStandings(d);
      }
    } catch {}
    try {
      if (!getAi) return;
      const resp2 = await getAi.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: 'Generate FIFA World Cup 2026 recent results: Semi-Finals (Argentina 2-1 Brazil, Spain 1-0 Netherlands), and upcoming Third Place match (Brazil vs Netherlands on July 18) and Final (Brazil vs Argentina on July 19 at MetLife Stadium). Also include 2-3 recent Quarter-Final results.',
        systemInstruction: 'You are a sports data API. Respond with ONLY valid JSON array. Format: [{"homeTeam":"Argentina","awayTeam":"Brazil","homeScore":2,"awayScore":1,"status":"FT","minute":"90+"}]. For upcoming matches use null scores and "Upcoming" status. No other text, no markdown.',
      });
      const text2 = resp2.text || '';
      const m2 = text2.match(/\[[\s\S]*\]/);
      if (m2) {
        const d2 = JSON.parse(m2[0]);
        if (Array.isArray(d2)) setLiveScores(d2);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { tryFetchData(); }, []);

  const formatDate = (dateStr: string) => {
    try { return new Date(dateStr).toLocaleDateString(userLang || 'en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }); }
    catch { return dateStr; }
  };

  return (
    <div className="my-4 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fifa-red/20 to-fifa-gold/20 flex items-center justify-center">
            <ChartIcon size={16} className="text-fifa-red" />
          </div>
          <h2 className="text-lg font-bold">{t('liveTitle')}</h2>
        </div>
        {aiAvailable && (
          <button onClick={tryFetchData} disabled={loading} className="text-xs bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 border border-gray-700/50">
            <RefreshIcon size={12} className={loading ? 'animate-spin' : ''} />
            {t('liveRefresh')}
          </button>
        )}
      </div>

      {/* Match Card */}
      {matchInfo && (
        <div className="match-card mb-3 p-4">
          <div className="relative">
            <div className="flex items-center justify-center mb-3">
              <span className="badge bg-fifa-red/20 text-fifa-red text-xs flex items-center gap-1">
                <TrophyIcon size={10} />
                {matchInfo.stage}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-fifa-blue to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-2 text-xl font-black shadow-xl shadow-fifa-blue/30">
                  {matchInfo.home_team[0]}
                </div>
                <p className="text-sm font-bold truncate">{matchInfo.home_team}</p>
              </div>
              <div className="text-center">
                <div className="font-black text-3xl text-gradient-gold">vs</div>
                <p className="text-xs text-gray-400 mt-1">{formatDate(matchInfo.date)}</p>
                <p className="text-xs text-gray-500">{matchInfo.time}</p>
              </div>
              <div className="flex-1 text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-fifa-red to-rose-700 rounded-2xl flex items-center justify-center mx-auto mb-2 text-xl font-black shadow-xl shadow-fifa-red/30">
                  {matchInfo.away_team[0]}
                </div>
                <p className="text-sm font-bold truncate">{matchInfo.away_team}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Scores */}
      {liveScores.length > 0 && (
        <div className="card mb-3 hover-glow">
          <h3 className="text-sm font-semibold mb-2 text-fifa-red flex items-center gap-1.5">
            <SoccerBallIcon size={14} className="text-fifa-red" />
            {t('liveScores')}
          </h3>
          <div className="space-y-2">
            {liveScores.map((m, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-800/50 rounded-xl px-3 py-2.5 text-sm border border-gray-700/30">
                <span className="flex-1 font-medium">{m.homeTeam}</span>
                <span className="font-black px-4 text-fifa-gold">{m.homeScore !== null ? `${m.homeScore} - ${m.awayScore}` : 'vs'}</span>
                <span className="flex-1 text-right font-medium">{m.awayTeam}</span>
                <span className="text-[10px] text-gray-500 ml-2 w-16 text-right">{m.minute || m.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Knockout Bracket */}
      {KNOCKOUT_BRACKET.length > 0 && (
        <div className="card mb-3 hover-glow">
          <h3 className="text-sm font-semibold mb-3 text-fifa-gold flex items-center gap-1.5">
            <TrophyIcon size={14} className="text-fifa-gold" />
            {t('liveBracket')}
          </h3>
          <div className="space-y-4">
            {KNOCKOUT_BRACKET.map((round) => (
              <div key={round.round}>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5 font-medium">{round.round}</p>
                <div className="space-y-1">
                  {round.matches.map((m, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-800/40 rounded-lg px-3 py-1.5 text-xs border border-gray-700/20">
                      <span className={`flex-1 ${m.homeScore > m.awayScore ? 'font-bold text-white' : 'text-gray-400'}`}>{m.home}</span>
                      <span className="font-bold px-3 text-gray-300">{m.homeScore} - {m.awayScore}</span>
                      <span className={`flex-1 text-right ${m.awayScore > m.homeScore ? 'font-bold text-white' : 'text-gray-400'}`}>{m.away}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="bg-gradient-to-r from-fifa-gold/10 to-amber-500/10 border border-fifa-gold/30 rounded-xl px-4 py-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-fifa-gold font-bold flex items-center justify-center gap-1">
                <TrophyIcon size={10} />
                {t('liveFinal')}
              </p>
              <p className="text-sm font-bold mt-1">{matchInfo.home_team} vs {matchInfo.away_team}</p>
              <p className="text-[10px] text-gray-400">{formatDate(matchInfo.date)} · {matchInfo.time}</p>
              <p className="text-[10px] text-gray-500">{matchInfo.venue}</p>
            </div>
          </div>
        </div>
      )}

      {/* Standings */}
      {standings.length > 0 && (
        <div className="card mb-3 hover-glow">
          <h3 className="text-sm font-semibold mb-2 text-fifa-gold flex items-center gap-1.5">
            <StarIcon size={14} className="text-fifa-gold" />
            {t('liveStandings')}
          </h3>
          <div className="flex gap-1 mb-2 overflow-x-auto scrollbar-hide">
            {standings.map((g, i) => (
              <button key={g.group} onClick={() => setActiveStandingGroup(i)} className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex-shrink-0 ${activeStandingGroup === i ? 'bg-fifa-blue text-white shadow-lg shadow-fifa-blue/20' : 'bg-gray-800/80 text-gray-400 hover:text-white'}`}>Group {g.group}</button>
            ))}
          </div>
          {standings[activeStandingGroup] && (
            <div>
              <div className="flex text-[10px] text-gray-600 px-2 pb-1 border-b border-gray-800/50">
                <span className="w-6">#</span><span className="flex-1">{t('liveTeam')}</span><span className="w-10 text-center">{t('livePts')}</span><span className="w-10 text-center">{t('liveGD')}</span>
              </div>
              {standings[activeStandingGroup].teams.map((team, i) => (
                <div key={team.name} className={`flex items-center px-2 py-1.5 text-xs border-b border-gray-800/30 ${i < 2 ? 'bg-green-900/10' : ''}`}>
                  <span className="w-6 text-gray-500">{i + 1}</span>
                  <span className="flex-1 font-medium">{team.name}</span>
                  <span className="w-10 text-center font-bold">{team.pts}</span>
                  <span className="w-10 text-center text-gray-400">{team.gd > 0 ? `+${team.gd}` : team.gd}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Your Match */}
      {parsedTicket && (
        <div className="card mb-3 hover-glow border-fifa-gold/10">
          <h3 className="text-sm font-semibold mb-2 text-fifa-gold flex items-center gap-1.5">
            <TicketIcon size={14} />
            {t('liveYourMatch')}
          </h3>
          <p className="text-sm text-gray-300">{parsedTicket.match}</p>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <MapPinIcon size={10} />
            {parsedTicket.stadium} · Gate {parsedTicket.gate} · Section {parsedTicket.section}
          </p>
        </div>
      )}

      {/* Host Cities */}
      <div className="card hover-glow">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
          <MapPinIcon size={14} className="text-fifa-blue" />
          {t('liveHostCities')}
        </h3>
        <div className="grid grid-cols-2 gap-1.5">
          {stadiums.map((s, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-800/50 transition-all group">
              <div className="stadium-dot group-hover:scale-150 transition-transform" />
              <span className="text-xs text-gray-400 group-hover:text-white transition-colors">{s.city}</span>
              <span className="text-[10px] ml-auto">{s.country === 'USA' ? '🇺🇸' : s.country === 'Mexico' ? '🇲🇽' : '🇨🇦'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
