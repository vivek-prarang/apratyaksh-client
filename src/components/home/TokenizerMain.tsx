"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import api from "@/lib/api";

// Color helpers
const hexToRgb = (hex: string) => {
    if (!hex) return { r: 255, g: 255, b: 255 };
    hex = hex.replace(/^#/, "");
    if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
    const n = parseInt(hex, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

const rgbToHex = ({ r, g, b }: { r: number; g: number; b: number }) =>
    "#" +
    [r, g, b]
        .map((x) => {
            const h = Math.round(x);
            const s = h.toString(16);
            return s.length === 1 ? "0" + s : s;
        })
        .join("");

const hexToRgbString = (hex: string) => {
    const { r, g, b } = hexToRgb(hex);
    return `rgb(${r}, ${g}, ${b})`;
};

const weightedBlendColors = (
    consonantColor: string | null,
    vowelColor: string | null,
    consonantVal: number,
    vowelVal: number
) => {
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

const averageColors = (colors: string[]) => {
    const unique = [...new Set(colors)];
    if (unique.length === 0) return "#FFFFFF";

    let total = { r: 0, g: 0, b: 0 };
    unique.forEach((hex) => {
        const { r, g, b } = hexToRgb(hex);
        total.r += r;
        total.g += g;
        total.b += b;
    });

    return rgbToHex({
        r: total.r / unique.length,
        g: total.g / unique.length,
        b: total.b / unique.length,
    });
};

const ColorBox = ({ hex }: { hex: string | null }) => {
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
            <div className="w-full h-5 rounded" style={{ backgroundColor: hex }} />
            <div className="absolute hidden group-hover:flex items-center justify-center bg-black text-white text-xs px-2 py-1 rounded -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap z-10">
                <span className="font-mono select-text">{copied ? "Copied!" : rgb}</span>
            </div>
        </div>
    );
};

interface TokenizerMainProps {
    sentence: string;
    setSentence: (value: string) => void;
    analysisResults: any[];
    setAnalysisResults: (value: any[]) => void;
    calculationResults: any;
    setCalculationResults: (value: any) => void;
    isLoading: boolean;
    setIsLoading: (value: boolean) => void;
    error: string;
    showError: (msg: string) => void;
    setShowAnalysisResults: (value: boolean) => void;
    showAnalysisResults: boolean;
    setShowMathRules: (value: boolean) => void;
    showMathRules: boolean;
    setShowCalculationResults: (value: boolean) => void;
    showCalculationResults: boolean;
    activeMathRule: string | null;
    setActiveMathRule: (value: string | null) => void;
}

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
    setActiveMathRule,
}: TokenizerMainProps) {
    const [selectedScript, setSelectedScript] = useState(
        typeof window !== "undefined" ? localStorage.getItem("selectedScript") || "latin" : "latin"
    );
    const [inputType, setInputType] = useState(
        typeof window !== "undefined" ? localStorage.getItem("inputType") || "word" : "word"
    );
    const [charColors, setCharColors] = useState<Record<string, string>>({});

    // Ref for auto-scroll to results
    const resultsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchColors = async () => {
            try {
                const response = await api.get(`https://api.apratyaksh.org/api/v1/aryabhatta/colors`);
                setCharColors(response.data);
            } catch (err) {
                console.error("Error fetching colors:", err);
            }
        };

        fetchColors();
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("selectedScript", selectedScript);
        }
    }, [selectedScript]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("inputType", inputType);
        }
    }, [inputType]);

    // Auto-scroll to results when they appear
    useEffect(() => {
        if (showAnalysisResults && resultsRef.current) {
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
        }
    }, [showAnalysisResults]);

    const handleSentenceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const rawValue = e.target.value;
        if (inputType === "word") {
            setSentence(rawValue.replace(/\s/g, ""));
        } else {
            setSentence(rawValue);
        }
    };

    const handleConvertCharToNum = async () => {
        setAnalysisResults([]);
        setCalculationResults(null);
        showError("");
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

        let wordsToProcess: string[] = [];
        if (inputType === "word") {
            const cleanedWord = sentence.replace(/\s/g, "");
            if (!cleanedWord) {
                showError("Please enter a valid word.");
                setIsLoading(false);
                return;
            }
            wordsToProcess = [cleanedWord];
        } else {
            wordsToProcess = sentence
                .trim()
                .split(/\s+/)
                .filter((word) => word.length > 0);
            if (wordsToProcess.length === 0) {
                showError("Please enter a valid sentence.");
                setIsLoading(false);
                return;
            }
        }

        let allProcessedTokens: any[] = [];
        try {
            for (const word of wordsToProcess) {
                const response = await api.post(`https://api.apratyaksh.org/api/v1/aryabhatta/process_sentence`, {
                    word: word,
                    inputScript: selectedScript,
                });

                const data = response.data;

                if (response && response.data && response.data.tokens) {
                    allProcessedTokens = allProcessedTokens.concat(response.data.tokens);
                } else {
                    showError(`Error processing "${word}": ${response.data?.error || "An unknown error occurred."}`);
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
            console.error("Error:", err);
            showError("Failed to connect to the server or an unexpected error occurred during processing.");
            setShowAnalysisResults(false);
            setShowMathRules(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMathCalculation = async (operationType: string) => {
        showError("");
        setIsLoading(true);
        setCalculationResults(null);
        setShowCalculationResults(false);
        setActiveMathRule(operationType);

        if (analysisResults.length === 0) {
            showError("Please convert characters to numbers first.");
            setIsLoading(false);
            return;
        }

        const tokensForCalculation = analysisResults.map((wordObj) => Number((Object.values(wordObj)[0] as any).value));

        try {
            const response = await api.post(`/aryabhatta/calculate`, {
                tokens: tokensForCalculation,
                operation: operationType,
            });

            const data = response.data;

            if (response.status === 200) {
                setCalculationResults({ operation: data.operation, result: data.result });
                setShowCalculationResults(true);
            } else {
                showError(data.error || "An unknown error occurred during calculation.");
                setShowCalculationResults(false);
            }
        } catch (err) {
            console.error("Error:", err);
            showError("Failed to connect to the server for calculation.");
            setShowCalculationResults(false);
        } finally {
            setIsLoading(false);
        }
    };

    const getOperationDisplayName = (operationType: string) => {
        switch (operationType) {
            case "addition":
                return "Add";
            case "multiplication":
                return "Multiply";
            case "subtraction_fd":
                return "Subtract (L to R)";
            case "subtraction_bd":
                return "Subtract (R to L)";
            case "division_fd":
                return "Divide (L to R)";
            case "division_bd":
                return "Divide (R to L)";
            default:
                return "";
        }
    };

    const formatNumberForDisplay = (value: any) => {
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
        return num.toFixed(10).replace(/\.?0+$/, "");
    };

    const mathButtonClass = (op: string) =>
        `${activeMathRule === op ? "bg-red-300" : "bg-gray-200"} border-2 border-black hover:bg-black hover:text-white text-black font-semibold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-75 transition duration-300 ease-in-out shadow-lg w-full`;

    const getPlaceholderText = (script: string, type: string) => {
        if (type === "word") {
            switch (script) {
                case "latin":
                    return "Type your Latin word here...";
                case "devanagari":
                    return "अपना देवनागरी शब्द यहाँ लिखें...";
                case "kannada":
                    return "ನಿಮ್ಮ ಕನ್ನಡ ಪದವನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ...";
                case "telugu":
                    return "మీ తెలుగు పదాన్ని ఇక్కడ టైప్ చేయండి...";
                default:
                    return "Type your word here...";
            }
        } else {
            switch (script) {
                case "latin":
                    return "Type your Latin sentence here...";
                case "devanagari":
                    return "अपना देवनागरी वाक्य यहाँ लिखें...";
                case "kannada":
                    return "ನಿಮ್ಮ ಕನ್ನಡ ವಾಕ್ಯವನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ...";
                case "telugu":
                    return "మీ తెలుగు వాక్యాన్ని ఇక్కడ టైప్ చేయండి...";
                default:
                    return "Type your sentence here...";
            }
        }
    };

    return (
        <div className="w-full">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Header */}
                <div className=" px-6 py-2 text-center">
                    <h1 className="text-xl sm:text-2xl  font-semibold  text-gray-700">
                        Varṇamālā: Unity of Language (Script), Maths (Numbers), Coloues (Varna) and Music (Ragha)
                    </h1>

                </div>

                {/* Content */}
                <div className="p-6 sm:p-8 space-y-6">

                    {/* Input Section */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                        <label htmlFor="sentenceInput" className="block text-gray-900 dark:text-white text-sm sm:text-base mb-3 font-semibold">
                            Select Input Script:
                        </label>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    className="form-radio h-4 w-4 text-black"
                                    name="inputScript"
                                    value="latin"
                                    checked={selectedScript === "latin"}
                                    onChange={() => setSelectedScript("latin")}
                                />
                                <span className="ml-2 text-black text-sm sm:text-base">Latin Script</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    className="form-radio h-4 w-4 text-black"
                                    name="inputScript"
                                    value="devanagari"
                                    checked={selectedScript === "devanagari"}
                                    onChange={() => setSelectedScript("devanagari")}
                                />
                                <span className="ml-2 text-black text-sm sm:text-base">Devanagari Script</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    className="form-radio h-4 w-4 text-black"
                                    name="inputScript"
                                    value="kannada"
                                    checked={selectedScript === "kannada"}
                                    onChange={() => setSelectedScript("kannada")}
                                />
                                <span className="ml-2 text-black text-sm sm:text-base">Kannada Script</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    className="form-radio h-4 w-4 text-black"
                                    name="inputScript"
                                    value="telugu"
                                    checked={selectedScript === "telugu"}
                                    onChange={() => setSelectedScript("telugu")}
                                />
                                <span className="ml-2 text-black text-sm sm:text-base">Telugu Script</span>
                            </label>
                        </div>

                        <label className="block text-black text-sm sm:text-base mb-2 font-medium">Choose Input Type:</label>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    className="form-radio h-4 w-4 text-black"
                                    name="inputType"
                                    value="word"
                                    checked={inputType === "word"}
                                    onChange={() => setInputType("word")}
                                />
                                <span className="ml-2 text-black text-sm sm:text-base">Enter a word</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    className="form-radio h-4 w-4 text-black"
                                    name="inputType"
                                    value="sentence"
                                    checked={inputType === "sentence"}
                                    onChange={() => setInputType("sentence")}
                                />
                                <span className="ml-2 text-black text-sm sm:text-base">Enter a sentence</span>
                            </label>
                        </div>

                        <label htmlFor="sentenceInput" className="block text-black text-sm sm:text-base mb-2 font-medium">
                            {inputType === "word" ? "Enter a word:" : "Enter a sentence:"}
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

                    <div className="flex justify-center">
                        <button
                            id="convertCharToNumBtn"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleConvertCharToNum}
                            disabled={isLoading}
                        >
                            {isLoading ? "Processing..." : "Convert Script to Number"}
                        </button>
                    </div>
                </div>

                {/* {isLoading && (
                    <div id="loadingIndicator" className="text-center text-gray-600 font-medium mb-4 h-6">
                        Processing...
                    </div>
                )} */}

                {error && (
                    <div
                        id="errorDisplay"
                        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4 transition-all duration-300 ease-in-out"
                        role="alert"
                    >
                        <strong className="font-semibold">Error!</strong>
                        <span className="block sm:inline" id="errorMessage">
                            {error}
                        </span>
                    </div>
                )}

                {showAnalysisResults && (
                    <div ref={resultsRef} id="resultsTableContainer" className="mt-4 mb-8 p-4 border rounded-lg bg-gray-50">
                        <h3 className="text-xl sm:text-2xl font-medium text-black mb-4">Saṅkhyā (Number Creation):</h3>
                        <div className="bg-gray-100 p-4 rounded-lg border border-gray-300 overflow-x-auto">
                            <table id="resultsTable" className="min-w-full table-auto border border-gray-400">
                                <thead>
                                    <tr>
                                        <th className="bg-gray-300 text-black text-left border border-gray-400 px-4 py-2 w-1/4 font-semibold">
                                            Śabda
                                        </th>
                                        {analysisResults.map((wordObj: any, index) => (
                                            <th
                                                key={index}
                                                className="bg-gray-200 text-black text-left border border-gray-400 px-4 py-2 font-semibold"
                                            >
                                                {Object.keys(wordObj)[0]}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th className="bg-gray-300 text-black text-left border border-gray-400 px-4 py-2 align-top font-semibold">
                                            Viślēṣaṇa
                                        </th>
                                        {analysisResults.map((wordObj: any, index) => (
                                            <td key={index} className="text-left border border-gray-400 px-4 py-2">
                                                <table className="w-full text-center text-xs sm:text-sm border-collapse border border-gray-300 mt-1">
                                                    <thead>
                                                        <tr>
                                                            <th className="border border-gray-300 px-2 py-1 font-semibold">Vibhājana</th>
                                                            {(Object.values(wordObj)[0] as any).letters_breakdown.map((segment: any, segIndex: number) => (
                                                                <th key={segIndex} className="border border-gray-300 px-2 py-1">
                                                                    {segment.char}
                                                                    {segment.type === "consonant" && (
                                                                        <Image src="/male.png" alt="Male" width={24} height={24} className="mx-auto mt-1" />
                                                                    )}
                                                                    {(segment.type === "vowel_for_consonant" ||
                                                                        segment.type === "implicit_vowel" ||
                                                                        segment.type === "standalone_vowel") && (
                                                                            <Image
                                                                                src="/female.png"
                                                                                alt="Female"
                                                                                width={24}
                                                                                height={24}
                                                                                className="mx-auto mt-1"
                                                                            />
                                                                        )}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td className="border border-gray-300 px-2 py-1 font-semibold">Varṇāṅka</td>
                                                            {(Object.values(wordObj)[0] as any).letters_breakdown.map((segment: any, segIndex: number) => {
                                                                const displayChar =
                                                                    segment.char ||
                                                                    segment.vowel ||
                                                                    (segment.type === "implicit_vowel"
                                                                        ? selectedScript === "latin"
                                                                            ? "a"
                                                                            : selectedScript === "devanagari"
                                                                                ? "अ"
                                                                                : "ಅ"
                                                                        : "");
                                                                return (
                                                                    <td key={segIndex} className="border border-gray-300 px-2 py-1">
                                                                        {segment.type === "vowel_for_consonant" ||
                                                                            segment.type === "implicit_vowel" ||
                                                                            segment.type === "standalone_vowel"
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
                                                                            : formatNumberForDisplay(segment.value)}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>

                                                        <tr>
                                                            <td className="border border-gray-300 px-2 py-1 font-semibold">Varṇa</td>
                                                            {(Object.values(wordObj)[0] as any).letters_breakdown.map((segment: any, segIndex: number) => {
                                                                const vowelImplicit =
                                                                    selectedScript === "latin" ? "a" : selectedScript === "devanagari" ? "अ" : "ಅ";
                                                                const colorKey =
                                                                    segment.type === "consonant"
                                                                        ? segment.char || ""
                                                                        : segment.type === "implicit_vowel"
                                                                            ? vowelImplicit
                                                                            : segment.vowel || segment.char || "";
                                                                const color = charColors[colorKey] || null;
                                                                return (
                                                                    <td key={segIndex} className="border border-gray-300 px-2 py-1">
                                                                        {color ? <ColorBox hex={color} /> : null}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>

                                                        <tr>
                                                            <td className="flex justify-center items-center px-2 py-1">
                                                                <Image src="/malefemaleunion.png" alt="Union" width={24} height={24} />
                                                            </td>
                                                            {(Object.values(wordObj)[0] as any).letters_breakdown.map((segment: any, segIndex: number) => {
                                                                let unionValue = "";
                                                                if (segment.type === "vowel_for_consonant" || segment.type === "implicit_vowel") {
                                                                    const val =
                                                                        (Number(segment.consonant_sum_at_vowel) || 0) * (Number(segment.value) || 0);
                                                                    unionValue = Number.isFinite(val) ? val.toLocaleString("en-US") : "";
                                                                } else {
                                                                    unionValue = "";
                                                                }
                                                                return (
                                                                    <td key={segIndex} className="border border-gray-300 px-2 py-1 font-semibold text-gray-800">
                                                                        {unionValue && <span className="inline-flex items-center gap-1">{unionValue}</span>}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>

                                                        <tr>
                                                            <td className="border border-gray-300 px-2 py-1 font-semibold">Akṣara Varṇa</td>
                                                            {(Object.values(wordObj)[0] as any).letters_breakdown.map(
                                                                (segment: any, segIndex: number, arr: any[]) => {
                                                                    if (!(segment.type === "vowel_for_consonant" || segment.type === "implicit_vowel")) {
                                                                        return <td key={segIndex} className="border border-gray-300 px-2 py-1"></td>;
                                                                    }

                                                                    const consonantVal = Number(segment.consonant_sum_at_vowel) || 0;
                                                                    const vowelVal = Number(segment.value) || 0;
                                                                    const prev = arr[segIndex - 1];
                                                                    const consonantKey =
                                                                        (prev && prev.type === "consonant" && prev.char) || segment.consonant || "";
                                                                    const vowelImplicit =
                                                                        selectedScript === "latin" ? "a" : selectedScript === "devanagari" ? "अ" : "ಅ";
                                                                    const vowelKey =
                                                                        segment.type === "implicit_vowel"
                                                                            ? vowelImplicit
                                                                            : segment.vowel || segment.char || "";
                                                                    const consonantColor = charColors[consonantKey] || null;
                                                                    const vowelColor = charColors[vowelKey] || null;

                                                                    const blended = weightedBlendColors(consonantColor, vowelColor, consonantVal, vowelVal);

                                                                    if (!segment._blendedColors) segment._blendedColors = [];
                                                                    segment._blendedColors.push(blended);

                                                                    return (
                                                                        <td key={segIndex} className="border border-gray-300 px-2 py-1">
                                                                            {blended ? <ColorBox hex={blended} /> : null}
                                                                        </td>
                                                                    );
                                                                }
                                                            )}
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        ))}
                                    </tr>

                                    <tr>
                                        <th className="bg-gray-300 text-black text-left border border-gray-400 px-4 py-2 font-semibold">
                                            Aṅka
                                        </th>
                                        {analysisResults.map((wordObj, index) => (
                                            <td key={index} className="text-left border border-gray-400 px-4 py-2 font-semibold text-gray-800">
                                                {(Object.values(wordObj)[0] as any).letters_breakdown.length}
                                            </td>
                                        ))}
                                    </tr>

                                    <tr>
                                        <th className="bg-gray-300 text-black text-left border border-gray-400 px-4 py-2 font-semibold">
                                            Saṅkhyā
                                        </th>
                                        {analysisResults.map((wordObj, index) => {
                                            const val = (Object.values(wordObj)[0] as any).value;

                                            const unionColors: string[] = [];
                                            (Object.values(wordObj)[0] as any).letters_breakdown.forEach((seg: any) => {
                                                if (seg._blendedColors) seg._blendedColors.forEach((c: string) => unionColors.push(c));
                                            });

                                            const sankhyaColor = averageColors(unionColors);

                                            return (
                                                <td key={index} className="text-left border border-gray-400 px-0 py-0 font-semibold text-blue-700">
                                                    <div className="flex w-full h-full">
                                                        <div className="flex-1 flex items-center justify-center px-2 py-2">
                                                            {Number.isFinite(Number(val)) ? Number(val).toLocaleString("en-US") : val}
                                                        </div>

                                                        <div className="flex-1 flex items-center justify-center">
                                                            <div className="w-52 h-8 px-2">
                                                                <ColorBox hex={sankhyaColor} />
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
                                                const allColors: string[] = [];
                                                analysisResults.forEach((wordObj) => {
                                                    (Object.values(wordObj)[0] as any).letters_breakdown.forEach((seg: any) => {
                                                        if (seg._blendedColors) seg._blendedColors.forEach((c: string) => allColors.push(c));
                                                    });
                                                });

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
                                        <th className="bg-gray-300 text-black text-left border border-gray-400 px-4 py-2 font-semibold">
                                            Śabda
                                        </th>
                                        {analysisResults.map((wordObj: any, index) => (
                                            <th
                                                key={index}
                                                className="bg-gray-200 text-black text-left border border-gray-400 px-4 py-2 font-semibold"
                                            >
                                                {Object.keys(wordObj)[0]}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th className="bg-red-300 text-black text-left border border-gray-400 px-4 py-2 font-semibold">
                                            {getOperationDisplayName(calculationResults.operation)}
                                        </th>
                                        {calculationResults.result.map((res: any, index: number) => (
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
        </div>

    );
}

export default TokenizerMain;
