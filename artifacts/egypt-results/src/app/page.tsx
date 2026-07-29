import { Hero } from '@/components/hero';
import { SearchCard } from '@/components/search-card';

export default function HomePage() {
  return (
    <div className="space-y-0">
      <Hero />
      <div className="pb-12 pt-2">
        <SearchCard />
      </div>
    </div>
  );
}
