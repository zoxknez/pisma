'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Play, Pause, Trash2, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  existingAudioUrl?: string;
  onDelete?: () => void;
}

export function AudioRecorder({ onRecordingComplete, existingAudioUrl, onDelete }: AudioRecorderProps) {
  const { t } = useI18n();
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(existingAudioUrl || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [waveform, setWaveform] = useState<number[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup audio context for visualization
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 32;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Start waveform visualization
      const updateWaveform = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          setWaveform(Array.from(dataArray).slice(0, 8));
        }
        if (isRecording) {
          animationRef.current = requestAnimationFrame(updateWaveform);
        }
      };
      updateWaveform();

    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      setWaveform([]);
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDelete = () => {
    setAudioUrl(null);
    setIsPlaying(false);
    onDelete?.();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
          <Volume2 className="w-4 h-4" /> {t.audio.title}
        </label>
        <span className="text-xs text-gray-500">{t.audio.optional}</span>
      </div>

      <AnimatePresence mode="wait">
        {!audioUrl ? (
          <motion.div
            key="recorder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            {/* Waveform visualization during recording */}
            {isRecording && (
              <div className="flex items-center gap-1 h-12">
                {waveform.map((value, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-red-500 rounded-full"
                    animate={{ height: Math.max(4, value / 4) }}
                    transition={{ duration: 0.1 }}
                  />
                ))}
              </div>
            )}

            <div className="flex items-center gap-4">
              {isRecording ? (
                <>
                  <span className="text-red-500 font-mono animate-pulse">
                    ● {t.audio.recording} {formatTime(recordingTime)}
                  </span>
                  <Button
                    type="button"
                    onClick={stopRecording}
                    variant="outline"
                    size="icon"
                    className="w-12 h-12 rounded-full border-red-500/50 hover:bg-red-500/20"
                  >
                    <Square className="w-5 h-5 text-red-500" />
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  onClick={startRecording}
                  variant="outline"
                  className="gap-2 border-white/20 hover:bg-white/10"
                >
                  <Mic className="w-4 h-4" /> {t.audio.record}
                </Button>
              )}
            </div>

            <p className="text-xs text-gray-500 text-center">
              {t.audio.desc}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="player"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-4"
          >
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            
            <Button
              type="button"
              onClick={togglePlayback}
              variant="outline"
              size="icon"
              className="w-10 h-10 rounded-full border-white/20 hover:bg-white/10"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 ml-0.5" />
              )}
            </Button>

            <div className="flex-1">
              <div className="flex gap-0.5">
                {[...Array(30)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-white/30 rounded-full"
                    style={{ height: Math.random() * 20 + 4 }}
                  />
                ))}
              </div>
            </div>

            <Button
              type="button"
              onClick={handleDelete}
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-red-500 hover:bg-red-500/20"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
