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
            {/* Tools Buttons */}
            <div className="flex flex-row flex-wrap gap-2 mt-6 lg:mt-0">
              <Link href="/char-mapping" className="flex-1">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-2 text-sm rounded-lg shadow-md transition-colors duration-200 whitespace-nowrap">
                  Character Mapping
                </button>
              </Link>
              <Link href="/scale-mapping" className="flex-1">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-2 text-sm rounded-lg shadow-md transition-colors duration-200 whitespace-nowrap">
                  Scale Mapping
                </button>
              </Link>
              <Link href="/raga-mapping" className="flex-1">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-2 text-sm rounded-lg shadow-md transition-colors duration-200 whitespace-nowrap">
                  Raga Mapping
                </button>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
