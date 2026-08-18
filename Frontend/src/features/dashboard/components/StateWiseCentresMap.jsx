import { useEffect, useMemo, useRef, useState } from "react";
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker,
    ZoomableGroup,
} from "react-simple-maps";

/* Real India states map (topojson fetched from a CDN). Every state is a
   hoverable region; the states that have centres are highlighted and
   labelled with their count. Includes +/- zoom controls and a white
   cursor tooltip — matching the reference dashboard. */
const INDIA_TOPO_JSON =
    "https://raw.githubusercontent.com/Anujarya300/bubble_maps/master/data/geography-data/india.topo.json";

const BRAND = "#6B2D5B";
const HILITE = ["#4d2f66", "#e8b23d", "#3d7fd6", "#2fb8a3", "#c77fd6"];

/* Approximate label positions (lon, lat) for the count markers. */
const STATE_CENTROIDS = {
    "andhra pradesh": [79.7, 15.9],
    "arunachal pradesh": [94.7, 28.2],
    "assam": [92.9, 26.2],
    "bihar": [85.8, 25.8],
    "chhattisgarh": [82.0, 21.3],
    "goa": [74.1, 15.3],
    "gujarat": [71.8, 22.6],
    "haryana": [76.1, 29.2],
    "himachal pradesh": [77.2, 31.8],
    "jharkhand": [85.3, 23.6],
    "karnataka": [76.0, 15.0],
    "kerala": [76.5, 10.5],
    "madhya pradesh": [78.5, 23.5],
    "maharashtra": [76.5, 19.5],
    "manipur": [93.9, 24.7],
    "meghalaya": [91.3, 25.5],
    "mizoram": [92.8, 23.3],
    "nagaland": [94.5, 26.1],
    "odisha": [84.5, 20.5],
    "punjab": [75.3, 31.0],
    "rajasthan": [74.2, 26.6],
    "sikkim": [88.5, 27.6],
    "tamil nadu": [78.4, 11.1],
    "telangana": [79.0, 17.9],
    "tripura": [91.7, 23.7],
    "uttar pradesh": [80.9, 27.0],
    "uttarakhand": [79.3, 30.1],
    "west bengal": [87.8, 23.8],
    "delhi": [77.1, 28.6],
    "jammu and kashmir": [75.3, 33.5],
    "ladakh": [77.6, 34.2],
    "puducherry": [79.8, 11.9],
    "chandigarh": [76.8, 30.7],
};

const norm = (s) => (s || "").toString().trim().toLowerCase();

/* Canonicalise so map names line up with our data (e.g. "NCT of Delhi"). */
const ALIASES = {
    "nct of delhi": "delhi",
    "orissa": "odisha",
    "pondicherry": "puducherry",
    "uttaranchal": "uttarakhand",
};
const canon = (s) => {
    const n = norm(s);
    if (ALIASES[n]) return ALIASES[n];
    return n.replace(/^nct of /, "").replace(/ & /g, " and ");
};

const geoName = (props = {}) =>
    props.st_nm ||
    props.NAME_1 ||
    props.ST_NM ||
    props.name ||
    props.NAME ||
    "";

const INITIAL = { coordinates: [82.5, 22.8], zoom: 1 };

function MapSpinner({ height }) {
    return (
        <div
            className="flex flex-col items-center justify-center gap-3"
            style={{ height }}
        >
            <span className="h-9 w-9 animate-spin rounded-full border-4 border-[#E3E6ED] border-t-[#6B2D5B]" />
            <span className="text-[12px] font-medium text-[#6B2D5B]">
                Loading map...
            </span>
        </div>
    );
}

export default function StateWiseCentresMap({ centres = [], height = 420, onStateClick }) {
    const [geoData, setGeoData] = useState(null); // null = loading
    const [failed, setFailed] = useState(false);
    const [hover, setHover] = useState(null); // { name, total }
    const [cursor, setCursor] = useState({ x: 0, y: 0 });
    const [position, setPosition] = useState(INITIAL);
    const wrapRef = useRef(null);

    useEffect(() => {
        let alive = true;
        fetch(INDIA_TOPO_JSON)
            .then((res) => {
                if (!res.ok) throw new Error("map fetch failed");
                return res.json();
            })
            .then((data) => alive && setGeoData(data))
            .catch(() => alive && setFailed(true));
        return () => {
            alive = false;
        };
    }, []);

    // Index centres by canonical state name (with a stable colour each).
    const byState = useMemo(() => {
        const map = {};
        centres.forEach((c, i) => {
            map[canon(c.state_name)] = {
                ...c,
                color: HILITE[i % HILITE.length],
            };
        });
        return map;
    }, [centres]);

    const zoomIn = () =>
        setPosition((p) => ({ ...p, zoom: Math.min(p.zoom * 1.5, 8) }));
    const zoomOut = () =>
        setPosition((p) => ({ ...p, zoom: Math.max(p.zoom / 1.5, 1) }));

    const onMove = (e) => {
        const rect = wrapRef.current?.getBoundingClientRect();
        if (rect) setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    if (!geoData && !failed) return <MapSpinner height={height} />;

    if (failed) {
        return (
            <div
                className="flex flex-col items-center justify-center gap-2 px-4 text-center"
                style={{ height }}
            >
                <span className="text-[12px] text-[#8A7D8E]">
                    Map unavailable — showing centre counts:
                </span>
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                    {centres.map((c) => (
                        <span
                            key={c.state_name}
                            className="text-[12px] font-medium text-[#2D2235]"
                        >
                            {c.state_name} ({c.total})
                        </span>
                    ))}
                </div>
            </div>
        );
    }

    // Keep the tooltip inside the card (flip left near the right edge).
    const cardW = wrapRef.current?.clientWidth || 0;
    const flip = cardW && cursor.x > cardW - 170;

    return (
        <div
            ref={wrapRef}
            className="relative flex w-full items-center justify-center overflow-hidden"
            style={{ height }}
            onMouseMove={onMove}
        >
            <ComposableMap
                projection="geoMercator"
                projectionConfig={{ scale: height * 1.72, center: [82.5, 22.8] }}
                width={Math.round(height * 0.95)}
                height={height}
                style={{ height: "100%", width: "auto", maxWidth: "100%" }}
            >
                <ZoomableGroup
                    zoom={position.zoom}
                    center={position.coordinates}
                    minZoom={1}
                    maxZoom={8}
                    onMoveEnd={setPosition}
                >
                    <Geographies geography={geoData}>
                        {({ geographies }) =>
                            geographies.map((geo) => {
                                const name = geoName(geo.properties);
                                const hit = byState[canon(name)];
                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        onMouseEnter={() =>
                                            setHover({
                                                name,
                                                total: hit ? hit.total : 0,
                                            })
                                        }
                                        onMouseLeave={() => setHover(null)}
                                        onClick={() =>
                                            hit &&
                                            onStateClick &&
                                            onStateClick(hit.state_name || name)
                                        }
                                        style={{
                                            default: {
                                                fill: hit ? hit.color : "#EDE8F0",
                                                stroke: "#ffffff",
                                                strokeWidth: 0.5,
                                                outline: "none",
                                            },
                                            hover: {
                                                fill: hit ? hit.color : "#DAD1E0",
                                                stroke: "#6B2D5B",
                                                strokeWidth: 1,
                                                outline: "none",
                                                cursor: "pointer",
                                            },
                                            pressed: { outline: "none" },
                                        }}
                                    />
                                );
                            })
                        }
                    </Geographies>

                    {/* Count markers + labels for centre states. */}
                    {centres.map((c) => {
                        const coords = STATE_CENTROIDS[norm(c.state_name)];
                        if (!coords) return null;
                        return (
                            <Marker key={c.state_name} coordinates={coords}>
                                <circle
                                    r={4 / position.zoom}
                                    fill={BRAND}
                                    stroke="#ffffff"
                                    strokeWidth={1 / position.zoom}
                                />
                                <text
                                    textAnchor="middle"
                                    y={-8 / position.zoom}
                                    style={{
                                        fontFamily: "inherit",
                                        fontSize: 9 / position.zoom,
                                        fontWeight: 600,
                                        fill: BRAND,
                                        paintOrder: "stroke",
                                        stroke: "#ffffff",
                                        strokeWidth: 2 / position.zoom,
                                    }}
                                >
                                    {c.state_name} ({c.total})
                                </text>
                            </Marker>
                        );
                    })}
                </ZoomableGroup>
            </ComposableMap>

            {/* Zoom controls (bottom-left) */}
            <div className="absolute bottom-3 left-3 z-[10] flex flex-col overflow-hidden rounded-[6px] border border-[#D8D2DE] bg-white shadow-sm">
                <button
                    type="button"
                    onClick={zoomIn}
                    aria-label="Zoom in"
                    className="flex h-7 w-7 items-center justify-center text-[17px] leading-none text-[#2D2235] transition-colors hover:bg-[#F3EEF4]"
                >
                    +
                </button>
                <div className="h-px bg-[#E4DEE9]" />
                <button
                    type="button"
                    onClick={zoomOut}
                    aria-label="Zoom out"
                    className="flex h-7 w-7 items-center justify-center text-[19px] leading-none text-[#2D2235] transition-colors hover:bg-[#F3EEF4]"
                >
                    −
                </button>
            </div>

            {/* White cursor tooltip */}
            {hover && (
                <div
                    style={{
                        position: "absolute",
                        left: flip ? cursor.x - 12 : cursor.x + 14,
                        top: cursor.y + 12,
                        transform: flip ? "translateX(-100%)" : "none",
                        background: "#ffffff",
                        color: "#2D2235",
                        border: "1px solid #EDE8F0",
                        borderRadius: 8,
                        padding: "6px 10px",
                        fontSize: 12,
                        boxShadow: "0 6px 18px rgba(45,34,53,0.15)",
                        pointerEvents: "none",
                        whiteSpace: "nowrap",
                        zIndex: 20,
                    }}
                >
                    <strong>{hover.name}</strong>: {hover.total}{" "}
                    {hover.total === 1 ? "centre" : "centres"}
                </div>
            )}
        </div>
    );
}
