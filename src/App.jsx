import React, { useEffect, useState } from "react";
import "./index.css";

const API_KEY = "EJ6UBL2JEQGYB3AA4ENASN62J";

const ICON_MAP = {
    "partly-cloudy-day": "https://i.ibb.co/PZQXH8V/27.png",
    "partly-cloudy-night": "https://i.ibb.co/Kzkk59k/15.png",
    rain: "https://i.ibb.co/kBd2NTS/39.png",
    "clear-day": "https://i.ibb.co/rb4rrJL/26.png",
    "clear-night": "https://i.ibb.co/1nxNGHL/10.png",
    default: "https://i.ibb.co/rb4rrJL/26.png",
};

const BG_MAP = {
    "partly-cloudy-day": "https://i.ibb.co/qNv7NxZ/pc.webp",
    "partly-cloudy-night": "https://i.ibb.co/RDfPqXz/pcn.jpg",
    rain: "https://i.ibb.co/h2p6Yhd/rain.webp",
    "clear-day": "https://i.ibb.co/WGry01m/cd.jpg",
    "clear-night": "https://i.ibb.co/kqtZ1Gx/cn.jpg",
    default: "https://i.ibb.co/qNv7NxZ/pc.webp",
};

const toLocalTime = (epoch, options = {}) => {
    if (!epoch) return "--";
    return new Date(epoch * 1000).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        ...options,
    });
};

const toLocalDateTime = (epoch) => {
    if (!epoch) return "--";
    const d = new Date(epoch * 1000);
    const day = d.toLocaleDateString("en-US", { weekday: "long" });
    const time = d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
    return `${day}, ${time}`;
};

const dayLabelFromEpoch = (epoch) =>
    new Date(epoch * 1000).toLocaleDateString("en-US", { weekday: "short" });

const uvDescription = (uv) => {
    if (uv == null) return "--";
    if (uv < 3) return "Low";
    if (uv < 6) return "Moderate";
    if (uv < 8) return "High";
    if (uv < 11) return "Very High";
    return "Extreme";
};

const App = () => {
    const [city, setCity] = useState("Bengaluru,Karnataka");
    const [query, setQuery] = useState("Bengaluru,Karnataka");
    const [data, setData] = useState(null);
    const [tab, setTab] = useState("today"); // "today" | "week"
    const [unit, setUnit] = useState("C"); // "C" | "F"
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const currentIcon =
        data?.currentConditions?.icon || data?.days?.[0]?.icon || "default";

    // Set background according to current condition
    useEffect(() => {
        const bg = BG_MAP[currentIcon] || BG_MAP.default;
        document.body.style.backgroundImage = `url("${bg}")`;
        document.body.style.backgroundSize="cover";
        document.body.style.backgroundPosition="center";
        document.body.style.backgroundRepeat = "no-repeat";
    }, [currentIcon]);

    const convertTemp = (t) => {
        if (t == null || isNaN(t)) return "--";
        if (unit === "C") return Math.round(t);
        return Math.round((t * 9) / 5 + 32);
    };

    const fetchWeather = async (cityName) => {
        if (!cityName) return;
        setLoading(true);
        setError("");
        try {
            const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(
                cityName
            )}?unitGroup=metric&key=${API_KEY}&contentType=json`;

            const res = await fetch(url);
            if (!res.ok) throw new Error("Failed to fetch weather");
            const json = await res.json();

            setData(json);
            setCity(json.resolvedAddress || json.address || cityName);

            
        } catch (err) {
            console.error(err);
            setError("Could not fetch weather for that city.");
        } finally {
            setLoading(false);
        }
        
    };

    // initial fetch
    useEffect(() => {
        fetchWeather(city);
    }, []);

    const handleSearch = () => {
        fetchWeather(query);
    };

    const renderForecastToday = () => {
        const hours = data?.days?.[0]?.hours || [];

        // Filter all hours for today until 11 PM (23:00)
        const todayHours = hours.filter(h => {
            const hour = new Date(h.datetimeEpoch * 1000).getHours();
            return hour <= 23;  // show up to 11 PM
        });

        return (
            <div className="row g-2">
                {todayHours.map((h, i) => (
                    <div key={i} className="col-4 col-sm-3 col-md-2">
                        <div className="forecast-card h-100">
                            <div className="forecast-time">
                                {toLocalTime(h.datetimeEpoch, { minute: undefined })}
                            </div>
                            <img src={ICON_MAP[h.icon] || ICON_MAP.default} alt="" />
                            <div className="forecast-temp mt-1">
                                {convertTemp(h.temp)}°{unit}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderForecastWeek = () => {
        const days = (data?.days || []).slice(0, 7);

        return (
            <div className="row g-2">
                {days.map((d, i) => (
                    <div key={i} className="col-6 col-sm-4 col-md-3 col-lg-2">
                        <div className="forecast-card h-100">
                            <div className="forecast-time">
                                {dayLabelFromEpoch(d.datetimeEpoch)}
                            </div>
                            <img src={ICON_MAP[d.icon] || ICON_MAP.default} alt="" />
                            <div className="small text-muted mt-1">{d.conditions}</div>
                            <div className="forecast-temp mt-1">
                                {convertTemp(d.temp)}°{unit}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const current = data?.currentConditions;
    const today = data?.days?.[0];

    return (
        <div className="d-flex align-items-center justify-content-center min-vh-100 p-3">
            <div className="app-shell mx-auto">
                <div className="row g-0 h-100">
                    {/* LEFT PANE */}
                    <div className="col-lg-4 col-md-5 left-pane d-flex flex-column p-3 p-md-4">
                        <div>
                            {/* search */}
                            <div className="input-group mb-3">
                                <input
                                    className="form-control search-input"
                                    placeholder="Search city..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                />
                                <button
                                    className="btn btn-primary search-btn"
                                    onClick={handleSearch}
                                >
                                    Go
                                </button>
                            </div>

                            {/* main icon */}
                            <div className="d-flex justify-content-center mb-3">
                                <img
                                    src={ICON_MAP[currentIcon] || ICON_MAP.default}
                                    className="weather-icon-main img-fluid"
                                    alt="Weather"
                                />
                            </div>

                            {/* temperature & date */}
                            <div className="temp-display mb-1">
                                {current ? convertTemp(current.temp) : "--"}
                                <span>°{unit}</span>
                            </div>
                            <div className="small-label mb-3">
                                {current
                                    ? toLocalDateTime(
                                        current.datetimeEpoch || today?.datetimeEpoch
                                    )
                                    : "Loading..."}
                            </div>

                            {/* conditions */}
                            <div className="small-label">
                                <div>{current?.conditions || "--"}</div>
                                <div>
                                    Perc:{" "}
                                    {current?.precipprob != null
                                        ? Math.round(current.precipprob) + "%"
                                        : "--"}
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto small-label pt-3">
                            Location: {city || "--"}
                        </div>
                    </div>

                    {/* RIGHT PANE */}
                    <div className="col-lg-8 col-md-7 right-pane d-flex flex-column p-3 p-md-4">
                        {/* header */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <button
                                    className={`tab-btn me-3 ${tab === "today" ? "active" : ""
                                        }`}
                                    onClick={() => setTab("today")}
                                >
                                    Today
                                </button>
                                <button
                                    className={`tab-btn ${tab === "week" ? "active" : ""
                                        }`}
                                    onClick={() => setTab("week")}
                                >
                                    Week
                                </button>
                            </div>
                            <div className="unit-toggle d-inline-flex">
                                <button
                                    className={unit === "C" ? "active" : ""}
                                    onClick={() => setUnit("C")}
                                >
                                    °C
                                </button>
                                <button
                                    className={unit === "F" ? "active" : ""}
                                    onClick={() => setUnit("F")}
                                >
                                    °F
                                </button>
                            </div>
                        </div>

                        {/* forecast */}
                        <div className="mb-3 flex-grow-0">
                            {loading && (
                                <div className="text-center small text-muted py-3">
                                    Loading...
                                </div>
                            )}
                            {error && !loading && (
                                <div className="alert alert-danger py-2 small mb-2">
                                    {error}
                                </div>
                            )}
                            {!loading && !error && data && (
                                <>
                                    {tab === "today" ? renderForecastToday() : renderForecastWeek()}
                                </>
                            )}
                        </div>

                        {/* highlights */}
                        <div className="mt-2">
                            <h6 className="fw-semibold mb-2">Today's Highlights</h6>
                            <div className="row g-2">
                                {/* UV */}
                                <div className="col-md-4">
                                    <div className="highlight-card">
                                        <div className="highlight-title">UV Index</div>
                                        <div className="highlight-main">
                                            {today?.uvindex ?? "--"}
                                        </div>
                                        <div className="text-muted small">
                                            {uvDescription(today?.uvindex)}
                                        </div>
                                    </div>
                                </div>

                                {/* Wind */}
                                <div className="col-md-4">
                                    <div className="highlight-card">
                                        <div className="highlight-title">Wind Status</div>
                                        <div className="highlight-main">
                                            {current?.windspeed != null
                                                ? current.windspeed.toFixed(1)
                                                : "--"}{" "}
                                            <span className="fs-6">km/h</span>
                                        </div>
                                        <div className="text-muted small">
                                            Average wind today
                                        </div>
                                    </div>
                                </div>

                                {/* Sunrise / Sunset */}
                                <div className="col-md-4">
                                    <div className="highlight-card">
                                        <div className="highlight-title">Sunrise &amp; Sunset</div>
                                        <div className="highlight-main">
                                            {today?.sunriseEpoch
                                                ? toLocalTime(today.sunriseEpoch)
                                                : "--"}
                                        </div>
                                        <div className="text-muted small">
                                            {today?.sunsetEpoch
                                                ? toLocalTime(today.sunsetEpoch)
                                                : "--"}
                                        </div>
                                    </div>
                                </div>

                                {/* Humidity */}
                                <div className="col-md-4">
                                    <div className="highlight-card">
                                        <div className="highlight-title">Humidity</div>
                                        <div className="highlight-main">
                                            {current?.humidity != null
                                                ? Math.round(current.humidity) + "%"
                                                : "--"}
                                        </div>
                                        <div className="text-muted small">
                                            Relative humidity
                                        </div>
                                    </div>
                                </div>

                                {/* Visibility */}
                                <div className="col-md-4">
                                    <div className="highlight-card">
                                        <div className="highlight-title">Visibility</div>
                                        <div className="highlight-main">
                                            {today?.visibility != null
                                                ? today.visibility.toFixed(1)
                                                : "--"}
                                        </div>
                                        <div className="text-muted small">
                                            Km, very clear air
                                        </div>
                                    </div>
                                </div>

                                {/* Air Quality – placeholder */}
                                <div className="col-md-4">
                                    <div className="highlight-card">
                                        <div className="highlight-title">Air Quality</div>
                                        <div className="highlight-main">26.5</div>
                                        <div className="text-muted small">
                                            Placeholder (API has no AQI)
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 text-center small text-muted footer-text">
                            Weather Prediction App by{" "}
                            <a href="#!">Trupthi</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;