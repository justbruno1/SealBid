import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Web3Provider } from "./context/Web3Context";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { Home } from "./pages/Home";
import { Explore } from "./pages/Explore";
import { CreateAuction } from "./pages/CreateAuction";
import { AuctionPage } from "./pages/AuctionPage";
import { MyBids } from "./pages/MyBids";

function AppShell() {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300
      ${isDark
        ? "bg-dark-bg text-slate-100"
        : "bg-light-bg text-slate-800"
      }`}
    >
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/"               element={<Home />} />
          <Route path="/explore"        element={<Explore />} />
          <Route path="/create"         element={<CreateAuction />} />
          <Route path="/auction/:address" element={<AuctionPage />} />
          <Route path="/my-bids"        element={<MyBids />} />
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
              <p className="text-7xl font-black text-arc-400/20 mb-4">404</p>
              <p className="text-slate-400 mb-6">Page not found.</p>
              <a href="/" className="text-arc-400 hover:text-arc-300 text-sm transition-colors">← Go home</a>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: isDark ? "#0d1f35" : "#ffffff",
            color:      isDark ? "#f1f5f9" : "#1e293b",
            border:     isDark ? "1px solid #0e3054" : "1px solid #c8dff5",
            fontSize:   "14px",
          },
          success: { iconTheme: { primary: "#00c2b8", secondary: isDark ? "#0d1f35" : "#fff" } },
          error:   { iconTheme: { primary: "#ef4444", secondary: isDark ? "#0d1f35" : "#fff" } },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Web3Provider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </Web3Provider>
    </ThemeProvider>
  );
}