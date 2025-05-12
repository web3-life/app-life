import Header from "@/components/header";
import Banner from "@/components/banner";
import ProductIntro from "@/components/product-intro";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <Header />
      <Banner />
      <ProductIntro />
    </main>
  );
}
