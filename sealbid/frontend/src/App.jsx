import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Web3Provider } from "./context/Web3Context";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { Home } from "./pages/Home";
import { Explore } from "./pages/Explore";
import { CreateAuction } from "./pages/CreateAuction";
import { AuctionPage } from "./pages/AuctionPage";
import { MyBids } from "./pages/MyBids";

export default function App() {
  return (
    <Web3Provider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#0a0a0f] text-[#f1f5f9] flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/create" element={<CreateAuction />} />
              <Route path="/auction/:address" element={<AuctionPage />} />
              <Route path="/my-bids" element={<MyBids />} />
              <Route
                path="*"
                element={
                  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                    <p className="text-6xl font-black text-[#2a2a3d] mb-4">404</p>
                    <p className="text-[#94a3b8] mb-6">Page not found.</p>
                    <a href="/" className="text-indigo-400 hover:text-indigo-300 text-sm">
                      ← Go home
                    </a>
                  </div>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1a1a28",
              color: "#f1f5f9",
              border: "1px solid #2a2a3d",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#10b981", secondary: "#1a1a28" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#1a1a28" } },
          }}
        />
      </BrowserRouter>
    </Web3Provider>
  );
}
