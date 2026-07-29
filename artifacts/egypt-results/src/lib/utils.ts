import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MAX_DEGREE = 410;

export function getPercentage(degree: number): number {
  return (degree / MAX_DEGREE) * 100;
}

export function isPass(studentCaseDesc: string): boolean {
  return studentCaseDesc.includes('ناجح');
}

export function formatNumber(n: number): string {
  return n.toLocaleString('ar-EG');
}
