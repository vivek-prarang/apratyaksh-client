"use client";

import React, { useState } from "react";
import { faqItems } from "@/data/faqData";
import FAQModal from "./FAQModal";
import Link from "next/link";

const FAQSection = () => {
    const [selectedFAQ, setSelectedFAQ] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleFAQClick = (faqItem: any) => {
        setSelectedFAQ(faqItem);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedFAQ(null);
    };

    return (
        <>
            <div className="bg-white  rounded-xl shadow-lg p-6 sticky top-20">
                <h3 className="text-lg font-semibold text-gray-900  mb-4 flex items-center justify-center gap-2">
                    <span className="text-2xl"></span>
                    FAQ
                </h3>

                <div className="space-y-2">
                    <Link href="/original-math" className="flex-1">
                        <button
                                className="w-full text-left bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-3   rounded-lg transition-all duration-200 border border-blue-200  group"
                            >
                                <span className="text-xs font-semibold ">
                                    Original Math
                                </span>
                        </button>
                    </Link>
                    

                    {faqItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => handleFAQClick(item)}
                            className="w-full text-left px-3 py-3 bg-blue-50  hover:bg-blue-100  rounded-lg transition-all duration-200 border border-blue-200  group"
                        >
                            <span className="text-xs font-semibold text-gray-700  group-hover:text-blue-700 ">
                                {item.title}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <FAQModal faqItem={selectedFAQ} isOpen={isModalOpen} onClose={closeModal} />
        </>
    );
};

export default FAQSection;
