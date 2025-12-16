import Image from "next/image";

const HomeHeader = () => {
    return (
        <header className="w-full bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 sm:gap-8">
                    {/* Logo/Image Section */}
                    <div className="flex-shrink-0">
                        <Image
                            src="https://i.ibb.co/bgBVJWdy/Untitled-design-1.png"
                            alt="Hum Sab Ek Logo"
                            width={100}
                            height={100}
                            className="object-contain w-24 h-24 sm:w-28 sm:h-28"
                            priority
                        />
                    </div>

                    {/* Text Section */}
                    <div className="flex flex-col space-y-2 text-center sm:text-left flex-1">
                        <h2 className="text-base sm:text-lg font-medium text-blue-600 tracking-wide">
                            Not So Apparent Knowledge...
                        </h2>
                        <div className="flex flex-col justify-center sm:justify-start items-center sm:items-start">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-700 leading-tight">
                                SANSKRIT: NATURAL INTELLIGENCE
                            </h1>
                            <p className="text-base sm:text-lg font-medium italic text-blue-600 mt-1">
                                Phonetical - Neither Spiritual, Nor Scriptual
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default HomeHeader;
