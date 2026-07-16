import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TicketIcon, MapPinIcon, ChatIcon, ChartIcon, GlobeIcon,
  TrophyIcon, StarIcon, ZapIcon, ShieldIcon, SparklesIcon,
  StadiumIcon, UsersIcon, CalendarIcon, BrainIcon, ChevronRightIcon,
  ArrowRightIcon, SoccerBallIcon, FlagIcon, WifiIcon, MenuIcon, XIcon,
} from './Icons';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1200&q=80',
  'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=1200&q=80',
  'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&q=80',
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80',
  'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=1200&q=80',
];

const FEATURES = [
  { icon: TicketIcon, title: 'Smart Ticket Scanner', desc: 'Scan your ticket QR code or paste ticket text. AI instantly parses your seat, gate, and section details.', color: 'from-blue-500 to-cyan-400' },
  { icon: MapPinIcon, title: 'Stadium Navigation', desc: 'Interactive maps with turn-by-turn guidance from gate to seat across 16 world-class stadiums.', color: 'from-red-500 to-rose-400' },
  { icon: BrainIcon, title: 'AI Stadium Assistant', desc: 'Ask anything about amenities, food, restrooms, or the match. Get instant AI-powered answers.', color: 'from-amber-500 to-yellow-400' },
  { icon: GlobeIcon, title: 'Multi-Language Support', desc: 'Real-time voice and text translation in 12 languages. Never miss a moment due to language barriers.', color: 'from-emerald-500 to-teal-400' },
  { icon: ChartIcon, title: 'Live Match Center', desc: 'Real-time scores, group standings, knockout brackets, and match updates throughout the tournament.', color: 'from-purple-500 to-violet-400' },
  { icon: ShieldIcon, title: '16 Stadiums, 3 Countries', desc: 'Complete coverage of all FIFA World Cup 2026 venues across USA, Mexico, and Canada.', color: 'from-pink-500 to-fuchsia-400' },
];

const STATS = [
  { value: '16', label: 'Stadiums', icon: StadiumIcon },
  { value: '48', label: 'Teams', icon: UsersIcon },
  { value: '104', label: 'Matches', icon: SoccerBallIcon },
  { value: '3', label: 'Countries', icon: FlagIcon },
];

const HOST_CITIES = [
  { city: 'New York', stadium: 'MetLife Stadium', country: 'USA', emoji: '🗽' },
  { city: 'Los Angeles', stadium: 'SoFi Stadium', country: 'USA', emoji: '🌴' },
  { city: 'Dallas', stadium: 'AT&T Stadium', country: 'USA', emoji: '🤠' },
  { city: 'Miami', stadium: 'Hard Rock Stadium', country: 'USA', emoji: '🏖️' },
  { city: 'Mexico City', stadium: 'Estadio Azteca', country: 'Mexico', emoji: '🌮' },
  { city: 'Toronto', stadium: 'BMO Field', country: 'Canada', emoji: '🍁' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrollY > 50 ? 'bg-gray-950/95 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/50' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-fifa-blue to-fifa-gold flex items-center justify-center">
                <SoccerBallIcon size={18} className="text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold tracking-tight">
                Matchday <span className="text-fifa-gold">AI</span>
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#stadiums" className="text-sm text-gray-300 hover:text-white transition-colors">Stadiums</a>
              <a href="#stats" className="text-sm text-gray-300 hover:text-white transition-colors">Tournament</a>
              <button onClick={() => navigate('/app')} className="bg-fifa-blue hover:bg-blue-800 text-white font-semibold py-2 px-5 rounded-xl text-sm transition-all duration-200 active:scale-95">
                Go To App
              </button>
            </div>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-gray-300 hover:text-white">
              {isMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden bg-gray-900/98 backdrop-blur-xl border-t border-white/10 animate-slide-up">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" onClick={() => setIsMenuOpen(false)} className="block py-2 text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#stadiums" onClick={() => setIsMenuOpen(false)} className="block py-2 text-gray-300 hover:text-white transition-colors">Stadiums</a>
              <a href="#stats" onClick={() => setIsMenuOpen(false)} className="block py-2 text-gray-300 hover:text-white transition-colors">Tournament</a>
              <button onClick={() => { setIsMenuOpen(false); navigate('/app'); }} className="w-full bg-fifa-blue hover:bg-blue-800 text-white font-semibold py-3 px-6 rounded-xl text-sm transition-all duration-200 active:scale-95">
                Go To App
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background Image Slider */}
        <div className="absolute inset-0 overflow-hidden">
          {HERO_IMAGES.map((img, i) => (
            <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
              <img src={img} alt="" className="w-full h-full object-cover" loading={i === 0 ? 'eager' : 'lazy'} />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950/80 via-gray-950/60 to-gray-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-fifa-blue/20 via-transparent to-fifa-red/20" />
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-4 sm:left-10 w-2 h-2 bg-fifa-gold rounded-full animate-pulse-slow opacity-60" />
        <div className="absolute top-40 right-8 sm:right-20 w-3 h-3 bg-fifa-blue rounded-full animate-pulse-slow opacity-40" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-40 left-10 sm:left-20 w-2 h-2 bg-fifa-red rounded-full animate-pulse-slow opacity-50" style={{ animationDelay: '2s' }} />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center pt-20 sm:pt-0">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-fifa-blue/20 border border-fifa-blue/30 rounded-full px-4 py-1.5 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fifa-gold opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-fifa-gold" />
              </span>
              <span className="text-xs sm:text-sm font-medium text-fifa-gold">FIFA World Cup 2026</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black leading-none mb-4 sm:mb-6">
              <span className="block text-white">Your AI-Powered</span>
              <span className="block mt-1 sm:mt-2">
                <span className="bg-gradient-to-r from-fifa-blue via-fifa-gold to-fifa-red bg-clip-text text-transparent">
                  Matchday
                </span>
                <span className="text-white ml-2 sm:ml-4">Companion</span>
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
              Navigate 16 stadiums across 3 countries. Scan your ticket, find your seat,
              get AI-powered guidance, and never miss a moment of the beautiful game.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8">
              <button
                onClick={() => navigate('/app')}
                className="w-full sm:w-auto group bg-gradient-to-r from-fifa-blue to-blue-700 hover:from-blue-700 hover:to-fifa-blue text-white font-bold py-4 px-8 rounded-2xl text-base transition-all duration-300 active:scale-95 shadow-xl shadow-fifa-blue/30 flex items-center justify-center gap-3"
              >
                <ZapIcon size={20} />
                Get Started
                <ArrowRightIcon size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/app')}
                className="w-full sm:w-auto bg-white/10 hover:bg-white/15 backdrop-blur-sm text-white font-semibold py-4 px-8 rounded-2xl text-base transition-all duration-300 active:scale-95 border border-white/20 hover:border-white/30 flex items-center justify-center gap-3"
              >
                <SoccerBallIcon size={18} />
                Go To App
              </button>
            </div>

            <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-400">
              <div className="flex items-center gap-1.5">
                <WifiIcon size={14} className="text-fifa-gold" />
                <span>PWA Ready</span>
              </div>
              <div className="flex items-center gap-1.5">
                <GlobeIcon size={14} className="text-fifa-gold" />
                <span>12 Languages</span>
              </div>
              <div className="flex items-center gap-1.5">
                <SparklesIcon size={14} className="text-fifa-gold" />
                <span>AI Powered</span>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Stats Section */}
      <section id="stats" className="relative py-16 sm:py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-fifa-blue/5 to-gray-950" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {STATS.map((stat, i) => (
              <div key={i} className="group text-center p-4 sm:p-6 rounded-2xl bg-gray-900/60 border border-white/5 hover:border-fifa-gold/30 transition-all duration-300 hover:shadow-xl hover:shadow-fifa-gold/5">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-fifa-blue/20 to-fifa-gold/20 mb-3 group-hover:scale-110 transition-transform">
                  <stat.icon size={20} className="text-fifa-gold" />
                </div>
                <div className="text-3xl sm:text-4xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-xs sm:text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-16 sm:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900/50 to-gray-950" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-fifa-gold/10 border border-fifa-gold/20 rounded-full px-4 py-1.5 mb-4">
              <SparklesIcon size={14} className="text-fifa-gold" />
              <span className="text-xs sm:text-sm font-medium text-fifa-gold">Powerful Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
              Everything You Need for{' '}
              <span className="bg-gradient-to-r from-fifa-gold to-fifa-red bg-clip-text text-transparent">
                Match Day
              </span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
              From ticket scanning to real-time navigation, AI-powered assistance to live scores
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {FEATURES.map((feature, i) => (
              <div key={i} className="group relative p-5 sm:p-6 rounded-2xl bg-gray-900/60 border border-white/5 hover:border-white/15 transition-all duration-500 hover:shadow-2xl hover:shadow-black/50 overflow-hidden">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-5 rounded-full -translate-y-16 translate-x-16 group-hover:opacity-10 group-hover:scale-150 transition-all duration-500`} />
                <div className={`relative inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon size={22} className="text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-fifa-gold text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>Learn more</span>
                  <ChevronRightIcon size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stadiums Section */}
      <section id="stadiums" className="relative py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-fifa-blue/5 to-gray-950" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-fifa-blue/10 border border-fifa-blue/20 rounded-full px-4 py-1.5 mb-4">
              <StadiumIcon size={14} className="text-fifa-blue" />
              <span className="text-xs sm:text-sm font-medium text-blue-300">16 World-Class Venues</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
              Across{' '}
              <span className="bg-gradient-to-r from-fifa-blue to-fifa-gold bg-clip-text text-transparent">
                North America
              </span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
              The first FIFA World Cup hosted by three nations — USA, Mexico, and Canada
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {HOST_CITIES.map((city, i) => (
              <div key={i} className="group relative p-4 sm:p-5 rounded-2xl bg-gray-900/60 border border-white/5 hover:border-fifa-gold/30 transition-all duration-300 hover:shadow-xl hover:shadow-fifa-gold/5 overflow-hidden">
                <div className="absolute top-0 right-0 text-6xl opacity-5 group-hover:opacity-10 transition-opacity">{city.emoji}</div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fifa-blue/30 to-fifa-gold/30 flex items-center justify-center text-lg">
                      {city.emoji}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm sm:text-base">{city.city}</h3>
                      <p className="text-xs text-gray-400">{city.country}</p>
                    </div>
                  </div>
                  <p className="text-xs text-fifa-gold font-medium">{city.stadium}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => navigate('/app')}
              className="inline-flex items-center gap-2 bg-fifa-blue/20 hover:bg-fifa-blue/30 border border-fifa-blue/30 text-white font-semibold py-3 px-6 rounded-xl text-sm transition-all duration-200 active:scale-95"
            >
              <MapPinIcon size={16} />
              Explore All Stadiums
              <ArrowRightIcon size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-16 sm:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900/30 to-gray-950" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-4">
              <ZapIcon size={14} className="text-emerald-400" />
              <span className="text-xs sm:text-sm font-medium text-emerald-400">How It Works</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
              Get to Your Seat in{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-fifa-gold bg-clip-text text-transparent">
                3 Simple Steps
              </span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              { step: '01', icon: TicketIcon, title: 'Scan Your Ticket', desc: 'Use your camera to scan the QR code or paste the ticket text. AI instantly extracts your details.', gradient: 'from-fifa-blue to-blue-600' },
              { step: '02', icon: MapPinIcon, title: 'Get Directions', desc: 'Interactive maps guide you from the gate to your exact seat with step-by-step navigation.', gradient: 'from-fifa-red to-rose-600' },
              { step: '03', icon: SparklesIcon, title: 'Enjoy the Match', desc: 'Ask the AI assistant anything about the stadium, food, or live match updates in your language.', gradient: 'from-fifa-gold to-amber-500' },
            ].map((item, i) => (
              <div key={i} className="relative text-center group">
                {i < 2 && <div className="hidden sm:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-white/20 to-transparent" />}
                <div className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${item.gradient} mb-4 shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon size={28} className="text-white" />
                </div>
                <div className="text-xs text-gray-500 font-mono mb-2">STEP {item.step}</div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 sm:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-fifa-blue/10 to-gray-950" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="relative p-8 sm:p-12 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-fifa-blue/20 via-gray-900/80 to-fifa-red/20 border border-white/10 rounded-3xl" />
            <div className="absolute inset-0 opacity-10">
              <img src={HERO_IMAGES[2]} alt="" className="w-full h-full object-cover rounded-3xl" />
            </div>
            <div className="relative">
              <TrophyIcon size={48} className="text-fifa-gold mx-auto mb-4" />
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-4">
                Ready for the{' '}
                <span className="bg-gradient-to-r from-fifa-gold to-fifa-red bg-clip-text text-transparent">
                  World's Biggest Match?
                </span>
              </h2>
              <p className="text-gray-300 max-w-lg mx-auto mb-8 text-sm sm:text-base">
                Join thousands of fans using Matchday AI to navigate stadiums, get live updates,
                and experience the FIFA World Cup 2026 like never before.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <button
                  onClick={() => navigate('/app')}
                  className="w-full sm:w-auto group bg-gradient-to-r from-fifa-gold to-amber-500 hover:from-amber-500 hover:to-fifa-gold text-gray-900 font-bold py-4 px-8 rounded-2xl text-base transition-all duration-300 active:scale-95 shadow-xl shadow-fifa-gold/30 flex items-center justify-center gap-3"
                >
                  <TrophyIcon size={20} />
                  Get Started Now
                  <ArrowRightIcon size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('/app')}
                  className="w-full sm:w-auto bg-white/10 hover:bg-white/15 backdrop-blur-sm text-white font-semibold py-4 px-8 rounded-2xl text-base transition-all duration-300 active:scale-95 border border-white/20 flex items-center justify-center gap-3"
                >
                  <SoccerBallIcon size={18} />
                  Go To App
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/5 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fifa-blue to-fifa-gold flex items-center justify-center">
                <SoccerBallIcon size={16} className="text-white" />
              </div>
              <span className="text-sm font-bold">Matchday <span className="text-fifa-gold">AI</span></span>
            </div>
            <div className="flex items-center gap-6 text-xs text-gray-500">
              <span>FIFA World Cup 2026 Companion</span>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:inline">12 Languages</span>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:inline">16 Stadiums</span>
            </div>
            <button onClick={() => navigate('/app')} className="text-xs text-fifa-gold hover:text-fifa-gold/80 font-medium transition-colors flex items-center gap-1">
              Launch App <ChevronRightIcon size={14} />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
