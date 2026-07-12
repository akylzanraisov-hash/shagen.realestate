import Header from './components/Header';
import Hero from './components/Hero';
import Configurator from './components/Configurator';
import FloorPlanner from './components/FloorPlanner';
import WhyUs from './components/WhyUs';
import Footer from './components/Footer';

export default function App() {
  return (
    <div style={{ background: '#0A0D12', minHeight: '100vh' }}>
      <Header />
      <Hero />
      <Configurator />
      <FloorPlanner />
      <WhyUs />
      <Footer />
    </div>
  );
}
