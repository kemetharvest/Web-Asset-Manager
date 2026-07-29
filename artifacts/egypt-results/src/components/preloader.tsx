'use client';

import { useEffect } from 'react';

export function PreloaderRemover() {
  useEffect(() => {
    const el = document.getElementById('__preloader');
    if (!el) return;
    el.style.opacity = '0';
    el.style.pointerEvents = 'none';
    const t = setTimeout(() => el.remove(), 600);
    return () => clearTimeout(t);
  }, []);
  return null;
}
