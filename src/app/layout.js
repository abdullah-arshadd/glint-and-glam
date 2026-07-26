import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from 'sonner';
import { CartProvider } from "@/context/CartContext";
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata = {
  title: "Glint and Glam | Luxury Jewellery Store",
  description: "Elegance in every piece",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white antialiased [font-family:'Plus_Jakarta_Sans',sans-serif]" suppressHydrationWarning={true}>
        <CartProvider>
          {/* Toaster ko yahan niche rakho, return ke andar */}
          <Toaster position="bottom-right" richColors />
          <Navbar />
          {children}
          <SpeedInsights />
        </CartProvider>
      </body>
    </html>
  );
}