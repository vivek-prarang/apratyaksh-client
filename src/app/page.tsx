import HomeHeader from "@/components/home/HomeHeader";
import TokenizerParent from "@/components/home/TokenizerParent";
import FAQSection from "@/components/home/FAQSection";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <HomeHeader />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Tokenizer Section - 3/4 width */}
          <div className="w-full lg:w-3/4">
            <TokenizerParent />
          </div>

          {/* Sidebar Section - 1/4 width */}
          <div className="w-full lg:w-1/4 space-y-6">



            {/* FAQ Section */}
            <FAQSection />

    <div className="space-x-4">
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        <Link href="/char-mapping">Character Mapping</Link>
      </button>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        <Link href="/scale-mapping">Scale Mapping</Link>
      </button>
    </div>

          </div>
        </div>
      </div>
    </main>
  );
}
