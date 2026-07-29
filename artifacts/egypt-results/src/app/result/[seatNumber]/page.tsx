import type { Metadata } from 'next';
import { ResultCard } from '@/components/result-card';

interface Props {
  params: Promise<{ seatNumber: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { seatNumber } = await params;
  return {
    title: `نتيجة رقم الجلوس ${seatNumber}`,
    description: `نتيجة الثانوية العامة لرقم الجلوس ${seatNumber}`,
  };
}

export default async function ResultPage({ params }: Props) {
  const { seatNumber } = await params;
  const num = Number(seatNumber);
  return <ResultCard seatNumber={num} />;
}
