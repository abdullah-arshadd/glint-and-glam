import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from 'sonner';
import { CartProvider } from "@/context/CartContext";
import Providers from "@/components/Providers";
import CartDrawer from '@/components/CartDrawer';
import SaleAnnouncementModal from '@/components/SaleAnnouncementModal';

export const metadata = {
  title: "Glint and Glam | Luxury Jewellery Store",
  description: "Elegance in every piece",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white antialiased [font-family:'Plus_Jakarta_Sans',sans-serif]" suppressHydrationWarning={true}>
        <Providers>
          <CartProvider>
            <Toaster position="bottom-right" richColors />
            <Navbar />
            <SaleAnnouncementModal />
            {children}
            <CartDrawer />
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}