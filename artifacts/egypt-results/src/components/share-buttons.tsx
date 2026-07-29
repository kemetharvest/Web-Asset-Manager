'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Check, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Student } from '@/types';

interface ShareButtonsProps {
  student: Student;
  percentage: number;
  isPass: boolean;
}

export function ShareButtons({ student, percentage, isPass }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `🎓 نتيجة الثانوية العامة\n👤 الاسم: ${student.arabicName}\n🔢 رقم الجلوس: ${student.seatNumber}\n📊 المجموع: ${student.totalDegree} / 410 (${percentage.toFixed(1)}%)\n✅ الحالة: ${student.studentCaseDesc}`;

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/result/${student.seatNumber}`
    : '';

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('تم نسخ الرابط!');
    setTimeout(() => setCopied(false), 2000);
  };

  const nativeShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `نتيجة ${student.arabicName}`,
        text: shareText,
        url: shareUrl,
      });
    }
  };

  const shareButtons = [
    {
      label: 'واتساب',
      bg: 'bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20',
      onClick: () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`, '_blank'),
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
    },
    {
      label: 'تيليجرام',
      bg: 'bg-[#0088cc]/10 text-[#0088cc] hover:bg-[#0088cc]/20',
      onClick: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank'),
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
          <path d="M11.994 0C5.369 0 0 5.37 0 11.996 0 18.626 5.369 24 11.994 24 18.62 24 24 18.626 24 11.996 24 5.37 18.619 0 11.994 0zm5.454 8.203l-1.932 9.102c-.143.65-.526.806-1.07.502l-2.946-2.17-1.423 1.37c-.157.157-.29.29-.595.29l.213-3.018 5.487-4.955c.238-.213-.052-.33-.37-.117L7.158 13.99l-2.899-.905c-.63-.197-.643-.63.131-.932l11.325-4.367c.525-.19.986.13.733.417z"/>
        </svg>
      ),
    },
    {
      label: 'فيسبوك',
      bg: 'bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20',
      onClick: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank'),
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <Share2 className="w-4 h-4" />
        مشاركة النتيجة
      </p>
      <div className="flex flex-wrap gap-2">
        {shareButtons.map(btn => (
          <motion.button
            key={btn.label}
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={btn.onClick}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all', btn.bg)}
          >
            {btn.icon}
            {btn.label}
          </motion.button>
        ))}

        <motion.button
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.95 }}
          onClick={copyLink}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-muted hover:bg-muted/80 transition-all"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <Check className="w-4 h-4 text-success" />
              </motion.span>
            ) : (
              <motion.span key="link" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <Link2 className="w-4 h-4" />
              </motion.span>
            )}
          </AnimatePresence>
          {copied ? 'تم النسخ!' : 'نسخ الرابط'}
        </motion.button>

        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={nativeShare}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-all"
          >
            <Share2 className="w-4 h-4" />
            مشاركة
          </motion.button>
        )}
      </div>
    </div>
  );
}
