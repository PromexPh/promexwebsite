import Hero          from '@/components/home/Hero';
import Stats         from '@/components/home/Stats';
import About         from '@/components/home/About';
import MissionVision from '@/components/home/MissionVision';
import Industries    from '@/components/home/Industries';
import Clients       from '@/components/home/Clients';
import Testimonials  from '@/components/home/Testimonials';
import CtaBanner     from '@/components/home/CtaBanner';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <About />
      <MissionVision />
      <Industries />
      <Clients />
      <Testimonials />
      <CtaBanner />
    </>
  );
}
