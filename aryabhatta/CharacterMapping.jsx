import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import api from "../../../apis/api";

function CharacterMapping({ setCurrentView }) {
    const [currentView, setLocalCurrentView] = useState("character");
    const [consonantMappings, setConsonantMappings] = useState([]);
    const [vowelMappings, setVowelMappings] = useState([]);
    const [devanagariMatraMappings, setDevanagariMatraMappings] = useState([]);
    const [devanagariModifierMappings, setDevanagariModifierMappings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [newChar, setNewChar] = useState('');
    const [newDevanagariChar, setNewDevanagariChar] = useState('');
    const [insertAtNumber, setInsertAtNumber] = useState('');
    const [newMappingType, setNewMappingType] = useState('consonant');
    const [temporaryAdditions, setTemporaryAdditions] = useState([]);


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
            setTemporaryAdditions([]);
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

    const handleAddCharacter = async () => {
        const insertPos = parseInt(insertAtNumber);

        if (newChar.trim() === '' && newDevanagariChar.trim() === '') {
            setError('Enter Latin or Devanagari Character.');
            return;
        }
        if (isNaN(insertPos)) {
            setError('Enter a valid number.');
            return;
        }

        try {
            const response = await api.post(`/aryabhatta/add_mapping`, {
                number: insertPos,
                latinChar: newChar.trim(),
                devanagariChar: newDevanagariChar.trim(),
                type: newMappingType,
            });

            const result = response.data;

            if (result.success) {
                setError('Character added successfully!');
                setTemporaryAdditions(prev => [...prev, {
                    number: insertPos,
                    latinChar: newChar.trim(),
                    devanagariChar: newDevanagariChar.trim(),
                    type: newMappingType
                }]);
                setNewChar('');
                setNewDevanagariChar('');
                setInsertAtNumber('');
            } else {
                setError(result.error || 'Failed to insert character.');
            }
        } catch (err) {
            console.error(err);
            setError('Server error while inserting character.');
        }
    };

    const applyTemporaryChanges = (originalMappings, newAddition, type) => {
        if (!newAddition || newAddition.type !== type) return originalMappings;

        const updated = [];
        let inserted = false;
        const sorted = [...originalMappings].sort((a, b) => a.number - b.number);

        sorted.forEach(item => {
            if (!inserted && item.number >= newAddition.number) {
                updated.push({
                    number: newAddition.number,
                    latinChar: newAddition.latinChar,
                    devanagariChar: newAddition.devanagariChar
                });
                inserted = true;
            }
            updated.push({
                ...item,
                number: item.number >= newAddition.number ? item.number + 1 : item.number
            });
        });

        if (!inserted) {
            updated.push({
                number: newAddition.number,
                latinChar: newAddition.latinChar,
                devanagariChar: newAddition.devanagariChar
            });
        }

        return updated.sort((a, b) => a.number - b.number);
    };

    const displayedConsonantMappings = temporaryAdditions.reduce((acc, addition) => {
        return applyTemporaryChanges(acc, addition, 'consonant');
    }, [...consonantMappings]);

    const displayedVowelMappings = temporaryAdditions.reduce((acc, addition) => {
        return applyTemporaryChanges(acc, addition, 'vowel');
    }, [...vowelMappings]);

    const consonantMap = new Map(displayedConsonantMappings.map(c => [c.number, c]));
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
    const avargaConsonants = displayedConsonantMappings.filter(c => c.number > 25).sort((a, b) => a.number - b.number);

    const renderHorizontalTable = (title, data, headers, keyMapper) => (
        <div className="mb-6 p-3 border rounded-lg bg-gray-50">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 text-center">{title}</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full table-fixed border border-gray-400">
                    <tbody>
                        {headers.map((prop) => (
                            <tr key={prop}>
                                <td
                                    className="py-1 px-2 border-b border-r border-gray-300 text-right align-middle"
                                    style={{ width: "fit-content", whiteSpace: "nowrap" }}
                                >
                                    {prop}
                                </td>
                                {data.map((item, colIdx) => (
                                    <td
                                        key={colIdx}
                                        className={
                                            "py-1 px-2 border-b border-r border-gray-300 text-center" +
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
        <div className="bg-white p-2 sm:p-4 md:p-6 rounded-lg shadow-lg w-full max-w-full mx-auto relative font-sans">
            <h1 className="text-xl sm:text-2xl font-bold text-black mb-3 sm:mb-4 text-center">Akṣara-Saṅkhyā Sambandhaḥ</h1>

            {isLoading && (
                <div className="text-center text-gray-600 font-medium mb-2 h-4 text-sm">
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
                    <div className="mb-6 p-3 border rounded-lg bg-gray-50">
                        <h2 className="text-lg sm:text-xl font-semibold mb-3 text-center">Vargīya Vyañjanāni</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full table-fixed border border-gray-400">
                                <thead className="bg-gray-200 sticky top-0 z-10">
                                    <tr>
                                        {['क-वर्ग', 'च-वर्ग', 'ट-वर्ग', 'त-वर्ग', 'प-वर्ग'].map((varga, idx) => (
                                            <th key={idx} colSpan={5} className="py-1 px-1 sm:px-2 border-b border-r border-gray-300 text-center text-xs sm:text-sm font-devanagari">
                                                {varga}
                                            </th>
                                        ))}
                                    </tr>
                                    <tr>
                                        {[...Array(5)].flatMap(() => (
                                            [
                                                <th key="num" className="py-1 px-1 border-b border-r border-gray-300 text-center text-xs sm:text-xs">No.</th>,
                                                <th key="dev" className="py-1 px-1 border-b border-r border-gray-300 text-center text-xs sm:text-xs">Devanagari</th>,
                                                <th key="lat" className="py-1 px-1 border-b border-r border-gray-300 text-center text-xs sm:text-xs">Latin</th>,
                                                <th key="kan" className="py-1 px-1 border-b border-r border-gray-300 text-center text-xs sm:text-xs">Kannada</th>,
                                                <th key="tel" className="py-1 px-1 border-b border-r border-gray-300 text-center text-xs sm:text-xs">Telugu</th>
                                            ]
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {[0, 1, 2, 3, 4].map(rowIdx => (
                                        <tr key={rowIdx}>
                                            {[0, 1, 2, 3, 4].flatMap(colIdx => {
                                                const c = vargaConsonantsGridData[rowIdx][colIdx];
                                                return [
                                                    <td key={`num-${colIdx}`} className="py-1 px-1 border-b border-r border-gray-300 text-center text-xs text-blue-700 font-bold">{c.number}</td>,
                                                    <td key={`dev-${colIdx}`} className="py-1 px-1 border-b border-r border-gray-300 text-center font-devanagari text-base">{c.devanagariChar || '—'}</td>,
                                                    <td key={`lat-${colIdx}`} className="py-1 px-1 border-b border-r border-gray-300 text-center text-xs">{c.latinChar || '—'}</td>,
                                                    <td key={`kan-${colIdx}`} className="py-1 px-1 border-b border-r border-gray-300 text-center font-kannada text-base">{c.kannadaChar || '—'}</td>,
                                                    <td key={`tel-${colIdx}`} className="py-1 px-1 border-b border-r border-gray-300 text-center font-telugu text-base">{c.teluguChar || '—'}</td>
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
                                    return { value: item.number, class: " text-xs text-blue-700 font-bold" };
                                case "Devanagari":
                                    return { value: item.devanagariChar, class: " font-devanagari text-base" };
                                case "Latin":
                                    return { value: item.latinChar, class: " text-xs" };
                                case "Kannada":
                                    return { value: item.kannadaChar, class: " font-kannada text-base" };
                                case "Telugu":
                                    return { value: item.teluguChar, class: " font-telugu text-base" };
                                default:
                                    return { value: '—' };
                            }
                        }
                    )}

                    {/* Vowel Multipliers */}
                    {renderHorizontalTable(
                        "Vowel Multipliers",
                        displayedVowelMappings,
                        ["Number", "Devanagari", "Latin", "Kannada", "Telugu"],
                        (prop, item) => {
                            switch (prop) {
                                case "Number":
                                    return { value: item.number, class: " text-xs text-blue-700 font-bold" };
                                case "Devanagari":
                                    return { value: item.devanagariChar, class: " font-devanagari text-base" };
                                case "Latin":
                                    return { value: item.latinChar, class: " text-xs" };
                                case "Kannada":
                                    return { value: item.kannadaChar, class: " font-kannada text-base" };
                                case "Telugu":
                                    return { value: item.teluguChar, class: " font-telugu text-base" };
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
                                    return { value: item.devanagariChar, class: " font-devanagari text-base" };
                                case "Latin Equivalent Vowel":
                                    return { value: item.latinEquivalent, class: " text-xs" };
                                case "Kannada":
                                    return { value: item.kannadaChar, class: " font-kannada text-base" };
                                case "Telugu":
                                    return { value: item.teluguChar, class: " font-telugu text-base" };
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
                                    return { value: item.devanagariChar, class: " font-devanagari text-base" };
                                case "Latin Equivalent":
                                    return { value: item.latinEquivalent, class: " text-xs" };
                                case "Kannada":
                                    return { value: item.kannadaChar, class: " font-kannada text-base" };
                                case "Telugu":
                                    return { value: item.teluguChar, class: " font-telugu text-base" };
                                default:
                                    return { value: '—' };
                            }
                        }
                    )}

                    {/* Add Character
                    <div className="mt-4 p-3 sm:p-4 bg-gray-100 rounded-lg shadow-inner w-full md:w-3/4 lg:w-1/2 mx-auto">
                        <h2 className="text-lg font-semibold mb-3 text-center">Add New Character Mapping</h2>
                        <div className="mb-3">
                            <label className="block text-gray-700 text-xs font-bold mb-1">
                                Select Type:
                            </label>
                            <div className="flex flex-wrap items-center space-x-0 sm:space-x-3 space-y-1 sm:space-y-0">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        className="form-radio text-blue-600 h-3.5 w-3.5"
                                        name="mappingType"
                                        value="consonant"
                                        checked={newMappingType === 'consonant'}
                                        onChange={(e) => setNewMappingType(e.target.value)}
                                    />
                                    <span className="ml-1.5 text-gray-900 text-sm">Consonant</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        className="form-radio text-green-600 h-3.5 w-3.5"
                                        name="mappingType"
                                        value="vowel"
                                        checked={newMappingType === 'vowel'}
                                        onChange={(e) => setNewMappingType(e.target.value)}
                                    />
                                    <span className="ml-1.5 text-gray-900 text-sm">Vowel (Multiplier)</span>
                                </label>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <input
                                type="text"
                                placeholder="Latin Character (Optional, e.g., kh, au)"
                                value={newChar}
                                onChange={(e) => setNewChar(e.target.value)}
                                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
                            />
                            <input
                                type="text"
                                placeholder="Devanagari Character (Optional, e.g., ख, औ)"
                                value={newDevanagariChar}
                                onChange={(e) => setNewDevanagariChar(e.target.value)}
                                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-devanagari text-base"
                            />
                            <input
                                type="number"
                                placeholder="Value/Multiplier (e.g., 2, 100000000000000)"
                                value={insertAtNumber}
                                onChange={(e) => setInsertAtNumber(e.target.value)}
                                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
                            />
                            <button
                                onClick={handleAddCharacter}
                                className="bg-gray-200 border-2 border-black hover:bg-black hover:text-white text-black font-semibold py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300 ease-in-out shadow-lg w-full text-sm"
                            >
                                Add Character
                            </button>
                        </div>
                    </div> */}
                </>
            )}

            <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 flex space-x-3">
                <Link to="/private/aryabhatta">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300 ease-in-out shadow-md text-lg w-full sm:w-auto">
                        Go to Script to Number
                    </button>
                </Link>

                <Link to="/private/aryabhattasm">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300 ease-in-out shadow-md text-lg w-full sm:w-auto">
                        Go to Scale Mapper
                    </button>
                </Link>
            </div>

        </div>
    );
}

export default CharacterMapping;
