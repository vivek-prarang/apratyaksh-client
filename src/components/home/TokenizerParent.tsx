"use client";

import { useState } from "react";
import TokenizerMain from "./TokenizerMain";

const TokenizerParent = () => {
    const [sentence, setSentence] = useState("");
    const [analysisResults, setAnalysisResults] = useState([]);
    const [calculationResults, setCalculationResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showAnalysisResults, setShowAnalysisResults] = useState(false);
    const [showMathRules, setShowMathRules] = useState(false);
    const [showCalculationResults, setShowCalculationResults] = useState(false);
    const [activeMathRule, setActiveMathRule] = useState(null);

    const showError = (msg: string) => setError(msg);

    return (
        <TokenizerMain
            sentence={sentence}
            setSentence={setSentence}
            analysisResults={analysisResults}
            setAnalysisResults={setAnalysisResults}
            calculationResults={calculationResults}
            setCalculationResults={setCalculationResults}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            error={error}
            showError={showError}
            showAnalysisResults={showAnalysisResults}
            setShowAnalysisResults={setShowAnalysisResults}
            showMathRules={showMathRules}
            setShowMathRules={setShowMathRules}
            showCalculationResults={showCalculationResults}
            setShowCalculationResults={setShowCalculationResults}
            activeMathRule={activeMathRule}
            setActiveMathRule={setActiveMathRule}
        />
    );
};

export default TokenizerParent;
