'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Repeat, Clock } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface ScheduledDeliveryProps {
  deliveryType: 'duration' | 'scheduled';
  duration: number;
  scheduledDate: Date | null;
  isRecurring: boolean;
  recurringType: 'yearly' | 'monthly' | null;
  onDeliveryTypeChange: (type: 'duration' | 'scheduled') => void;
  onDurationChange: (hours: number) => void;
  onScheduledDateChange: (date: Date | null) => void;
  onRecurringChange: (isRecurring: boolean, type: 'yearly' | 'monthly' | null) => void;
}

export function ScheduledDelivery({
  deliveryType,
  duration,
  scheduledDate,
  isRecurring,
  recurringType,
  onDeliveryTypeChange,
  onDurationChange,
  onScheduledDateChange,
  onRecurringChange,
}: ScheduledDeliveryProps) {
  const { t } = useI18n();

  const formatDuration = (hours: number) => {
    if (hours < 24) return `${hours} ${t.time.hours}`;
    if (hours < 168) return `${Math.round(hours / 24)} ${t.time.days}`;
    if (hours < 720) return `${Math.round(hours / 168)} ${t.time.weeks}`;
    if (hours < 8760) return `${Math.round(hours / 720)} ${t.time.months}`;
    return `${Math.round(hours / 8760)} ${t.time.years}`;
  };

  const formatDurationSimple = (hours: number) => {
     if (hours < 24) return `${hours} ${t.time.hours}`;
     return `${Math.round(hours / 24)} ${t.time.days}`;
  };

  const presetDurations = [
    { label: `1 ${t.time.hours}`, hours: 1 },
    { label: `24 ${t.time.hours}`, hours: 24 },
    { label: `7 ${t.time.days}`, hours: 168 },
    { label: `30 ${t.time.days}`, hours: 720 },
    { label: `6 ${t.time.monthsShort}`, hours: 4380 },
    { label: `1 ${t.time.yearsShort}`, hours: 8760 },
  ];

  return (
    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md space-y-4">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
        <Calendar className="w-4 h-4" /> {t.write.deliveryTime}
      </label>

      {/* Delivery Type Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => onDeliveryTypeChange('duration')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2 ${
            deliveryType === 'duration'
              ? 'bg-white text-black'
              : 'bg-white/10 text-gray-400 hover:bg-white/20'
          }`}
        >
          <Clock className="w-4 h-4" /> {t.write.deliveryTime}
        </button>
        <button
          onClick={() => onDeliveryTypeChange('scheduled')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2 ${
            deliveryType === 'scheduled'
              ? 'bg-white text-black'
              : 'bg-white/10 text-gray-400 hover:bg-white/20'
          }`}
        >
          <Calendar className="w-4 h-4" /> {t.write.scheduledDelivery}
        </button>
      </div>

      {deliveryType === 'duration' ? (
        <>
          {/* Duration Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">{t.letter.unlocksIn}:</span>
              <span className="text-2xl font-mono font-bold text-white">
                {formatDurationSimple(duration)}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="8760"
              value={duration}
              onChange={(e) => onDurationChange(parseInt(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-2">
            {presetDurations.map((preset) => (
              <button
                key={preset.label}
                onClick={() => onDurationChange(preset.hours)}
                className={`px-3 py-1 rounded-full text-xs border transition-all ${
                  duration === preset.hours
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <input
            type="datetime-local"
            min={new Date().toISOString().slice(0, 16)}
            onChange={(e) => onScheduledDateChange(e.target.value ? new Date(e.target.value) : null)}
            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30"
          />
          
          {/* Recurring Option (Future Feature) */}
          <div className="flex items-center gap-2 opacity-50 cursor-not-allowed">
            <Repeat className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500">Recurring delivery (Coming soon)</span>
          </div>
        </div>
      )}
    </div>
  );
}
