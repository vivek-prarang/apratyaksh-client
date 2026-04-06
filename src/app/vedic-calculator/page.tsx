"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

type StepDetail = Record<string, unknown> | string | number | boolean | null;

interface ExpressionStep {
  step: number;
  sutra: string;
  operation: string;
  before: string;
  after: string;
  explanation: string;
  result_after_step: number;
  details: StepDetail[] | null;
}

interface ExpressionResponse {
  expression: string;
  normalized_expression: string;
  result: number;
  steps: ExpressionStep[];
}

const isOperator = (value: string) => ["+", "-", "*", "/", "÷"].includes(value);

const normalizeExpressionInput = (value: string) =>
  value.replaceAll("x", "*").replaceAll("X", "*").replaceAll("÷", "/");

export default function VedicCalculatorPage() {
  const [expression, setExpression] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ExpressionResponse | null>(null);

  const applyInput = (token: string) => {
    setError("");
    setResult(null);

    setExpression((prev) => {
      const current = prev;
      const lastChar = current[current.length - 1];

      if (isOperator(token)) {
        if (!current) {
          return token === "-" ? "-" : "";
        }
        if (current === "0" && token !== "-") {
          return "0";
        }
        if (isOperator(lastChar)) {
          return current.slice(0, -1) + token;
        }
        return current + token;
      }

      if (current === "0") {
        return token;
      }

      return current + token;
    });
  };

  const clearAll = () => {
    setExpression("0");
    setError("");
    setResult(null);
  };

  const deleteLast = () => {
    setError("");
    setResult(null);
    setExpression((prev) => {
      const next = prev.slice(0, -1);
      return next === "" ? "0" : next;
    });
  };

  const calculate = async () => {
    const trimmed = expression.trim();
    if (!trimmed) {
      setError("Please enter an expression.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await api.post<ExpressionResponse>("/api/v1/vedic-calculator/expression-calculate", {
        expression: trimmed,
      });
      setResult(response.data);
    } catch (err: unknown) {
      const detail =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: unknown }).response === "object" &&
        (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined;
      setError(detail || "Calculation failed. Please check your expression format.");
    } finally {
      setLoading(false);
    }
  };

  const formatDetailRow = (detail: StepDetail) => {
    if (typeof detail !== "object" || detail === null) {
      return String(detail);
    }

    const preferredOrder = [
      "step",
      "step_num",
      "rule",
      "calculation",
      "output",
      "result",
      "running_total_after",
      "running_quotient",
      "running_decimal",
      "remainder",
      "digit",
      "carry_out",
    ];

    const formatValue = (value: unknown) => {
      if (Array.isArray(value)) {
        return value.map((item, index) => `${index + 1}) ${String(item)}`).join("\n");
      }
      if (typeof value === "object" && value !== null) {
        return Object.entries(value)
          .map(([k, v]) => `${k}=${String(v)}`)
          .join(", ");
      }
      return String(value);
    };

    const entries = Object.entries(detail);
    const orderedEntries = [
      ...preferredOrder
        .filter((key) => key in detail)
        .map((key) => [key, (detail as Record<string, unknown>)[key]] as [string, unknown]),
      ...entries.filter(([key]) => !preferredOrder.includes(key)),
    ];

    const lines = orderedEntries.map(([key, value]) => `${key}: ${formatValue(value)}`);
    return lines.join("\n");
  };

  const keypadButtons = [
    { label: "AC", type: "action" as const, className: "bg-rose-100 text-rose-700 hover:bg-rose-200" },
    { label: "DEL", type: "action" as const, className: "bg-amber-100 text-amber-700 hover:bg-amber-200" },
    { label: "-", type: "input" as const, className: "bg-sky-100 text-sky-700 hover:bg-sky-200" },
    { label: "*", display: "x", type: "input" as const, className: "bg-sky-100 text-sky-700 hover:bg-sky-200" },
    { label: "7", type: "input" as const, className: "bg-white text-slate-900 hover:bg-slate-50" },
    { label: "8", type: "input" as const, className: "bg-white text-slate-900 hover:bg-slate-50" },
    { label: "9", type: "input" as const, className: "bg-white text-slate-900 hover:bg-slate-50" },
    { label: "+", type: "input" as const, className: "bg-sky-100 text-sky-700 hover:bg-sky-200" },
    { label: "4", type: "input" as const, className: "bg-white text-slate-900 hover:bg-slate-50" },
    { label: "5", type: "input" as const, className: "bg-white text-slate-900 hover:bg-slate-50" },
    { label: "6", type: "input" as const, className: "bg-white text-slate-900 hover:bg-slate-50" },
    { label: "/", display: "÷", type: "input" as const, className: "bg-sky-100 text-sky-700 hover:bg-sky-200" },
    { label: "1", type: "input" as const, className: "bg-white text-slate-900 hover:bg-slate-50" },
    { label: "2", type: "input" as const, className: "bg-white text-slate-900 hover:bg-slate-50" },
    { label: "3", type: "input" as const, className: "bg-white text-slate-900 hover:bg-slate-50" },
    // { label: "00", type: "input" as const, className: "bg-white text-slate-900 hover:bg-slate-50" },
    { label: "0", type: "input" as const, className: "bg-white text-slate-900 hover:bg-slate-50" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
          
          

              <h1 className="text-3xl font-bold text-slate-900 md:text-3xl text-center" style={{ textShadow: "rgb(255, 255, 255) 1px 1px 0px, rgb(170, 170, 170) 2px 2px 0px !important", textDecoration: "underline" }}>
  Vedic Calculator
</h1>
          <section className="mt-6 grid gap-6 lg:grid-cols-[430px,1fr]">
            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-inner">
                <div className="rounded-xl border border-slate-300 bg-slate-900 p-3">
                  <textarea
                    value={expression}
                    onChange={(event) => {
                      setError("");
                      setResult(null);
                      setExpression(normalizeExpressionInput(event.target.value));
                    }}
                    className="min-h-20 w-full resize-none rounded-lg border border-slate-600 bg-slate-800 px-3 py-3 text-right font-mono text-2xl text-emerald-300 outline-none focus:border-blue-500"
                    placeholder="0"
                  />
                </div>

                <div className="mt-4 grid grid-cols-4 gap-2">
                  {keypadButtons.map((button) => (
                    <button
                      key={button.label}
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        if (button.type === "action") {
                          if (button.label === "AC") {
                            clearAll();
                          } else {
                            deleteLast();
                          }
                          return;
                        }
                        applyInput(button.label);
                      }}
                      className={`h-12 rounded-xl border border-slate-200 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${button.className}`}
                    >
                      {button.display ?? button.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => void calculate()}
                  className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {loading ? "Calculating..." : "Calculate"}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

              {result ? (
                <section className="space-y-4 h-[500px] overflow-y-auto w-full pr-4">
                  {/* <div className="sticky top-0 z-10 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-sm text-emerald-800">Input: {result.expression}</p>
                    <p className="text-sm text-emerald-800">Normalized: {result.normalized_expression}</p>
                    <p className="mt-2 text-2xl font-bold text-emerald-900">Final Result: {result.result}</p>
                  </div> */}

                  <h2 className="text-lg font-semibold text-slate-900">Step-by-step Sutra Flow</h2>
                  <div className="space-y-3">
                    {result.steps.map((step) => (
                      <article key={step.step} className="rounded-xl border border-slate-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Step {step.step}</p>
                        <p className="mt-1 text-base font-semibold text-slate-900">{step.sutra}</p>
                        <p className="mt-1 text-sm text-slate-700">Operation: {step.operation}</p>
                        {/* <p className="mt-1 text-sm text-slate-700">Before: {step.before}</p>
                        <p className="mt-1 text-sm text-slate-700">After: {step.after}</p>
                        <p className="mt-1 text-sm text-slate-700">Calculation: {step.explanation}</p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">Step Output: {step.result_after_step}</p> */}

                        {step.details && step.details.length > 0 ? (
                          <div className="mt-3 rounded-lg bg-slate-50 p-3">
                            <p className="mb-2 text-sm font-semibold text-slate-800">Step-by-step Calculation</p>
                            <ul className="space-y-2 text-xs text-slate-700">
                              {step.details.map((detail, index) => (
                                <li key={`${step.step}-${index}`} className="whitespace-pre-wrap rounded border border-slate-200 bg-white p-2 font-mono">
                                  {formatDetailRow(detail)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          </section>

          <div className="mt-6 flex flex-wrap gap-3 justify-center lg:justify-start">
            <Link href="/" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Go to Script to Number
            </Link>
            <Link
              href="/char-mapping"
              className="rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
            >
              Character Mapping
            </Link>
            <Link
              href="/scale-mapping"
              className="rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
            >
              Scale Mapping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
