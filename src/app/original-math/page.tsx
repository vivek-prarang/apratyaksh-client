"use client";
import { useState } from "react";
import api from "@/lib/api";
import { ClientPageRoot } from "next/dist/client/components/client-page";

type StepDetail = Record<string, unknown> | string | number | boolean | null;

interface ExpressionStep {
  step: number;
  sutra: string;
  operation: string;
  before?: string;
  after?: string;
  explanation?: string;
  result_after_step?: number;
  details: StepDetail[] | null;
}

interface ExpressionResponse {
  expression: string;
  normalized_expression: string;
  result: number;
  steps: ExpressionStep[];
}

const OriginalMath = () => {

  const [activeTab, setActiveTab] = useState("tab1");
  const [input, setInput] = useState(["", ""]);
  const [data, setData] = useState("");
  const [result, setResult] = useState<ExpressionResponse | null>(null);
  const [error, setError] = useState("");

  const tabs = [
    { id: "tab1", label: "Yoga", modern: "Addition", example: "2 + 3 = 5", operator: "+" },
    { id: "tab2", label: "Viyoga", modern: "Subtraction", example: "5 - 3 = 2", operator: "-" },
    { id: "tab3", label: "Gunana", modern: "Multiplication", example: "2 × 3 = 6", operator: "×" },
    { id: "tab4", label: "Bhaga", modern: "Division", example: "6 ÷ 3 = 2", operator: "÷" },
  ];


  const activeData = tabs.find(tab => tab.id === activeTab);


  const handleInputChange = (index, e) => {
    const value = e.target.value;

    setInput((prev) => {
      const newinput = [...prev];
      newinput[index] = value;
      return newinput;
    })
  };

  //   const formatDetailRow = (detail: StepDetail) => {
  //   if (typeof detail !== "object" || detail === null) {
  //     // console.log("Formatting detail row:", detail);
  //     return detail;
  //   }


  //   return Object.entries(detail)
  //     .map(([key, value]) => {
  //       if (Array.isArray(value)) {
  //         return `${key}:\n${value.map((v, i) => `${i + 1}. ${v}`).join("\n")}`;
  //       }

  //       return `${key}: ${value}`;

  //     })
  //     .join("\n");
  // };


  const calculateOriginalMath = async () => {

    let filterdata = input.filter(num => num.trim() !== "");

    console.log("Filtered data:", filterdata);

    if (filterdata.length < 2) {
      setError("Please enter at least two valid inputs.");
      return;

    }

    const operator = activeData?.operator === "×" ? "*" : activeData?.operator;

    const expression = filterdata.join(` ${operator} `);

    console.log("Constructed expression:", expression);

    try {
      setError("");
      const response = await api.post("/api/v1/vedic-calculator/expression-calculate", {
        expression: expression,

      })

      setResult(response.data);
      console.log("Calculation result:", response.data);
    } catch (error) {
      console.error("Error", error);
      setError("Error calculating. Please try again.");
      setResult(null);
    }


  }






  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h1
            className="text-3xl font-bold text-slate-900 text-center underline"
            style={{ textShadow: "1px 1px 0px #fff, 2px 2px 0px #aaa" }}
          >
            {activeData?.label}({activeData?.modern})
          </h1>

          <div className="mt-6 flex flex-row items-center gap-2 flex-wrap pb-2 border-b border-slate-100 justify-start sm:justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setResult(null); setError(""); setData(""); setInput(["", ""]); }}

                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap flex-1 sm:flex-initial text-center ${activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
              >
                {tab.label}({tab.modern})
              </button>
            ))}
          </div>
          {
            error && (
              <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

          {


            activeData && (
              <>
                <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:p-5">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    {/* <p className="text-sm font-semibold text-slate-700">Build expression</p> */}
                    {/* <p className="text-xs text-slate-500">Example: {activeData.example}</p> */}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {input.map((num, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={num}
                          onChange={(e) => handleInputChange(index, e)}
                          placeholder={`Input ${index + 1}`}
                          className="w-28 rounded-xl border border-slate-900 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition-all duration-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                        />

                        <button
                          onClick={() => setInput((prev) => (prev.length > 2 ? prev.filter((_, i) => i !== index) : prev))}
                          className="rounded-lg bg-rose-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                          disabled={input.length <= 2}
                          aria-label={`Remove input ${index + 1}`}
                        >
                          Remove
                        </button>

                        {index < input.length - 1 && (
                          <span className="text-lg font-bold text-slate-700">{activeData.operator}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={() => setInput((prev) => [...prev, ""])}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Add More+
                    </button>
                    <button
                      onClick={() => { setInput(["", ""]); setResult(null); setError(""); }}
                      className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={calculateOriginalMath}
                      className="rounded-lg bg-amber-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Compute
                    </button>
                  </div>
                </section>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div className="p-6 rounded-xl border border-dark-100  shadow-sm">
                    <h2 className="text-xl font-bold text-dark-800 mb-3 flex items-center  justify-center gap-2">
                      📜 Modern  {activeData?.modern}
                    </h2>

                  </div>


                  <div className="p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h2 className="text-xl font-bold text-emerald-800 mb-3 flex items-center justify-center gap-2">
                      📜 Original {activeData?.label}
                    </h2>

                    {result ? (
                      <section className="space-y-4 h-[500px] overflow-y-auto w-full pr-2">


                        <h3 className="text-lg font-semibold text-slate-900">Step-by-step Sutra Flow</h3>
                        <div className="space-y-3">
                          {result.steps.map((step) => (
                            <article key={step.step} className="rounded-xl border border-slate-200 bg-white p-4">
                              {/* <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Step {step.step}</p> */}
                              <p className="mt-1 text-base font-semibold text-slate-900">{step.sutra}</p>
                              {/* <p className="mt-1 text-sm text-slate-700">Operation: {step.operation}</p> */}

                              {step.details && step.details.length > 0 ? (
                                <div className="mt-3 rounded-lg bg-slate-50 p-3">
                                  <p className="mb-2 text-sm font-semibold text-slate-800">Step-by-step Calculation</p>
                                  <ul className="space-y-2 text-xs text-slate-700">
                                    {/* {step.details.map((detail, index) => (
                                      <li
                                        key={`${step.step}-${index}`}
                                        className="whitespace-pre-wrap rounded border border-slate-200 bg-white p-2 font-mono text-slate-800"
                                        dangerouslySetInnerHTML={{
                                          __html: String(formatDetailRow(detail))
                                        }}
                                      />
                                    ))} */}


                                    {step.details.map((detail: any, index) => {

                                      // Normal string step
                                      if (typeof detail === "string") {
                                        return (
                                          <li
                                            key={`${step.step}-${index}`}
                                            className="whitespace-pre-wrap rounded border border-slate-200 bg-white p-2 text-slate-800"
                                            dangerouslySetInnerHTML={{ __html: detail }}
                                          />
                                        );
                                      }


                                      if (detail?.type === "complement") {
                                        return (
                                          <li
                                            key={`${step.step}-${index}`}
                                            className="rounded-xl border-2 shadow p-4"
                                          >
                                            <h4 className="font-bold text-green-700 mb-3">
                                              ➖ Complement
                                            </h4>

                                            <div className="space-y-2">
                                              {detail.complement?.slice(0,-1).map((item: string, i: number) => (
                                                <div
                                                  key={i}
                                                  className="rounded bg-white border  p-2"
                                                  dangerouslySetInnerHTML={{ __html: item }}
                                                />
                                              ))}
                                            </div>
                                          </li>
                                        );
                                      }

                                      // Nested Addition
                                      if (detail?.type === "addition") {
                                        return (
                                          <li
                                            key={`${step.step}-${index}`}
                                            className="rounded-xl border-2 shadow p-4"
                                          >
                                            <h4 className="font-bold text-green-700 mb-3">
                                              ➕ Addition
                                            </h4>

                                            <div className="space-y-2">
                                              {detail.add?.slice(0,-1).map((item: string, i: number) => (
                                                <div
                                                  key={i}
                                                  className="rounded bg-white border  p-2"
                                                  dangerouslySetInnerHTML={{ __html: item }}
                                                />
                                              ))}
                                            </div>
                                          </li>
                                        );
                                      }

                                      // Nested Subtraction
                                      if (detail?.type === "subtraction") {
                                        return (
                                          <li
                                            key={`${step.step}-${index}`}
                                            className="rounded-xl border-2  shadow p-4"
                                          >
                                            <h4 className="font-bold text-red-700 mb-3">
                                              ➖ Subtraction
                                            </h4>

                                            <div className="space-y-2">

                                              {detail.sub?.slice(0,-1).map((item: any, i: number) => {

                                                if (typeof item === "string") {
                                                  return (
                                                    <div
                                                      key={i}
                                                      className="rounded bg-white border  p-2"
                                                      dangerouslySetInnerHTML={{ __html: item }}
                                                    />

                                                  )
                                                }


                                                if (item?.type === "complement") {
                                                  return (
                                                    <li
                                                      key={i}
                                                      className="rounded-xl border-2 shadow p-4"
                                                    >
                                                      <h4 className="font-bold text-green-700 mb-3">
                                                        ➖ Complement
                                                      </h4>

                                                      <div className="space-y-2">
                                                        {item.complement?.slice(0,-1).map((item: string, i: number) => (
                                                          <div
                                                            key={i}
                                                            className="rounded bg-white border  p-2"
                                                            dangerouslySetInnerHTML={{ __html: item }}
                                                          />
                                                        ))}
                                                      </div>
                                                    </li>
                                                  );
                                                }


                                                if (item?.type === "addition") {
                                                  return (
                                                    <li
                                                      key={`i`}
                                                      className="rounded-xl border-2 shadow p-4"
                                                    >
                                                      <h4 className="font-bold text-green-700 mb-3">
                                                        ➕ Addition
                                                      </h4>

                                                      <div className="space-y-2">
                                                        {item.add?.slice(0,-1).map((item: string, i: number) => (
                                                          <div
                                                            key={i}
                                                            className="rounded bg-white border  p-2"
                                                            dangerouslySetInnerHTML={{ __html: item }}
                                                          />
                                                        ))}
                                                      </div>
                                                    </li>
                                                  );
                                                }









                                              })}



                                            </div>
                                          </li>
                                        );
                                      }

                                      // Nested Multiplication
                                      if (detail?.type === "multiplication") {
                                        return (
                                          <li
                                            key={`${step.step}-${index}`}
                                            className="rounded-xl border-2 shadow p-4"
                                          >
                                            <h4 className="font-bold shadow text-blue-700 mb-3">
                                              ✖ Multiplication
                                            </h4>

                                            <div className="space-y-2">
                                              {detail.mul?.map((item: string, i: number) => (
                                                <div
                                                  key={i}
                                                  className="rounded bg-white border  p-2 font-mono"
                                                >
                                                  {item}
                                                </div>
                                              ))}
                                            </div>
                                          </li>
                                        );
                                      }

                                      return null;
                                    })}
                                  </ul>
                                </div>
                              ) : null}
                            </article>
                          ))}
                        </div>
                      </section>
                    ) : (
                      <p className="text-sm text-slate-500 text-center">Enter an expression and click Calculate to see the step-by-step output here.</p>
                    )}

                  </div>

                </div>

              </>

            )



          }

        </div>
      </div>
    </main>
  );
};

export default OriginalMath;
