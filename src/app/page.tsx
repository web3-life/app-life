import Header from "@/components/header";
import Banner from "@/components/banner";
import ProductIntro from "@/components/product-intro";
import Swap from "@/components/swap";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <Banner />
      <Swap />
      <ProductIntro />
    </main>
  );
}
