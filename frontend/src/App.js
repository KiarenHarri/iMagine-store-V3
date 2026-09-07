import { useEffect, useRef, lazy, Suspense } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Lenis from "lenis";
import { Toaster } from "@/components/ui/sonner";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/lib/auth";
import Home from "@/pages/Home";

const Shop = lazy(() => import("@/pages/Shop"));
const Category = lazy(() => import("@/pages/Category"));
const Accessories = lazy(() => import("@/pages/Accessories"));
const Repairs = lazy(() => import("@/pages/Repairs"));
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const ProductQuote = lazy(() => import("@/pages/ProductQuote"));
const RepairQuote = lazy(() => import("@/pages/RepairQuote"));
const Account = lazy(() => import("@/pages/Account"));
const Admin = lazy(() => import("@/pages/Admin"));
const TradeIn = lazy(() => import("@/pages/TradeIn"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));

const PageLoader = () => (
  <div className="flex min-h-[60vh] items-center justify-center bg-paper" data-testid="page-loader">
    <div className="h-9 w-9 animate-spin rounded-full border-2 border-ink/10 border-t-brand" />
  </div>
);

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

function AppRouter() {
  return (
    <>
      <ScrollManager />
      <Nav />
      <main>
        <Suspense fallback={<PageLoader />}>
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
          <Route path="/account" element={<Account />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/trade-in" element={<TradeIn />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <div className="App font-body">
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </div>
  );
}

export default App;
