import { useEffect, useRef } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Lenis from "lenis";
import { Toaster } from "@/components/ui/sonner";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import Category from "@/pages/Category";
import Accessories from "@/pages/Accessories";
import Repairs from "@/pages/Repairs";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import ProductQuote from "@/pages/ProductQuote";
import RepairQuote from "@/pages/RepairQuote";

function ScrollManager() {
  const lenisRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenisRef.current = lenis;
    let raf;
    const loop = (t) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}

function App() {
  return (
    <div className="App font-body">
      <BrowserRouter>
        <ScrollManager />
        <Nav />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/:slug" element={<Category />} />
            <Route path="/accessories" element={<Accessories />} />
            <Route path="/repairs" element={<Repairs />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/quote/product" element={<ProductQuote />} />
            <Route path="/quote/repair" element={<RepairQuote />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </div>
  );
}

export default App;
