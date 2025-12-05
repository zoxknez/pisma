'use client';

import { useEffect, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Download, Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';

interface QRCodeGeneratorProps {
  letterId: string;
  sealColor?: string;
}

export function QRCodeGenerator({ letterId, sealColor = '#8B0000' }: QRCodeGeneratorProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const letterUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/letter/${letterId}` 
    : `/letter/${letterId}`;

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `pisma-qr-${letterId}.png`;
      a.click();
      toast.success(t.qr.downloaded);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(letterUrl);
    setCopied(true);
    toast.success(t.qr.linkCopied);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md space-y-4"
    >
      <h3 className="text-sm font-medium text-gray-300 text-center">{t.qr.title}</h3>
      
      <div 
        ref={qrRef}
        className="bg-white p-4 rounded-xl mx-auto w-fit"
      >
        <QRCodeCanvas
          value={letterUrl}
          size={160}
          level="H"
          fgColor="#000000"
          bgColor="#ffffff"
          imageSettings={{
            src: '/wax-seal-icon.png',
            x: undefined,
            y: undefined,
            height: 32,
            width: 32,
            excavate: true,
          }}
        />
      </div>

      <p className="text-xs text-gray-500 text-center">
        {t.qr.description}
      </p>

      <div className="flex gap-2 justify-center">
        <Button
          onClick={handleDownload}
          variant="outline"
          size="sm"
          className="gap-2 border-white/20 hover:bg-white/10"
        >
          <Download className="w-4 h-4" /> {t.qr.download}
        </Button>
        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className="gap-2 border-white/20 hover:bg-white/10"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? t.qr.copied : t.qr.copyLink}
        </Button>
      </div>
    </motion.div>
  );
}
