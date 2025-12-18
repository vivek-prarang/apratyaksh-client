"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

export default function Ragas() {
    const [ragas, setRagas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copiedColor, setCopiedColor] = useState<string | null>(null);

    useEffect(() => {
        api.get(`https://api.apratyaksh.org/api/v1/melakarta/melakarta-ragas`)
            .then((res) => {
                setRagas(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching ragas:", err);
                setError("Failed to load ragas");
                setLoading(false);
            });
    }, []);

    const handleColorClick = (colorCode: string) => {
        navigator.clipboard.writeText(colorCode);
        setCopiedColor(colorCode);
        setTimeout(() => setCopiedColor(null), 2000);
    };

    if (loading) return <div className="p-4 text-center text-gray-900 dark:text-white">Loading ragas...</div>;
    if (error) return <div className="p-4 text-center text-red-600">{error}</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">72 Melakarta Ragas</h1>
            <div className="overflow-x-auto shadow-lg rounded-lg">
                <table className="min-w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                    <thead className="bg-gray-200 dark:bg-gray-700 sticky top-0">
                        <tr>
                            <th className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-left font-semibold text-gray-900 dark:text-white">#</th>
                            <th className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-left font-semibold text-gray-900 dark:text-white">Raga (Latin)</th>
                            <th className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-left font-semibold text-gray-900 dark:text-white">Raga (Devanagari)</th>
                            <th className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-left font-semibold text-gray-900 dark:text-white">Classification</th>
                            <th className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-left font-semibold text-gray-900 dark:text-white">Swaras (Latin)</th>
                            <th className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-left font-semibold text-gray-900 dark:text-white">Swaras (Devanagari)</th>
                            <th className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-center font-semibold text-gray-900 dark:text-white">Colour</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ragas.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center p-4 text-gray-900 dark:text-white">
                                    No ragas available
                                </td>
                            </tr>
                        ) : (
                            ragas.map((raga) => (
                                <tr key={raga.raga_number} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <td className="px-4 py-3 border border-gray-300 dark:border-gray-600 font-bold text-blue-600 dark:text-blue-400">{raga.raga_number}</td>
                                    <td className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">{raga.raga_name_latin}</td>
                                    <td className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-lg text-gray-900 dark:text-white">{raga.raga_name_devanagari}</td>
                                    <td className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-sm text-gray-900 dark:text-white">{raga.classification}</td>
                                    <td className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-sm text-gray-900 dark:text-white">{raga.swaras_latin}</td>
                                    <td className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">{raga.swaras_devanagari}</td>
                                    <td className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-center">
                                        <div className="flex items-center justify-center">
                                            <div
                                                className="relative group cursor-pointer"
                                                onClick={() => handleColorClick(raga.colour_rgb)}
                                            >
                                                <div
                                                    style={{
                                                        backgroundColor: raga.colour_rgb || "#000000",
                                                        width: "60px",
                                                        height: "30px",
                                                        border: "1px solid #ccc",
                                                        borderRadius: "4px"
                                                    }}
                                                />
                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                    {raga.colour_rgb}
                                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                                </div>
                                                {copiedColor === raga.colour_rgb && (
                                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 bg-black text-white text-xs rounded whitespace-nowrap">
                                                        Copied!
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="fixed bottom-4 right-4 flex flex-col sm:flex-row gap-3">
                <Link href="/">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300 ease-in-out shadow-md text-lg w-full sm:w-auto">
                        Go to Script to Number
                    </button>
                </Link>
                <Link href="/char-mapping">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300 ease-in-out shadow-md text-lg w-full sm:w-auto">
                        Go to Character Mapping
                    </button>
                </Link>
                <Link href="/scale-mapping">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300 ease-in-out shadow-md text-lg w-full sm:w-auto">
                        Go to Scale Mapper
                    </button>
                </Link>
            </div>
        </div>
    );
}
