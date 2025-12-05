'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Repeat, Clock } from 'lucide-react';

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
  const formatDuration = (hours: number) => {
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''}`;
    if (hours < 168) return `${Math.round(hours / 24)} day${hours >= 48 ? 's' : ''}`;
    if (hours < 720) return `${Math.round(hours / 168)} week${hours >= 336 ? 's' : ''}`;
    if (hours < 8760) return `${Math.round(hours / 720)} month${hours >= 1440 ? 's' : ''}`;
    return `${Math.round(hours / 8760)} year${hours >= 17520 ? 's' : ''}`;
  };

  const presetDurations = [
    { label: '1 hour', hours: 1 },
    { label: '24 hours', hours: 24 },
    { label: '1 week', hours: 168 },
    { label: '1 month', hours: 720 },
    { label: '6 months', hours: 4380 },
    { label: '1 year', hours: 8760 },
  ];

  return (
    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md space-y-4">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
        <Calendar className="w-4 h-4" /> Delivery Schedule
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
          <Clock className="w-4 h-4" /> Travel Time
        </button>
        <button
          onClick={() => onDeliveryTypeChange('scheduled')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2 ${
            deliveryType === 'scheduled'
              ? 'bg-white text-black'
              : 'bg-white/10 text-gray-400 hover:bg-white/20'
          }`}
        >
          <Calendar className="w-4 h-4" /> Exact Date
        </button>
      </div>

      {deliveryType === 'duration' ? (
        <>
          {/* Duration Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Arrives in:</span>
              <span className="text-2xl font-mono font-bold text-white">
                {formatDuration(duration)}
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
                key={preset.hours}
                onClick={() => onDurationChange(preset.hours)}
                className={`px-3 py-1 rounded-full text-xs transition-all ${
                  duration === preset.hours
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Date Picker */}
          <div className="space-y-3">
            <input
              type="datetime-local"
              value={scheduledDate?.toISOString().slice(0, 16) || ''}
              onChange={(e) => onScheduledDateChange(e.target.value ? new Date(e.target.value) : null)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30"
            />

            {/* Recurring Option */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onRecurringChange(!isRecurring, isRecurring ? null : 'yearly')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                  isRecurring
                    ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                <Repeat className="w-4 h-4" /> Recurring
              </button>

              {isRecurring && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-2"
                >
                  <button
                    onClick={() => onRecurringChange(true, 'yearly')}
                    className={`px-3 py-1 rounded text-xs ${
                      recurringType === 'yearly' ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-400'
                    }`}
                  >
                    Yearly
                  </button>
                  <button
                    onClick={() => onRecurringChange(true, 'monthly')}
                    className={`px-3 py-1 rounded text-xs ${
                      recurringType === 'monthly' ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-400'
                    }`}
                  >
                    Monthly
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
