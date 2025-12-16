import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function ScaleMapper() {
    const [r, setR] = useState("");
    const [g, setG] = useState("");
    const [b, setB] = useState("");
    const [hex, setHex] = useState("#000000");
    const [result, setResult] = useState("");

    const hexToRgb = (hex) => {
        const clean = hex.replace("#", "");
        if (clean.length !== 6) return null;
        const r = parseInt(clean.substring(0, 2), 16);
        const g = parseInt(clean.substring(2, 4), 16);
        const b = parseInt(clean.substring(4, 6), 16);
        return { r, g, b };
    };

    const rgbToHex = (r, g, b) =>
        "#" +
        [r, g, b]
            .map((x) => {
                const hex = Number(x).toString(16);
                return hex.length === 1 ? "0" + hex : hex;
            })
            .join("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Always convert to RGB
        let rgb = hexToRgb(hex);
        if (!rgb) {
            setResult("Invalid hex code");
            return;
        }

        const payload = {
            r: Number(rgb.r),
            g: Number(rgb.g),
            b: Number(rgb.b)
        };

        console.log("Sending payload:", payload); // for debugging

        try {
            const response = await axios.post(
                `${BASE_URL}/aryabhatta/closest_character`,
                payload,
                { headers: { "Content-Type": "application/json" } }
            );

            // Show character, shade, sthana
            const data = response.data;
            setResult(
                `Character: ${data.closest_character}, Shade: ${data.colour_shade}, Sthāna: ${data.sthana}`
            );
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data) {
                setResult(`Error: ${err.response.data.detail || err.response.data.error}`);
            } else {
                setResult("Error finding closest character");
            }
        }
    };


    const handleHexChange = (value) => {
        setHex(value);
        const rgb = hexToRgb(value);
        if (rgb) {
            setR(rgb.r);
            setG(rgb.g);
            setB(rgb.b);
        }
    };

    const handleRgbChange = (rVal, gVal, bVal) => {
        setR(rVal);
        setG(gVal);
        setB(bVal);
        if (rVal !== "" && gVal !== "" && bVal !== "") {
            setHex(rgbToHex(rVal, gVal, bVal));
        }
    };

    return (
        <div className="flex p-6 space-x-8">
            <div className="w-1/2">
                <h1 className="text-xl font-bold mb-4">Scale Mapper</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="number"
                        placeholder="R (0-255)"
                        value={r}
                        onChange={(e) => handleRgbChange(Number(e.target.value), g, b)}
                        className="border p-2 rounded w-full"
                    />
                    <input
                        type="number"
                        placeholder="G (0-255)"
                        value={g}
                        onChange={(e) => handleRgbChange(r, Number(e.target.value), b)}
                        className="border p-2 rounded w-full"
                    />
                    <input
                        type="number"
                        placeholder="B (0-255)"
                        value={b}
                        onChange={(e) => handleRgbChange(r, g, Number(e.target.value))}
                        className="border p-2 rounded w-full"
                    />

                    <div className="text-center text-gray-600 font-semibold">— OR —</div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            placeholder="#RRGGBB"
                            value={hex}
                            onChange={(e) => handleHexChange(e.target.value)}
                            className="border p-2 rounded w-full"
                        />
                        <input
                            type="color"
                            value={hex}
                            onChange={(e) => handleHexChange(e.target.value)}
                            className="w-12 h-12 cursor-pointer border rounded"
                        />
                    </div>

                    <button type="submit" className="bg-black text-white py-2 px-4 rounded">
                        Find Closest Character
                    </button>
                </form>

                {result && (
                    <p className="mt-4 text-lg">
                        <span className="font-semibold">{result}</span>
                    </p>
                )}
            </div>

            <div className="w-1/2">
                <ColorMappingTable />
            </div>

            <div className="fixed bottom-4 right-4 flex space-x-3">
                <Link to="/private/aryabhatta">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300 ease-in-out shadow-md text-lg w-full sm:w-auto">
                        Go to Script to Number
                    </button>
                </Link>
                <Link to="/private/aryabhattacm">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300 ease-in-out shadow-md text-lg w-full sm:w-auto">
                        Go to Akṣara-Saṅkhyā Sambandhaḥ
                    </button>
                </Link>
            </div>
        </div>
    );
}

function ColorMappingTable() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios
            .get(`${BASE_URL}/aryabhatta/color_mappings`)
            .then((res) => {
                console.log("Full response:", res);
                console.log("Response data:", res.data);
                console.log("Response data.data:", res.data.data);

                if (res.data.success && res.data.data) {
                    const dataArray = Array.isArray(res.data.data) ? res.data.data : [];
                    console.log("Setting rows to:", dataArray);
                    setRows(dataArray);
                } else {
                    console.log("No data found, setting empty array");
                    setRows([]);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error loading color mappings:", err);
                setError("Failed to load color mappings");
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="text-center p-4">Loading color mappings...</div>;
    }

    if (error) {
        return <div className="text-center p-4 text-red-600">{error}</div>;
    }

    return (
        <div>
            <h2 className="text-lg font-bold mb-2">Colour Mapping</h2>
            <div className="overflow-y-scroll max-h-[600px] border rounded">
                <table className="w-full text-sm">
                    <thead className="bg-gray-200 sticky top-0">
                        <tr>
                            <th className="p-2">Varnamala Character</th>
                            <th className="p-2">Hex</th>
                            <th className="p-2">RGB</th>
                            <th className="p-2">Varna Shade</th>
                            <th className="p-2">Sthāna</th>
                            <th className="p-2">Preview</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center p-4">
                                    No color mappings available
                                </td>
                            </tr>
                        ) : (
                            rows.map((row) => (
                                <tr key={row.id} className="border-t">
                                    <td className="p-2">{row.devanagari_char || "—"}</td>
                                    <td className="p-2">{row.color_hex || "—"}</td>
                                    <td className="p-2">
                                        ({row.color_r || 0}, {row.color_g || 0}, {row.color_b || 0})
                                    </td>
                                    <td className="p-2">{row.colour_shade || "—"}</td>
                                    <td className="p-2">{row.sthana || "—"}</td>
                                    <td className="p-2">
                                        <div
                                            className="w-6 h-6 rounded border"
                                            style={{ backgroundColor: row.color_hex || "#000000" }}
                                        />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
