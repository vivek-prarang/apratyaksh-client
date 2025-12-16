import Image from "next/image";

const HomeHeader = () => {
    return (
        <header className="w-full mx-auto px-5 py-3">
            <div className="flex flex-col md:flex-row  justify-center md:justify-between gap-6">
                {/* Logo/Image Section */}
                <div className="flex-shrink-0 ">
                    <Image
                        src="https://i.ibb.co/bgBVJWdy/Untitled-design-1.png"
                        alt="Hum Sab Ek Logo"
                        width={120}
                        height={120}
                        className="object-contain"
                        priority
                    />
                </div>

                {/* Text Section */}
                <div className="flex flex-col space-y-2 text-center md:text-left flex-1 md:pl-8">
                    <h2 className="text-xl md:text-xl font-medium text-blue-600 dark:text-blue-400 tracking-wide">
                        Not So Apparent Knowledge...
                    </h2>
                    <div className="flex flex-col justify-center md:justify-start items-center">
                    <h1 className="text-2xl md:text-3xl font-bold text-blue-700">
                        SANSKRIT: NATURAL INTELLIGENCE
                    </h1>
                    <p className="text-lg md:text-xl font-medium italic text-blue-600 dark:text-green-400 ">
                        Phonetical - Neither Spiritual, Nor Scriptual
                    </p>
                    </div>
                </div>
                <div></div>
            </div>
        </header>
    );
};

export default HomeHeader;
