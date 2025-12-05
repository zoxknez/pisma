'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Camera, FileImage, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

interface ImageDropZoneProps {
  onFileSelect: (file: File) => void;
  preview: string | null;
  onClear: () => void;
  fileName?: string;
  disabled?: boolean;
  className?: string;
}

export function ImageDropZone({
  onFileSelect,
  preview,
  onClear,
  fileName,
  disabled = false,
  className,
}: ImageDropZoneProps) {
  const { t } = useI18n();
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => {
      const newCount = prev - 1;
      if (newCount === 0) {
        setIsDragging(false);
      }
      return newCount;
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragCounter(0);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      }
    }
  }, [disabled, onFileSelect]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  }, [onFileSelect]);

  const handleClick = useCallback(() => {
    if (!preview && !disabled) {
      fileInputRef.current?.click();
    }
  }, [preview, disabled]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !preview && !disabled) {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  }, [preview, disabled]);

  return (
    <div
      className={cn(
        'relative aspect-[3/4] bg-white/5 rounded-3xl border overflow-hidden transition-all duration-300',
        isDragging ? 'border-purple-500 bg-purple-500/10 scale-[1.02]' : 'border-white/10',
        !preview && !disabled && 'cursor-pointer hover:border-white/30 hover:bg-white/10',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      tabIndex={preview ? -1 : 0}
      role="button"
      aria-label={preview ? 'Letter preview' : 'Upload letter image'}
      aria-disabled={disabled}
    >
      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full group"
          >
            {/* Image */}
            <img
              src={preview}
              alt="Letter preview"
              className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-90"
            />
            
            {/* Clear button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="absolute top-4 right-4 p-2.5 bg-black/70 backdrop-blur-sm rounded-full hover:bg-red-500/80 transition-all z-10 group/btn"
              aria-label="Remove image"
            >
              <X className="w-5 h-5 group-hover/btn:rotate-90 transition-transform duration-300" />
            </motion.button>
            
            {/* Success indicator */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-green-500/20 backdrop-blur-sm rounded-full border border-green-500/30"
            >
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-300 font-medium">{t.write.dropZone.ready}</span>
            </motion.div>

            {/* File info */}
            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <p className="font-mono text-xs text-gray-400 mb-1 tracking-wider">{t.write.dropZone.scanned}</p>
                <p className="font-serif text-xl text-white truncate">{fileName}</p>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex flex-col items-center justify-center p-8"
          >
            {/* Drag overlay */}
            {isDragging && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-purple-500/20 backdrop-blur-sm z-10 flex items-center justify-center"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <FileImage className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  </motion.div>
                  <p className="text-xl font-medium text-purple-300">{t.write.dropZone.dropToUpload}</p>
                </div>
              </motion.div>
            )}

            {/* Upload area content */}
            <div className="flex flex-col items-center justify-center text-gray-500 hover:text-white transition-colors duration-300">
              <motion.div
                className="relative mb-6"
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full blur-xl" />
                <div className="relative p-6 bg-white/5 rounded-full border border-white/10">
                  <Upload className="w-10 h-10" />
                </div>
              </motion.div>

              <p className="text-lg font-medium mb-2">{t.write.dropZone.dropHere}</p>
              <p className="text-sm opacity-60 mb-6">{t.write.dropZone.browse}</p>

              <div className="flex gap-3 text-xs text-gray-600">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full">
                  <Camera className="w-3.5 h-3.5" />
                  {t.write.dropZone.photo}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full">
                  <ImageIcon className="w-3.5 h-3.5" />
                  {t.write.dropZone.scan}
                </span>
              </div>

              <p className="text-xs text-gray-600 mt-6 text-center max-w-[200px]">
                {t.write.dropZone.instruction}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
        aria-hidden="true"
      />
    </div>
  );
}
