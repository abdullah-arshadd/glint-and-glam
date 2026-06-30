import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from 'sonner';
import { CartProvider } from "@/context/CartContext";

export const metadata = {
  title: "Twinkles of Joy | Luxury Jewellery Store",
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
        </CartProvider>
      </body>
    </html>
  );
}