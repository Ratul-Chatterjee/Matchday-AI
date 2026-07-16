import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPinIcon, NavigationIcon, FootprintsIcon } from './Icons';
import type { TranslationKey } from '../i18n/translations';

interface Stadium { id: string; name: string; lat: number; lng: number; city: string; country: string; }
interface ParsedTicket { stadium: string; gate: string; section: string; row: string; seat: string; match: string; stadium_id: string; coordinates: { name: string; lat: number; lng: number; city: string; country: string } | null; }
interface MapLayoutProps { parsedTicket: ParsedTicket | null; stadiums: Stadium[]; isMobile: boolean; t: (key: TranslationKey) => string; }

const gateOffsets: Record<string, { lat: number; lng: number }> = {
  'A': { lat: 0.0015, lng: 0.0015 },
  'B': { lat: -0.0015, lng: 0.0015 },
  'C': { lat: 0.0015, lng: -0.0015 },
  'D': { lat: -0.0015, lng: -0.0015 },
  'E': { lat: 0.002, lng: 0 },
  'F': { lat: -0.002, lng: 0 },
  'G': { lat: 0, lng: 0.002 },
  'H': { lat: 0, lng: -0.002 },
};

export default function MapLayout({ parsedTicket, stadiums, isMobile, t }: MapLayoutProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedStadium, setSelectedStadium] = useState<string | null>(parsedTicket?.stadium_id || null);

  useEffect(() => {
    if (parsedTicket?.stadium_id) setSelectedStadium(parsedTicket.stadium_id);
  }, [parsedTicket?.stadium_id]);

  useEffect(() => {
    if (!mapRef.current || !selectedStadium) return;
    const stadium = stadiums.find(s => s.id === selectedStadium);
    if (!stadium) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([stadium.lat, stadium.lng], 18);
      return;
    }

    const map = L.map(mapRef.current, { zoomControl: true }).setView([stadium.lat, stadium.lng], 18);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    const stadiumIcon = L.divIcon({
      className: '',
      html: '<div style="background:linear-gradient(135deg,#00205B,#1a3a7a);color:#FFB81C;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:14px;border:3px solid #FFB81C;box-shadow:0 4px 12px rgba(0,0,0,0.5);">S</div>',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    L.marker([stadium.lat, stadium.lng], { icon: stadiumIcon, zIndexOffset: 1000 })
      .addTo(map)
      .bindPopup(`<div style="font-family:system-ui;font-size:13px"><b>${stadium.name}</b><br/>${stadium.city}, ${stadium.country}</div>`);

    if (parsedTicket) {
      const gate = parsedTicket.gate || 'A';
      const offset = gateOffsets[gate.toUpperCase()] || gateOffsets['A'];
      const gatePos: [number, number] = [stadium.lat + offset.lat, stadium.lng + offset.lng];
      const seatPos: [number, number] = [stadium.lat - 0.0003, stadium.lng - 0.0003];

      const gateIcon = L.divIcon({
        className: '',
        html: `<div style="background:linear-gradient(135deg,#C8102E,#e8354d);color:white;width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px;border:2px solid white;box-shadow:0 3px 8px rgba(0,0,0,0.5);">${gate}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      L.marker(gatePos, { icon: gateIcon }).addTo(map).bindPopup(`<div style="font-family:system-ui;font-size:13px"><b>Gate ${gate}</b><br/>Enter here</div>`);

      const seatIcon = L.divIcon({
        className: '',
        html: '<div style="background:linear-gradient(135deg,#FFB81C,#ffc94d);color:#00205B;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:10px;border:2px solid #00205B;box-shadow:0 3px 8px rgba(0,0,0,0.5);">S</div>',
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      L.marker(seatPos, { icon: seatIcon }).addTo(map).bindPopup(`<div style="font-family:system-ui;font-size:13px"><b>Your Seat</b><br/>Section ${parsedTicket.section}, Row ${parsedTicket.row}</div>`);

      const latlngs: [number, number][] = [gatePos, seatPos];
      const path = L.polyline(latlngs, {
        color: '#FFB81C', weight: 3, opacity: 0.8, dashArray: '8, 8',
      }).addTo(map);

      const mid = latlngs.length > 0 ? latlngs[Math.floor(latlngs.length / 2)] : latlngs[0];
      L.marker(mid, {
        icon: L.divIcon({
          className: '',
          html: '<div style="background:rgba(255,184,28,0.95);color:#00205B;padding:4px 10px;border-radius:14px;font-size:10px;font-weight:bold;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-family:system-ui;">👣 Walk this way</div>',
          iconSize: [100, 24],
          iconAnchor: [50, 12],
        })
      }).addTo(map);

      const bounds = L.latLngBounds(latlngs);
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    mapInstanceRef.current = map;
    setMapLoaded(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      setMapLoaded(false);
    };
  }, [selectedStadium, stadiums, parsedTicket]);

  const currentStadium = selectedStadium ? stadiums.find(s => s.id === selectedStadium) || null : null;

  return (
    <div className="my-4 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fifa-red/20 to-fifa-blue/20 flex items-center justify-center">
            <NavigationIcon size={16} className="text-fifa-red" />
          </div>
          <h2 className="text-lg font-bold">{t('mapTitle')}</h2>
        </div>
        {currentStadium && (<span className="badge bg-fifa-blue/20 text-fifa-blue text-xs flex items-center gap-1"><MapPinIcon size={10} />{currentStadium.name}</span>)}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
        {stadiums.slice(0, 8).map((s) => (
          <button key={s.id} onClick={() => setSelectedStadium(s.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${selectedStadium === s.id ? 'bg-fifa-blue text-white shadow-lg shadow-fifa-blue/20' : 'bg-gray-800/80 text-gray-400 hover:text-white hover:bg-gray-700/80'}`}>
            {s.city}
          </button>
        ))}
      </div>
      {!selectedStadium && (
        <div className="card text-center py-8 hover-glow">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-fifa-blue/20 to-fifa-gold/20 flex items-center justify-center">
            <MapPinIcon size={24} className="text-fifa-gold" />
          </div>
          <p className="text-gray-400 text-sm">Scan your ticket or select a stadium above to view the map.</p>
        </div>
      )}
      {selectedStadium && (
        <div className="relative rounded-2xl overflow-hidden border border-gray-800/50 shadow-xl" style={{ height: isMobile ? '400px' : '550px' }} ref={mapRef}>
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900" style={{ zIndex: 1000 }}>
              <div className="w-8 h-8 border-2 border-fifa-gold border-t-fifa-blue rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}
      {parsedTicket && selectedStadium && (
        <div className="card-glow mt-3">
          <h3 className="text-sm font-semibold text-fifa-gold mb-3 flex items-center gap-2">
            <FootprintsIcon size={14} />
            {t('mapYourRoute')}
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 bg-gradient-to-br from-fifa-red to-rose-600 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 shadow-lg shadow-fifa-red/20">1</span>
              <span className="text-gray-300">{t('mapStep1')} <strong className="text-white">{t('mapStep1Gate')} {parsedTicket.gate}</strong></span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 bg-gradient-to-br from-fifa-blue to-blue-600 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 shadow-lg shadow-fifa-blue/20">2</span>
              <span className="text-gray-300">{t('mapStep2')} <strong className="text-white">{t('mapStep2Section')} {parsedTicket.section}</strong></span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 bg-gradient-to-br from-fifa-gold to-amber-500 rounded-lg flex items-center justify-center text-[10px] font-bold text-gray-900 flex-shrink-0 shadow-lg shadow-fifa-gold/20">3</span>
              <span className="text-gray-300">{t('mapStep3')} <strong className="text-white">{t('mapStep3Row')} {parsedTicket.row}</strong>, <strong className="text-white">{t('mapStep3Seat')} {parsedTicket.seat}</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
