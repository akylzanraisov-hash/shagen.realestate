import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import RealEstate from './pages/RealEstate';
import Construction from './pages/Construction';
import Investment from './pages/Investment';
import AFrameHouses from './pages/AFrameHouses';
import Contacts from './pages/Contacts';
import Blog from './pages/Blog';

export default function App() {
  return (
    <div style={{ background: '#0A0D12', minHeight: '100vh' }}>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/real-estate" element={<RealEstate />} />
        <Route path="/construction" element={<Construction />} />
        <Route path="/investment" element={<Investment />} />
        <Route path="/a-frame-houses" element={<AFrameHouses />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/blog" element={<Blog />} />
      </Routes>
      <Footer />
    </div>
  );
}
