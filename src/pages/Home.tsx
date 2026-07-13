import { Helmet } from 'react-helmet-async';
import Hero from '../components/Hero';
import Configurator from '../components/Configurator';
import FloorPlanner from '../components/FloorPlanner';
import WhyUs from '../components/WhyUs';

export default function Home() {
  return (
    <>
      <Helmet>
        <title>SHAG Engineering — строительство каркасных домов премиум класса A-Frame</title>
        <meta
          name="description"
          content="Проектируем и строим каркасные дома премиум класса A-Frame под ключ. 3D-конструктор дома онлайн: выберите планировку, отделку и рассчитайте стоимость. Гарантия до 10 лет, 500+ реализованных проектов."
        />
        <link rel="canonical" href="https://shagenrealestate.com/" />
        <meta property="og:title" content="SHAG Engineering — строительство каркасных домов премиум класса A-Frame" />
        <meta
          property="og:description"
          content="Проектируем и строим каркасные дома премиум класса A-Frame под ключ. 3D-конструктор дома онлайн: выберите планировку, отделку и рассчитайте стоимость. Гарантия до 10 лет, 500+ реализованных проектов."
        />
        <meta property="og:url" content="https://shagenrealestate.com/" />
      </Helmet>
      <Hero />
      <Configurator />
      <FloorPlanner />
      <WhyUs />
    </>
  );
}
