import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../../../apis/api";

import maleImage from "../../../assets/images/male.png";
import femaleImage from "../../../assets/images/female.png";
import malefemaleunion from "../../../assets/images/malefemaleunion.png";



// --- Color helpers ---
const hexToRgb = (hex) => {
    if (!hex) return { r: 255, g: 255, b: 255 };
    hex = hex.replace(/^#/, "");
    if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
    const n = parseInt(hex, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

const rgbToHex = ({ r, g, b }) =>
    "#" +
    [r, g, b]
        .map((x) => {
            const h = Math.round(x);
            const s = h.toString(16);
            return s.length === 1 ? "0" + s : s;
        })
        .join("");

const hexToRgbString = (hex) => {
    const { r, g, b } = hexToRgb(hex);
    return `rgb(${r}, ${g}, ${b})`;
};


// Weighted blend: (Cv * Ccolor + Vv * Vcolor) / (Cv + Vv)
const weightedBlendColors = (consonantColor, vowelColor, consonantVal, vowelVal) => {
    if (!consonantColor && !vowelColor) return null;

    const c1 = consonantColor ? hexToRgb(consonantColor) : null;
    const c2 = vowelColor ? hexToRgb(vowelColor) : null;
    const cv = Number(consonantVal) || 0;
    const vv = Number(vowelVal) || 0;
    const total = cv + vv;
    if (total === 0) return null;

    return rgbToHex({
        r: ((c1 ? cv * c1.r : 0) + (c2 ? vv * c2.r : 0)) / total,
        g: ((c1 ? cv * c1.g : 0) + (c2 ? vv * c2.g : 0)) / total,
        b: ((c1 ? cv * c1.b : 0) + (c2 ? vv * c2.b : 0)) / total,
    });
};


// --- Saṅkhyā colour helpers ---
// average of unique union colours
const averageColors = (colors) => {
    const unique = [...new Set(colors)]; // remove duplicate hex
    if (unique.length === 0) return "#FFFFFF";

    let total = { r: 0, g: 0, b: 0 };
    unique.forEach(hex => {
        const { r, g, b } = hexToRgb(hex);
        total.r += r;
        total.g += g;
        total.b += b;
    });

    return rgbToHex({
        r: total.r / unique.length,
        g: total.g / unique.length,
        b: total.b / unique.length
    });
};

// --- Reusable ColorBox with hover tooltip + click-to-copy ---
const ColorBox = ({ hex }) => {
    if (!hex) return null;
    const rgb = hexToRgbString(hex);
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(rgb);
        setCopied(true);
        setTimeout(() => setCopied(false), 1000);
    };

    return (
        <div className="relative group cursor-pointer w-full h-5" onClick={handleCopy}>
            {/* colour cell */}
            <div
                className="w-full h-5 rounded"
                style={{ backgroundColor: hex }}
            />

            {/* tooltip */}
            <div className="absolute hidden group-hover:flex items-center justify-center
                      bg-black text-white text-xs px-2 py-1 rounded
                      -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap z-10">
                <span className="font-mono select-text">
                    {copied ? "Copied!" : rgb}
                </span>
            </div>
        </div>
    );
};



function TokenizerMain({
    sentence,
    setSentence,
    analysisResults,
    setAnalysisResults,
    calculationResults,
    setCalculationResults,
    isLoading,
    setIsLoading,
    error,
    showError,
    setShowAnalysisResults,
    showAnalysisResults,
    setShowMathRules,
    showMathRules,
    setShowCalculationResults,
    showCalculationResults,
    activeMathRule,
    setActiveMathRule
}) {
    const [selectedScript, setSelectedScript] = useState(
        localStorage.getItem('selectedScript') || 'latin'
    );
    const [inputType, setInputType] = useState(
        localStorage.getItem('inputType') || 'word'
    );
    const [charColors, setCharColors] = useState({});

    const navigate = useNavigate();


    useEffect(() => {
        const fetchColors = async () => {
            try {
                const response = await api.get(`/aryabhatta/colors`);
                setCharColors(response.data);

            } catch (err) {
                console.error("Error fetching colors:", err);
            }
        };

        fetchColors();
    }, []);




    useEffect(() => {
        localStorage.setItem('selectedScript', selectedScript);
    }, [selectedScript]);

    useEffect(() => {
        localStorage.setItem('inputType', inputType);
    }, [inputType]);



    // Your existing handlers now work perfectly
    const handleSentenceChange = (e) => {
        const rawValue = e.target.value;
        if (inputType === 'word') {
            setSentence(rawValue.replace(/\s/g, ''));
        } else {
            setSentence(rawValue);
        }
    };

    const handleConvertCharToNum = async () => {
        setAnalysisResults([]);
        setCalculationResults(null);
        showError('');
        setIsLoading(true);
        setShowAnalysisResults(false);
        setShowMathRules(false);
        setShowCalculationResults(false);
        setActiveMathRule(null);

        if (!sentence.trim()) {
            showError("Please enter a word or sentence to process.");
            setIsLoading(false);
            return;
        }

        if (sentence.length > 100) {
            showError("Input exceeds 100 character limit.");
            setIsLoading(false);
            return;
        }

        let wordsToProcess = [];
        if (inputType === 'word') {
            const cleanedWord = sentence.replace(/\s/g, '');
            if (!cleanedWord) {
                showError("Please enter a valid word.");
                setIsLoading(false);
                return;
            }
            wordsToProcess = [cleanedWord];
        } else {
            wordsToProcess = sentence.trim().split(/\s+/).filter(word => word.length > 0);
            if (wordsToProcess.length === 0) {
                showError("Please enter a valid sentence.");
                setIsLoading(false);
                return;
            }
        }

        let allProcessedTokens = [];
        try {
            for (const word of wordsToProcess) {
                const response = await api.post(`/aryabhatta/process_sentence`, {
                    word: word,
                    inputScript: selectedScript,
                });
                ;
                const data = response.data;


                if (response && response.data && response.data.tokens) {
                    allProcessedTokens = allProcessedTokens.concat(response.data.tokens);
                } else {
                    showError(`Error processing "${word}": ${response.data?.error || 'An unknown error occurred.'}`);
                    setShowAnalysisResults(false);
                    setShowMathRules(false);
                    setIsLoading(false);
                    return;
                }
            }
            setAnalysisResults(allProcessedTokens);
            setShowAnalysisResults(true);
            setShowMathRules(true);
        } catch (err) {
            console.error('Error:', err);
            showError('Failed to connect to the server or an unexpected error occurred during processing.');
            setShowAnalysisResults(false);
            setShowMathRules(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMathCalculation = async (operationType) => {
        showError('');
        setIsLoading(true);
        setCalculationResults(null);
        setShowCalculationResults(false);
        setActiveMathRule(operationType);

        if (analysisResults.length === 0) {
            showError("Please convert characters to numbers first.");
            setIsLoading(false);
            return;
        }

        // Use final Saṅkhyā value per word
        const tokensForCalculation = analysisResults.map(wordObj =>
            Number(Object.values(wordObj)[0].value)
        );


        try {
            const response = await api.post(`/aryabhatta/calculate`, {
                tokens: tokensForCalculation,
                operation: operationType
            });

            const data = response.data;

            if (response.status === 200) {
                setCalculationResults({ operation: data.operation, result: data.result });
                setShowCalculationResults(true);
            } else {
                showError(data.error || 'An unknown error occurred during calculation.');
                setShowCalculationResults(false);
            }
        } catch (err) {
            console.error('Error:', err);
            showError('Failed to connect to the server for calculation.');
            setShowCalculationResults(false);
        } finally {
            setIsLoading(false);
        }
    };


    const getOperationDisplayName = (operationType) => {
        switch (operationType) {
            case 'addition': return 'Add';
            case 'multiplication': return 'Multiply';
            case 'subtraction_fd': return 'Subtract (L to R)';
            case 'subtraction_bd': return 'Subtract (R to L)';
            case 'division_fd': return 'Divide (L to R)';
            case 'division_bd': return 'Divide (R to L)';
            default: return '';
        }
    };

    const formatNumberForDisplay = (value) => {
        const num = parseFloat(value);
        if (isNaN(num)) return String(value);
        if (Math.abs(num) >= 1e6) {
            const exp = Math.floor(Math.log10(Math.abs(num)));
            const base = num / Math.pow(10, exp);
            if (base === 1) return `10^${exp}`;
            else return `${base}×10^${exp}`;
        }
        if (Number.isInteger(num)) return num.toString();
        const epsilon = 1e-10;
        if (num !== 0 && Math.abs(num) < epsilon) return num.toExponential(9);
        return num.toFixed(10).replace(/\.?0+$/, '');
    };

    const mathButtonClass = (op) =>
        `${activeMathRule === op ? 'bg-red-300' : 'bg-gray-200'} border-2 border-black hover:bg-black hover:text-white text-black font-semibold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-75 transition duration-300 ease-in-out shadow-lg w-full`;

    const getPlaceholderText = (script, type) => {
        if (type === 'word') {
            switch (script) {
                case 'latin': return "Type your Latin word here...";
                case 'devanagari': return "अपना देवनागरी शब्द यहाँ लिखें...";
                case 'kannada': return "ನಿಮ್ಮ ಕನ್ನಡ ಪದವನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ...";
                // case 'tamil': return "உங்கள் தமிழ் வார்த்தையை இங்கே தட்டச்சு செய்யவும்...";
                case 'telugu': return "మీ తెలుగు పదాన్ని ఇక్కడ టైప్ చేయండి...";
                default: return "Type your word here...";
            }
        } else {
            switch (script) {
                case 'latin': return "Type your Latin sentence here...";
                case 'devanagari': return "अपना देवनागरी वाक्य यहाँ लिखें...";
                case 'kannada': return "ನಿಮ್ಮ ಕನ್ನಡ ವಾಕ್ಯವನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ...";
                case 'tamil': return "உங்கள் தமிழ் வாக்கியத்தை இங்கே தட்டச்சு செய்யவும்...";
                case 'telugu': return "మీ తెలుగు వాక్యాన్ని ఇక్కడ టైప్ చేయండి...";
                default: return "Type your sentence here...";
            }
        }
    };

    return (
        <div className="min-h-screen w-full bg-gray-100 p-4 sm:p-8 flex flex-col items-center font-sans">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-full lg:max-w-7xl mx-auto flex flex-col">
                <h1 className="text-2xl sm:text-3xl font-semibold text-black mb-6 text-center">Script to Number (Based on Varṇamālā)</h1>

                <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                    <label htmlFor="sentenceInput" className="block text-black text-sm sm:text-base mb-2 font-medium">Select Input Script:</label>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4">
                        <label className="inline-flex items-center">
                            <input type="radio" className="form-radio h-4 w-4 text-black" name="inputScript" value="latin"
                                checked={selectedScript === 'latin'} onChange={() => setSelectedScript('latin')} />
                            <span className="ml-2 text-black text-sm sm:text-base">Latin Script</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input type="radio" className="form-radio h-4 w-4 text-black" name="inputScript" value="devanagari"
                                checked={selectedScript === 'devanagari'} onChange={() => setSelectedScript('devanagari')} />
                            <span className="ml-2 text-black text-sm sm:text-base">Devanagari Script</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input type="radio" className="form-radio h-4 w-4 text-black" name="inputScript" value="kannada"
                                checked={selectedScript === 'kannada'} onChange={() => setSelectedScript('kannada')} />
                            <span className="ml-2 text-black text-sm sm:text-base">Kannada Script</span>
                        </label>
                        {/* <label className="inline-flex items-center">
                            <input type="radio" className="form-radio h-4 w-4 text-black"
                                   name="inputScript" value="tamil"
                                   checked={selectedScript === 'tamil'}
                                   onChange={() => setSelectedScript('tamil')} />
                            <span className="ml-2 text-black text-sm sm:text-base">Tamil Script</span>
                        </label> */}
                        <label className="inline-flex items-center">
                            <input type="radio" className="form-radio h-4 w-4 text-black"
                                name="inputScript" value="telugu"
                                checked={selectedScript === 'telugu'}
                                onChange={() => setSelectedScript('telugu')} />
                            <span className="ml-2 text-black text-sm sm:text-base">Telugu Script</span>
                        </label>
                    </div>

                    <label className="block text-black text-sm sm:text-base mb-2 font-medium">Choose Input Type:</label>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4">
                        <label className="inline-flex items-center">
                            <input type="radio" className="form-radio h-4 w-4 text-black" name="inputType" value="word"
                                checked={inputType === 'word'} onChange={() => setInputType('word')} />
                            <span className="ml-2 text-black text-sm sm:text-base">Enter a word</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input type="radio" className="form-radio h-4 w-4 text-black" name="inputType" value="sentence"
                                checked={inputType === 'sentence'} onChange={() => setInputType('sentence')} />
                            <span className="ml-2 text-black text-sm sm:text-base">Enter a sentence</span>
                        </label>
                    </div>

                    <label htmlFor="sentenceInput" className="block text-black text-sm sm:text-base mb-2 font-medium">
                        {inputType === 'word' ? "Enter a word:" : "Enter a sentence:"}
                    </label>
                    <textarea
                        id="sentenceInput"
                        className="shadow-inner appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-black leading-tight focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-y h-32 text-base sm:text-lg"
                        placeholder={getPlaceholderText(selectedScript, inputType)}
                        value={sentence}
                        onChange={handleSentenceChange}
                        maxLength={100}
                        required
                    ></textarea>
                </div>

                <div className="flex justify-center mb-6">
                    <button
                        id="convertCharToNumBtn"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300 ease-in-out shadow-md text-lg w-full sm:w-auto"
                        onClick={handleConvertCharToNum}
                        disabled={isLoading}
                    >
                        Convert Script to Number
                    </button>
                </div>

                {isLoading && (
                    <div id="loadingIndicator" className="text-center text-gray-600 font-medium mb-4 h-6">
                        Processing...
                    </div>
                )}

                {error && (
                    <div id="errorDisplay" className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4 transition-all duration-300 ease-in-out" role="alert">
                        <strong className="font-semibold">Error!</strong>
                        <span className="block sm:inline" id="errorMessage">{error}</span>
                    </div>
                )}

                {showAnalysisResults && (
                    <div id="resultsTableContainer" className="mt-4 mb-8 p-4 border rounded-lg bg-gray-50">
                        <h3 className="text-xl sm:text-2xl font-medium text-black mb-4">Saṅkhyā (Number Creation):</h3>
                        <div className="bg-gray-100 p-4 rounded-lg border border-gray-300 overflow-x-auto">
                            <table id="resultsTable" className="min-w-full table-auto border border-gray-400">
                                <thead>
                                    <tr>
                                        <th className="bg-gray-300 text-black text-left border border-gray-400 px-4 py-2 w-1/4 font-semibold">Śabda</th>
                                        {analysisResults.map((wordObj, index) => (
                                            <th key={index} className="bg-gray-200 text-black text-left border border-gray-400 px-4 py-2 font-semibold">{Object.keys(wordObj)[0]}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th className="bg-gray-300 text-black text-left border border-gray-400 px-4 py-2 align-top font-semibold">Viślēṣaṇa</th>
                                        {analysisResults.map((wordObj, index) => (
                                            <td key={index} className="text-left border border-gray-400 px-4 py-2">
                                                <table className="w-full text-center text-xs sm:text-sm border-collapse border border-gray-300 mt-1">
                                                    <thead>
                                                        <tr>
                                                            <th className="border border-gray-300 px-2 py-1 font-semibold">Vibhājana</th>
                                                            {Object.values(wordObj)[0].letters_breakdown.map((segment, segIndex) => (
                                                                <th key={segIndex} className="border border-gray-300 px-2 py-1">
                                                                    {segment.char}
                                                                    {segment.type === 'consonant' && (
                                                                        <img src={maleImage} alt="Male" className="h-6 w-6 mx-auto mt-1" />
                                                                    )}
                                                                    {(segment.type === 'vowel_for_consonant' || segment.type === 'implicit_vowel' || segment.type === 'standalone_vowel') && (
                                                                        <img src={femaleImage} alt="Female" className="h-6 w-6 mx-auto mt-1" />
                                                                    )}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {/* Varṇāṅka (no color bg here) */}
                                                        <tr>
                                                            <td className="border border-gray-300 px-2 py-1 font-semibold">Varṇāṅka</td>
                                                            {Object.values(wordObj)[0].letters_breakdown.map((segment, segIndex) => {
                                                                const displayChar =
                                                                    segment.char ||
                                                                    segment.vowel ||
                                                                    (segment.type === "implicit_vowel"
                                                                        ? (selectedScript === "latin" ? "a" : selectedScript === "devanagari" ? "अ" : "ಅ")
                                                                        : "");
                                                                return (
                                                                    <td key={segIndex} className="border border-gray-300 px-2 py-1">
                                                                        {segment.type === 'vowel_for_consonant' || segment.type === 'implicit_vowel' || segment.type === 'standalone_vowel'
                                                                            ? (() => {
                                                                                const num = parseFloat(segment.value);
                                                                                if (!isNaN(num) && num > 0) {
                                                                                    const exp = Math.floor(Math.log10(num));
                                                                                    if (Math.abs(num - Math.pow(10, exp)) < 1e-8) {
                                                                                        return `10^${exp}`;
                                                                                    }
                                                                                }
                                                                                return formatNumberForDisplay(segment.value);
                                                                            })()
                                                                            : formatNumberForDisplay(segment.value)
                                                                        }
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>

                                                        {/* NEW ROW: Colour (per Varṇāṅka) */}
                                                        <tr>
                                                            <td className="border border-gray-300 px-2 py-1 font-semibold">Varṇa</td>
                                                            {Object.values(wordObj)[0].letters_breakdown.map((segment, segIndex) => {
                                                                const vowelImplicit = selectedScript === "latin" ? "a" : selectedScript === "devanagari" ? "अ" : "ಅ";
                                                                const colorKey =
                                                                    segment.type === "consonant" ? (segment.char || "") :
                                                                        segment.type === "implicit_vowel" ? vowelImplicit :
                                                                            (segment.vowel || segment.char || "");
                                                                const color = charColors[colorKey] || null;
                                                                return (
                                                                    <td key={segIndex} className="border border-gray-300 px-2 py-1">
                                                                        {color ? <ColorBox hex={color} /> : null}
                                                                    </td>
                                                                );

                                                            })}
                                                        </tr>


                                                        {/* Male–Female Union (no bg here) */}
                                                        <tr>
                                                            <td className="flex justify-center items-center px-2 py-1">
                                                                <img src={malefemaleunion} alt="Union" className="h-6 w-6" />
                                                            </td>
                                                            {Object.values(wordObj)[0].letters_breakdown.map((segment, segIndex) => {
                                                                let unionValue = '';
                                                                if (segment.type === 'vowel_for_consonant' || segment.type === 'implicit_vowel') {
                                                                    const val = (Number(segment.consonant_sum_at_vowel) || 0) * (Number(segment.value) || 0);
                                                                    unionValue = Number.isFinite(val) ? val.toLocaleString('en-US') : '';
                                                                } else {
                                                                    unionValue = '';
                                                                }
                                                                return (
                                                                    <td key={segIndex} className="border border-gray-300 px-2 py-1 font-semibold text-gray-800">
                                                                        {unionValue && <span className="inline-flex items-center gap-1">{unionValue}</span>}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>

                                                        {/* NEW ROW: Colour Union (weighted blend) */}
                                                        {/* NEW ROW: Colour Union (weighted blend using preceding consonant) */}
                                                        {/* NEW ROW: Colour Union (weighted blend using preceding consonant) */}
                                                        <tr>
                                                            <td className="border border-gray-300 px-2 py-1 font-semibold">Akṣara Varṇa</td>
                                                            {Object.values(wordObj)[0].letters_breakdown.map((segment, segIndex, arr) => {
                                                                if (!(segment.type === "vowel_for_consonant" || segment.type === "implicit_vowel")) {
                                                                    return <td key={segIndex} className="border border-gray-300 px-2 py-1"></td>;
                                                                }

                                                                const consonantVal = Number(segment.consonant_sum_at_vowel) || 0;
                                                                const vowelVal = Number(segment.value) || 0;
                                                                const prev = arr[segIndex - 1];
                                                                const consonantKey = (prev && prev.type === "consonant" && prev.char) || segment.consonant || "";
                                                                const vowelImplicit = selectedScript === "latin" ? "a" : selectedScript === "devanagari" ? "अ" : "ಅ";
                                                                const vowelKey = segment.type === "implicit_vowel" ? vowelImplicit : (segment.vowel || segment.char || "");
                                                                const consonantColor = charColors[consonantKey] || null;
                                                                const vowelColor = charColors[vowelKey] || null;

                                                                const blended = weightedBlendColors(consonantColor, vowelColor, consonantVal, vowelVal);

                                                                // --- NEW: push into dummy array on segment object ---
                                                                if (!segment._blendedColors) segment._blendedColors = [];
                                                                segment._blendedColors.push(blended);

                                                                return (
                                                                    <td key={segIndex} className="border border-gray-300 px-2 py-1">
                                                                        {blended ? <ColorBox hex={blended} /> : null}
                                                                    </td>
                                                                );

                                                            })}
                                                        </tr>


                                                    </tbody>
                                                </table>
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Count row */}
                                    <tr>
                                        <th className="bg-gray-300 text-black text-left border border-gray-400 px-4 py-2 font-semibold">Aṅka</th>
                                        {analysisResults.map((wordObj, index) => (
                                            <td key={index} className="text-left border border-gray-400 px-4 py-2 font-semibold text-gray-800">
                                                {Object.values(wordObj)[0].letters_breakdown.length}
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Total number row */}
                                    {/* Total number row */}
                                    <tr>
                                        <th className="bg-gray-300 text-black text-left border border-gray-400 px-4 py-2 font-semibold">
                                            Saṅkhyā
                                        </th>
                                        {analysisResults.map((wordObj, index) => {
                                            const val = Object.values(wordObj)[0].value;

                                            // collect all Colour Union colours for this word
                                            const unionColors = [];
                                            Object.values(wordObj)[0].letters_breakdown.forEach(seg => {
                                                if (seg._blendedColors) seg._blendedColors.forEach(c => unionColors.push(c));
                                            });

                                            // compute resultant Sankhya colour
                                            const sankhyaColor = averageColors(unionColors);

                                            return (
                                                <td
                                                    key={index}
                                                    className="text-left border border-gray-400 px-0 py-0 font-semibold text-blue-700"
                                                >
                                                    <div className="flex w-full h-full">
                                                        {/* Left: numeric value */}
                                                        <div className="flex-1 flex items-center justify-center px-2 py-2">
                                                            {Number.isFinite(Number(val)) ? Number(val).toLocaleString("en-US") : val}
                                                        </div>

                                                        {/* Right: centered color box */}
                                                        <div className="flex-1 flex items-center justify-center">
                                                            <div className="w-52 h-8 px-2">
                                                                <ColorBox hex={sankhyaColor} fullHeight={false} copyFormat="rgb" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>

                                    <tr>
                                        <th className="bg-gray-300 text-black text-left border border-gray-400 px-4 py-2 font-semibold">
                                            Raṅga
                                        </th>
                                        <td className="border border-gray-400 px-2 py-1" colSpan={analysisResults.length}>
                                            {(() => {
                                                // collect all blended colours from all words
                                                const allColors = [];
                                                analysisResults.forEach(wordObj => {
                                                    Object.values(wordObj)[0].letters_breakdown.forEach(seg => {
                                                        if (seg._blendedColors) seg._blendedColors.forEach(c => allColors.push(c));
                                                    });
                                                });

                                                // average all colors together
                                                const mixedColor = averageColors(allColors);
                                                return mixedColor ? <ColorBox hex={mixedColor} /> : null;
                                            })()}
                                        </td>
                                    </tr>






                                </tbody>
                            </table>
                        </div>
                    </div>
                )}



                {showCalculationResults && calculationResults && (
                    <div id="calculationResultsTableContainer" className="mt-6 p-4 border rounded-lg bg-gray-50">
                        <h3 className="text-xl sm:text-2xl font-medium text-black mb-2">Calculation Result:</h3>
                        <div className="bg-gray-100 p-4 rounded-lg border border-gray-300 overflow-x-auto">
                            <table id="calculationResultsTable" className="min-w-full table-auto border border-gray-400">
                                <thead>
                                    <tr>
                                        <th className="bg-gray-300 text-black text-left border border-gray-400 px-4 py-2 font-semibold">Śabda</th>
                                        {analysisResults.map((wordObj, index) => (
                                            <th key={index} className="bg-gray-200 text-black text-left border border-gray-400 px-4 py-2 font-semibold">{Object.keys(wordObj)[0]}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th className="bg-red-300 text-black text-left border border-gray-400 px-4 py-2 font-semibold">{getOperationDisplayName(calculationResults.operation)}</th>
                                        {calculationResults.result.map((res, index) => (
                                            <td key={index} className="text-left border border-gray-400 px-4 py-2 font-semibold">
                                                {formatNumberForDisplay(res)}
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
            {/* Bottom-right navigation button */}
            <div className="fixed flex bottom-6 right-6">
                <button
                    onClick={() => navigate("/private/aryabhattacm")}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300 ease-in-out shadow-md text-lg w-full sm:w-auto"
                >
                    Go to Akṣara-Saṅkhyā Sambandhaḥ
                </button>
            </div>
        </div>
    );
}

export default TokenizerMain;
