'use client';

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Send, Loader2, X, User, Mail, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { WaxSealSelector } from '@/components/WaxSeal';
import { AudioRecorder } from '@/components/AudioRecorder';
import { TemplateSelector, useLetterTemplates, LetterTemplate } from '@/components/TemplateSelector';
import { ScheduledDelivery } from '@/components/ScheduledDelivery';
import { ImageDropZone } from '@/components/ImageDropZone';
import { EnhancedTextarea, InputWithValidation } from '@/components/FormElements';
import { UploadProgress, SealingAnimation } from '@/components/ProgressIndicators';
import { LetterPreviewModal } from '@/components/LetterPreviewModal';
import { NewYearCountdown, NewYearConfetti } from '@/components/NewYearEffects';
import { useI18n } from '@/lib/i18n';

interface FormErrors {
  senderName?: string;
  recipientEmail?: string;
  file?: string;
}

export default function WritePage() {
  const { t, language } = useI18n();
  const { data: session } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const letterTemplates = useLetterTemplates();

  // File upload
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Delivery
  const [deliveryType, setDeliveryType] = useState<'duration' | 'scheduled'>('duration');
  const [duration, setDuration] = useState(48);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState<'yearly' | 'monthly' | null>(null);
  const [isPublic, setIsPublic] = useState(false);

  // Paper & Seal
  const [paper, setPaper] = useState('classic');
  const [sealColor, setSealColor] = useState('#8B0000');
  const [sealDesign, setSealDesign] = useState('classic');
  const [sealInitials, setSealInitials] = useState('');

  // Content
  const [message, setMessage] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  // Recipient
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [senderName, setSenderName] = useState(session?.user?.name || '');

  // Template
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Aging
  const [agingEnabled, setAgingEnabled] = useState(true);

  // UI state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ status: 'idle' | 'uploading' | 'processing' | 'sealing' | 'success' | 'error'; progress: number; message: string }>({ status: 'idle', progress: 0, message: '' });
  const [showSealingAnimation, setShowSealingAnimation] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showNewYearConfetti, setShowNewYearConfetti] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Update sender name when session loads
  useEffect(() => {
    if (session?.user?.name && !senderName) {
      setSenderName(session.user.name);
    }
  }, [session?.user?.name, senderName]);

  const handleFileSelect = useCallback((f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setErrors(prev => ({ ...prev, file: undefined }));
  }, []);

  const handleFileClear = useCallback(() => {
    setFile(null);
    setPreview(null);
  }, []);

  const handleTemplateSelect = useCallback((template: LetterTemplate | null) => {
    if (template) {
      setSelectedTemplate(template.id);
      setPaper(template.paperType);
      setSealColor(template.sealColor);
      setSealDesign(template.sealDesign);
      setDuration(template.defaultDuration);
    } else {
      setSelectedTemplate(null);
    }
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    
    if (!senderName.trim()) {
      newErrors.senderName = t.write.validation.senderName;
    }
    
    if (!recipientEmail.trim()) {
      newErrors.recipientEmail = t.write.validation.recipientEmail;
    }
    
    if (!file) {
      newErrors.file = t.write.validation.file;
    }
    
    if (recipientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      newErrors.recipientEmail = t.write.validation.invalidEmail;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [file, recipientEmail, senderName, t]);

  const handlePreview = () => {
    if (!validateForm()) {
      toast.error(t.write.error);
      return;
    }
    setShowPreview(true);
  };

  const handleSubmit = async () => {
    setShowPreview(false);
    
    if (!validateForm()) {
      toast.error(t.write.error);
      return;
    }
    
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress({ status: 'uploading', progress: 20, message: t.common.loading });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('paperType', paper);
    formData.append('message', message);
    formData.append('sealColor', sealColor);
    formData.append('sealDesign', sealDesign);
    formData.append('sealInitials', sealInitials);
    formData.append('recipientName', recipientName);
    formData.append('recipientEmail', recipientEmail);
    formData.append('senderName', senderName || session?.user?.name || 'Anonymous');
    formData.append('templateType', selectedTemplate || '');
    formData.append('agingEnabled', agingEnabled.toString());
    formData.append('deliveryType', deliveryType);
    formData.append('isRecurring', isRecurring.toString());
    formData.append('recurringType', recurringType || '');
    formData.append('isPublic', isPublic.toString());
    formData.append('language', language);
    
    if (audioBlob) {
      formData.append('audio', audioBlob, 'voice-message.webm');
    }

    try {
      setUploadProgress({ status: 'processing', progress: 50, message: t.common.loading });
      
      const unlockDuration = deliveryType === 'duration' 
        ? duration 
        : scheduledDate 
          ? Math.max(1, Math.floor((scheduledDate.getTime() - Date.now()) / (1000 * 60 * 60)))
          : 48;

      const res = await fetch(`/api/upload?filename=${file.name}&duration=${unlockDuration}`, {
        method: 'POST',
        body: formData,
      });
      
      setUploadProgress({ status: 'sealing', progress: 80, message: t.write.sealLetter });
      
      if (res.ok) {
        const data = await res.json();
        setUploadProgress({ status: 'success', progress: 100, message: t.write.success });
        setShowSealingAnimation(true);
        
        // Show confetti for New Year template
        if (selectedTemplate === 'new-year') {
          setShowNewYearConfetti(true);
        }
        
        // Wait for animation then redirect
        setTimeout(() => {
          toast.success(t.write.success);
          router.push(`/letter/${data.id}?created=true`);
        }, 2000);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setUploadProgress({ status: 'error', progress: 0, message: errorData.error || t.write.error });
        toast.error(errorData.error || t.write.error);
      }
    } catch (error) {
      console.error(error);
      setUploadProgress({ status: 'error', progress: 0, message: t.errors.networkError });
      toast.error(t.errors.somethingWentWrong);
    } finally {
      if (uploadProgress.status !== 'success') {
        setIsUploading(false);
      }
    }
  };

  // Calculate form completion
  const formCompletion = useMemo(() => {
    let completed = 0;
    const total = 4;
    
    if (file) completed++;
    if (recipientName || recipientEmail) completed++;
    if (senderName) completed++;
    if (sealColor && sealDesign) completed++;
    
    return { completed, total, percentage: (completed / total) * 100 };
  }, [file, recipientName, recipientEmail, senderName, sealColor, sealDesign]);

  const currentPrompt = useMemo(() => {
    if (selectedTemplate) {
      return letterTemplates.find(tmpl => tmpl.id === selectedTemplate)?.promptText;
    }
    return t.write.messagePlaceholder;
  }, [selectedTemplate, t, letterTemplates]);

  return (
    <main className="min-h-screen bg-black text-white p-6 relative overflow-hidden">
      {/* New Year Confetti on successful send */}
      <NewYearConfetti isActive={showNewYearConfetti} />
      
      {/* Sealing Animation Overlay */}
      <AnimatePresence>
        {showSealingAnimation && <SealingAnimation isSealing={showSealingAnimation} />}
      </AnimatePresence>

      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <Link href={session ? '/inbox' : '/'} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>{t.common.back}</span>
          </Link>
          <h1 className="text-2xl font-serif font-bold">{t.write.title}</h1>
          
          {/* Completion indicator */}
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${formCompletion.percentage}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{formCompletion.completed}/{formCompletion.total}</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Controls */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6 overflow-y-auto max-h-[calc(100vh-150px)] pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        >
          <div>
            <h2 className="text-4xl font-serif font-bold mb-2">{t.write.step3}</h2>
            <p className="text-gray-400">{t.home.tagline}</p>
          </div>

          {/* New Year Countdown - shows when New Year template is selected */}
          {selectedTemplate === 'new-year' && <NewYearCountdown />}

          {/* Template Selection */}
          <TemplateSelector
            selectedTemplate={selectedTemplate}
            onSelect={handleTemplateSelect}
          />

          {/* Sender & Recipient */}
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md space-y-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <User className="w-4 h-4" /> {t.write.step2}
            </label>
            
            <div className="grid grid-cols-2 gap-4">
              <InputWithValidation
                label={t.write.senderName}
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Anonymous"
                error={errors.senderName}
              />
              <InputWithValidation
                label={t.write.recipientName}
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Dear..."
              />
            </div>

            <InputWithValidation
              label={t.write.recipientEmail}
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="recipient@example.com"
              error={errors.recipientEmail}
              hint={t.features.timeLockedDesc}
              icon={<Mail className="w-4 h-4" />}
            />

            {/* Public Letter Toggle */}
            <div className="flex items-center gap-3 pt-2 border-t border-white/10 mt-4">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="isPublic" className="text-sm text-gray-300 cursor-pointer select-none flex-1">
                <span className="font-medium text-white block mb-0.5">{t.write.publicLetter}</span>
                <span className="text-xs text-gray-500 block">{t.write.publicLetterDesc}</span>
              </label>
            </div>
          </div>

          {/* Scheduled Delivery */}
          <ScheduledDelivery
            deliveryType={deliveryType}
            duration={duration}
            scheduledDate={scheduledDate}
            isRecurring={isRecurring}
            recurringType={recurringType}
            onDeliveryTypeChange={setDeliveryType}
            onDurationChange={setDuration}
            onScheduledDateChange={setScheduledDate}
            onRecurringChange={(rec, type) => {
              setIsRecurring(rec);
              setRecurringType(type);
            }}
          />

          {/* Paper Selection */}
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">{t.write.paperType}</label>
              <button
                onClick={() => setAgingEnabled(!agingEnabled)}
                className={`text-xs px-3 py-1 rounded-full transition-all ${
                  agingEnabled
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                    : 'bg-white/10 text-gray-500'
                }`}
                aria-pressed={agingEnabled}
              >
                {agingEnabled ? `✨ ${t.write.agingEnabled}` : t.write.agingEnabled}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {['classic', 'vintage', 'dark'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPaper(p)}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    paper === p ? 'border-white bg-white/10' : 'border-transparent bg-black/20 hover:bg-white/5'
                  }`}
                  aria-pressed={paper === p}
                >
                  <div className={`w-full h-12 rounded mb-2 ${
                    p === 'classic' ? 'bg-[#f7f3e8]' : 
                    p === 'vintage' ? 'bg-[#efe5cd]' : 'bg-neutral-800'
                  }`} />
                  <span className="capitalize text-xs text-gray-400">{t.write.paper[p as keyof typeof t.write.paper]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Wax Seal */}
          <WaxSealSelector
            selectedColor={sealColor}
            selectedDesign={sealDesign}
            initials={sealInitials}
            onColorChange={setSealColor}
            onDesignChange={setSealDesign}
            onInitialsChange={setSealInitials}
          />

          {/* Digital Message */}
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
            <EnhancedTextarea
              label={t.write.message}
              value={message}
              onChange={setMessage}
              placeholder={currentPrompt}
              maxLength={2000}
              showEmojiPicker={true}
            />
          </div>

          {/* Audio Recording */}
          <AudioRecorder
            onRecordingComplete={setAudioBlob}
            onDelete={() => setAudioBlob(null)}
          />

          {/* Upload Progress */}
          <AnimatePresence>
            {isUploading && (
              <UploadProgress
                status={uploadProgress.status as 'uploading' | 'processing' | 'sealing' | 'success' | 'error'}
                progress={uploadProgress.progress}
                message={uploadProgress.message}
              />
            )}
          </AnimatePresence>

          {/* Action Button - Now opens preview */}
          <Button
            onClick={handlePreview}
            disabled={!file || isUploading}
            size="lg"
            className="w-full h-16 text-lg rounded-xl bg-white text-black hover:bg-gray-200 transition-all disabled:opacity-50 group"
          >
            {isUploading ? (
              <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> {uploadProgress.message || t.write.sending}</span>
            ) : (
              <span className="flex items-center gap-2">
                Preview & Send
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>

          {/* Error message for file */}
          {errors.file && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-400 text-center"
            >
              {errors.file}
            </motion.p>
          )}
        </motion.div>

        {/* Right Column: Preview/Upload */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:sticky lg:top-6 h-fit"
        >
          <ImageDropZone
            onFileSelect={handleFileSelect}
            preview={preview}
            onClear={handleFileClear}
            fileName={file?.name}
            disabled={isUploading}
          />
          
          {/* Quick tips */}
          {!preview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10"
            >
              <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                {t.write.tips.title}
              </h4>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• {t.write.tips.lighting}</li>
                <li>• {t.write.tips.flat}</li>
                <li>• {t.write.tips.legible}</li>
              </ul>
            </motion.div>
          )}
        </motion.div>

      </div>

      {/* Letter Preview Modal */}
      <LetterPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onConfirm={handleSubmit}
        isLoading={isUploading}
        data={{
          preview,
          senderName,
          recipientName,
          recipientEmail,
          message,
          paperType: paper,
          sealColor,
          sealDesign,
          sealInitials,
          duration,
          scheduledDate,
          deliveryType,
          hasAudio: !!audioBlob,
          isPublic,
        }}
      />
    </main>
  );
}
