import React, { useState } from 'react';
import { MapPin, Navigation, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { LocationData, QuestionOption } from '../types';

interface LocationQuestionProps {
  options?: QuestionOption[];
  onConfirm: (selectedEscape: string, locationData?: LocationData) => void;
  onSkip: () => void;
}

export const LocationQuestion: React.FC<LocationQuestionProps> = ({
  options = [],
  onConfirm,
  onSkip,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [customCity, setCustomCity] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsLocating(false);
        const lat = Math.round(pos.coords.latitude * 100) / 100;
        const lng = Math.round(pos.coords.longitude * 100) / 100;

        // Try gentle reverse geocoding approximation using open-meteo / browser timezone city
        let approxCity = '';
        try {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (tz && tz.includes('/')) {
            approxCity = tz.split('/')[1].replace(/_/g, ' ');
          }
        } catch {
          approxCity = 'Your city';
        }

        const locData: LocationData = {
          granted: true,
          latitude: lat,
          longitude: lng,
          city: approxCity || 'Nearby',
          country: 'Shared',
          formatted: approxCity ? `${approxCity} (approx)` : `${lat}, ${lng}`,
        };

        setDetectedLocation(locData);
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('Permission declined. You can type your dream city below or select a destination!');
        } else {
          setLocationError('Unable to retrieve location. Feel free to type or pick an option.');
        }
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  };

  const handleFinish = () => {
    const chosen = selectedOption || customCity.trim() || 'A surprise getaway spot ✨';
    onConfirm(chosen, detectedLocation || undefined);
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-5">
      {/* Privacy Guarantee Banner */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white/60">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>We only note your approximate area for the getaway idea. Never your exact address.</span>
      </div>

      {/* Geolocation Button */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={requestGeolocation}
          disabled={isLocating}
          className={`w-full py-3.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 border cursor-pointer ${
            detectedLocation
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-white/[0.04] border-white/10 text-white/80 hover:bg-white/[0.08] hover:text-white'
          }`}
        >
          <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin text-rose-400' : 'text-rose-400'}`} />
          <span>
            {isLocating
              ? 'Detecting approximate city…'
              : detectedLocation
              ? `📍 ${detectedLocation.formatted || 'Location noted'}`
              : 'Use my approximate location'}
          </span>
        </button>

        {locationError && (
          <div className="flex items-center gap-1.5 text-xs text-amber-300/80 px-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{locationError}</span>
          </div>
        )}
      </div>

      {/* Preset Escape Options */}
      {options.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {options.map((opt) => {
            const isSelected = selectedOption === opt.label;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setSelectedOption(opt.label);
                  setCustomCity('');
                }}
                className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-rose-500/20 border-rose-400/60 text-white shadow-md shadow-rose-500/20'
                    : 'bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{opt.icon}</span>
                  <span className="text-xs sm:text-sm font-medium">{opt.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Manual Dream City Input */}
      <div className="relative">
        <input
          type="text"
          value={customCity}
          onChange={(e) => {
            setCustomCity(e.target.value);
            if (e.target.value) setSelectedOption(null);
          }}
          placeholder="Or type your favorite city / secret spot..."
          className="w-full py-3.5 px-4 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/30 text-base focus:outline-none focus:border-rose-400/50 focus:bg-white/[0.06] transition-all"
        />
        <MapPin className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
      </div>

      {/* Actions: Continue or Skip */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={onSkip}
          className="min-h-[44px] text-xs sm:text-sm text-white/40 hover:text-white/70 transition-colors py-2.5 px-3 cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none rounded-lg"
        >
          Skip this step
        </button>

        <button
          type="button"
          onClick={handleFinish}
          className="min-h-[44px] py-3 px-6 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium text-sm shadow-md shadow-rose-500/25 transition-all duration-200 flex items-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
