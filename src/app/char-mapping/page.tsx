"use client";

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import api from "@/lib/api";

function CharacterMapping() {
    const [consonantMappings, setConsonantMappings] = useState([]);
    const [vowelMappings, setVowelMappings] = useState([]);
    const [devanagariMatraMappings, setDevanagariMatraMappings] = useState([]);
    const [devanagariModifierMappings, setDevanagariModifierMappings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchMappings = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await api.get(`https://api.apratyaksh.org/api/v1/aryabhatta/get_mappings`);
            const data = response.data;

            setConsonantMappings(data.consonants);
            setVowelMappings(data.vowels);
            setDevanagariMatraMappings(data.devanagari_matras_map);
            setDevanagariModifierMappings(data.devanagari_modifiers_map);
        } catch (err) {
            console.error('Error fetching mappings:', err);
            setError('Failed to connect to the server.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMappings();
    }, []);

    const consonantMap = new Map(consonantMappings.map((c: any) => [c.number, c]));
    const vargaStructure = [
        [1, 6, 11, 16, 21],
        [2, 7, 12, 17, 22],
        [3, 8, 13, 18, 23],
        [4, 9, 14, 19, 24],
        [5, 10, 15, 20, 25]
    ];
    const vargaConsonantsGridData = vargaStructure.map(rowNumbers =>
        rowNumbers.map(num => consonantMap.get(num) || { number: num, devanagariChar: '—', latinChar: '—', kannadaChar: '—', teluguChar: '—' })
    );
    const avargaConsonants = consonantMappings.filter((c: any) => c.number > 25).sort((a: any, b: any) => a.number - b.number);

    const renderHorizontalTable = (title: string, data: any[], headers: string[], keyMapper: (prop: string, item: any) => { value: any; class?: string }) => (
        <div className="mb-6 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 text-center text-gray-900 dark:text-white">{title}</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full table-fixed border border-gray-400 dark:border-gray-600">
                    <tbody>
                        {headers.map((prop) => (
                            <tr key={prop}>
                                <td
                                    className="py-1 px-2 border-b border-r border-gray-300 dark:border-gray-600 text-right align-middle text-gray-900 dark:text-white"
                                    style={{ width: "fit-content", whiteSpace: "nowrap" }}
                                >
                                    {prop}
                                </td>
                                {data.map((item, colIdx) => (
                                    <td
                                        key={colIdx}
                                        className={
                                            "py-1 px-2 border-b border-r border-gray-300 dark:border-gray-600 text-center text-gray-900 dark:text-white" +
                                            (keyMapper(prop, item).class || '')
                                        }
                                        style={{ width: `${100 / (data.length || 1)}%` }}
                                    >
                                        {keyMapper(prop, item).value || '—'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-gray-900 p-2 sm:p-4 md:p-6 rounded-lg shadow-lg w-full max-w-full mx-auto relative font-sans min-h-screen">
            <h1 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-3 sm:mb-4 text-center">Akṣara-Saṅkhyā Sambandhaḥ</h1>

            {isLoading && (
                <div className="text-center text-gray-600 dark:text-gray-400 font-medium mb-2 h-4 text-sm">
                    Loading mappings...
                </div>
            )}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-lg relative mb-3 text-sm" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {!isLoading && !error && (
                <>
                    {/* Varga Consonants */}
                    <div className="mb-6 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                        <h2 className="text-lg sm:text-xl font-semibold mb-3 text-center text-gray-900 dark:text-white">Vargīya Vyañjanāni</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full table-fixed border border-gray-400 dark:border-gray-600">
                                <thead className="bg-gray-200 dark:bg-gray-700 sticky top-0 z-10">
                                    <tr>
                                        {['क-वर्ग', 'च-वर्ग', 'ट-वर्ग', 'त-वर्ग', 'प-वर्ग'].map((varga, idx) => (
                                            <th key={idx} colSpan={5} className="py-1 px-1 sm:px-2 border-b border-r border-gray-300 dark:border-gray-600 text-center text-xs sm:text-sm text-gray-900 dark:text-white">
                                                {varga}
                                            </th>
                                        ))}
                                    </tr>
                                    <tr>
                                        {[...Array(5)].flatMap(() => (
                                            [
                                                <th key="num" className="py-1 px-1 border-b border-r border-gray-300 dark:border-gray-600 text-center text-xs sm:text-xs text-gray-900 dark:text-white">No.</th>,
                                                <th key="dev" className="py-1 px-1 border-b border-r border-gray-300 dark:border-gray-600 text-center text-xs sm:text-xs text-gray-900 dark:text-white">Devanagari</th>,
                                                <th key="lat" className="py-1 px-1 border-b border-r border-gray-300 dark:border-gray-600 text-center text-xs sm:text-xs text-gray-900 dark:text-white">Latin</th>,
                                                <th key="kan" className="py-1 px-1 border-b border-r border-gray-300 dark:border-gray-600 text-center text-xs sm:text-xs text-gray-900 dark:text-white">Kannada</th>,
                                                <th key="tel" className="py-1 px-1 border-b border-r border-gray-300 dark:border-gray-600 text-center text-xs sm:text-xs text-gray-900 dark:text-white">Telugu</th>
                                            ]
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {[0, 1, 2, 3, 4].map(rowIdx => (
                                        <tr key={rowIdx}>
                                            {[0, 1, 2, 3, 4].flatMap(colIdx => {
                                                const c: any = vargaConsonantsGridData[rowIdx][colIdx];
                                                return [
                                                    <td key={`num-${colIdx}`} className="py-1 px-1 border-b border-r border-gray-300 dark:border-gray-600 text-center text-xs text-blue-700 dark:text-blue-400 font-bold">{c.number}</td>,
                                                    <td key={`dev-${colIdx}`} className="py-1 px-1 border-b border-r border-gray-300 dark:border-gray-600 text-center text-base text-gray-900 dark:text-white">{c.devanagariChar || '—'}</td>,
                                                    <td key={`lat-${colIdx}`} className="py-1 px-1 border-b border-r border-gray-300 dark:border-gray-600 text-center text-xs text-gray-900 dark:text-white">{c.latinChar || '—'}</td>,
                                                    <td key={`kan-${colIdx}`} className="py-1 px-1 border-b border-r border-gray-300 dark:border-gray-600 text-center text-base text-gray-900 dark:text-white">{c.kannadaChar || '—'}</td>,
                                                    <td key={`tel-${colIdx}`} className="py-1 px-1 border-b border-r border-gray-300 dark:border-gray-600 text-center text-base text-gray-900 dark:text-white">{c.teluguChar || '—'}</td>
                                                ];
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Avarga Consonants */}
                    {renderHorizontalTable(
                        "Avargīya Vyañjanāni",
                        avargaConsonants,
                        ["Number", "Devanagari", "Latin", "Kannada", "Telugu"],
                        (prop, item) => {
                            switch (prop) {
                                case "Number":
                                    return { value: item.number, class: " text-xs text-blue-700 dark:text-blue-400 font-bold" };
                                case "Devanagari":
                                    return { value: item.devanagariChar, class: " text-base" };
                                case "Latin":
                                    return { value: item.latinChar, class: " text-xs" };
                                case "Kannada":
                                    return { value: item.kannadaChar, class: " text-base" };
                                case "Telugu":
                                    return { value: item.teluguChar, class: " text-base" };
                                default:
                                    return { value: '—' };
                            }
                        }
                    )}

                    {/* Vowel Multipliers */}
                    {renderHorizontalTable(
                        "Vowel Multipliers",
                        vowelMappings,
                        ["Number", "Devanagari", "Latin", "Kannada", "Telugu"],
                        (prop, item) => {
                            switch (prop) {
                                case "Number":
                                    return { value: item.number, class: " text-xs text-blue-700 dark:text-blue-400 font-bold" };
                                case "Devanagari":
                                    return { value: item.devanagariChar, class: " text-base" };
                                case "Latin":
                                    return { value: item.latinChar, class: " text-xs" };
                                case "Kannada":
                                    return { value: item.kannadaChar, class: " text-base" };
                                case "Telugu":
                                    return { value: item.teluguChar, class: " text-base" };
                                default:
                                    return { value: '—' };
                            }
                        }
                    )}

                    {/* Devanagari Matra Mappings */}
                    {renderHorizontalTable(
                        "Matra Mappings",
                        devanagariMatraMappings,
                        ["Devanagari Matra", "Latin Equivalent Vowel", "Kannada", "Telugu"],
                        (prop, item) => {
                            switch (prop) {
                                case "Devanagari Matra":
                                    return { value: item.devanagariChar, class: " text-base" };
                                case "Latin Equivalent Vowel":
                                    return { value: item.latinEquivalent, class: " text-xs" };
                                case "Kannada":
                                    return { value: item.kannadaChar, class: " text-base" };
                                case "Telugu":
                                    return { value: item.teluguChar, class: " text-base" };
                                default:
                                    return { value: '—' };
                            }
                        }
                    )}

                    {/* Devanagari Modifier Mappings */}
                    {renderHorizontalTable(
                        "Modifier Mappings",
                        devanagariModifierMappings,
                        ["Devanagari Modifier", "Latin Equivalent", "Kannada", "Telugu"],
                        (prop, item) => {
                            switch (prop) {
                                case "Devanagari Modifier":
                                    return { value: item.devanagariChar, class: " text-base" };
                                case "Latin Equivalent":
                                    return { value: item.latinEquivalent, class: " text-xs" };
                                case "Kannada":
                                    return { value: item.kannadaChar, class: " text-base" };
                                case "Telugu":
                                    return { value: item.teluguChar, class: " text-base" };
                                default:
                                    return { value: '—' };
                            }
                        }
                    )}
                </>
            )}

            <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 flex flex-col sm:flex-row gap-3">
                <Link href="/">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300 ease-in-out shadow-md text-lg w-full sm:w-auto">
                        Go to Script to Number
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

export default CharacterMapping;
