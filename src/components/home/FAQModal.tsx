"use client";

import React from "react";
import Image from "next/image";

interface FAQItem {
    title: string;
    content?: React.ReactNode;
    type?: string;
}

interface FAQModalProps {
    faqItem: FAQItem | null;
    isOpen: boolean;
    onClose: () => void;
}

const FAQModal = ({ faqItem, isOpen, onClose }: FAQModalProps) => {
    if (!isOpen || !faqItem) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Blurred backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative bg-white  p-6 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto z-10">
                <h3 className="text-2xl font-bold text-gray-800  border-b-2 border-blue-200  pb-2 mb-4">
                    {faqItem.title}
                </h3>

                {faqItem.type === "calculator" ? (
                    <div className="space-y-6">
                        {/* Placeholder for calculator images */}
                        <div className="bg-gray-100  rounded-xl p-8 text-center">
                            <p className="text-gray-600 ">Calculator images will be displayed here</p>
                        </div>
                    </div>
                ) : (
                    <div className="prose prose-blue max-w-none text-gray-700  [&_a]:text-blue-600 [&_a:hover]:text-blue-700  ">
                        {faqItem.content}
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 shadow-md"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default FAQModal;
