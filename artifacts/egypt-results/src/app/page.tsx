import { Hero } from '@/components/hero';
import { SearchCard } from '@/components/search-card';

export default function HomePage() {
  return (
    <div className="space-y-4">
      <Hero />
      <div className="py-16 px-4">
        <SearchCard />
      </div>
    </div>
  );
}
