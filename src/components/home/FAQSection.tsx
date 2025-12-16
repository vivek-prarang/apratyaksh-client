"use client";

import React, { useState } from "react";
import { faqItems } from "@/data/faqData";
import FAQModal from "./FAQModal";

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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-20">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="text-2xl"></span>
                    FAQ
                </h3>

                <div className="space-y-2">
                    {faqItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => handleFAQClick(item)}
                            className="w-full text-left px-4 py-3 bg-blue-50 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-gray-600 rounded-lg transition-all duration-200 border border-blue-200 dark:border-gray-600 group"
                        >
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-700 dark:group-hover:text-blue-300">
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
