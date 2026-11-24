import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const APP_CSS = `
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: #f1f5f9;
    color: #0f172a;
  }
  .pa-page { min-height: 100vh; padding-bottom: 40px; }
  .pa-header {
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    position: sticky;
    top: 0;
    z-index: 20;
  }
  .pa-header-inner {
    max-width: 1100px;
    margin: 0 auto;
    padding: 14px 16px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .pa-brand { display: flex; align-items: center; gap: 10px; }
  .pa-logo {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: #4f46e5;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 18px;
  }
  .pa-title { font-size: 20px; font-weight: 800; color: #0f172a; }
  .pa-counter { font-size: 14px; color: #64748b; }
  .pa-counter b { color: #059669; }
  .pa-counter b.warn { color: #d97706; }

  .pa-main { max-width: 1100px; margin: 0 auto; padding: 20px 16px; }
  .pa-box {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 18px;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
    margin-bottom: 24px;
  }
  .pa-form { display: flex; flex-wrap: wrap; gap: 10px; }
  .pa-input {
    flex: 1 1 220px;
    padding: 11px 14px;
    border: 1px solid #cbd5e1;
    border-radius: 12px;
    font-size: 16px;
    outline: none;
  }
  .pa-input:focus { border-color: #4f46e5; }
  .pa-btn {
    padding: 11px 20px;
    border: none;
    border-radius: 12px;
    background: #4f46e5;
    color: #ffffff;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
  }
  .pa-btn:disabled { background: #a5b4fc; }

  .pa-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; align-items: center; }
  .pa-chips-label { font-size: 12px; color: #94a3b8; }
  .pa-quick-btn {
    padding: 6px 10px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    color: #334155;
    font-size: 13px;
    cursor: pointer;
  }
  .pa-loaded {
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid #f1f5f9;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .pa-pill {
    padding: 7px 14px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid #cbd5e1;
    background: #ffffff;
    color: #334155;
  }
  .pa-pill.active {
    background: #4f46e5;
    color: #ffffff;
    border-color: #4f46e5;
  }
  .pa-error {
    margin-top: 12px;
    padding: 10px 14px;
    border-radius: 10px;
    background: #fff1f2;
    border: 1px solid #fecdd3;
    color: #be123c;
    font-size: 13px;
  }

  .pa-h1 {
    font-size: 24px;
    font-weight: 800;
    text-align: center;
    margin: 0 0 20px 0;
  }
  .pa-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }
  @media (max-width: 768px) {
    .pa-grid { grid-template-columns: 1fr; }
  }

  .pa-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .pa-card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
  }
  .pa-badge {
    font-size: 12px;
    font-weight: 700;
    padding: 5px 10px;
    border-radius: 999px;
    background: #eef2ff;
    color: #4338ca;
  }
  .pa-remove {
    background: none;
    border: none;
    color: #e11d48;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  }
  .pa-center { text-align: center; margin-bottom: 18px; }
  .pa-img { height: 165px; max-width: 100%; object-fit: contain; margin-bottom: 12px; }
  .pa-img-stub {
    height: 150px;
    width: 110px;
    margin: 0 auto 12px;
    border-radius: 14px;
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    font-size: 12px;
    color: #64748b;
    font-weight: 600;
  }
  .pa-phone-name { font-size: 20px; font-weight: 800; margin: 0 0 8px 0; }
  .pa-price-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #f1f5f9;
    padding: 6px 12px;
    border-radius: 10px;
    font-size: 14px;
  }
  .pa-price-min { font-weight: 800; color: #047857; }
  .pa-price-max { font-weight: 600; color: #334155; }
  .pa-source { font-size: 11px; color: #94a3b8; margin: 6px 0 0; }

  .pa-scores { display: flex; flex-direction: column; gap: 12px; }
  .pa-score-head { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px; }
  .pa-score-label { color: #475569; font-weight: 500; }
  .pa-score-val { font-weight: 700; color: #1e293b; }
  .pa-score-val.win { color: #4f46e5; }
  .pa-bar-bg { height: 10px; background: #f1f5f9; border-radius: 999px; overflow: hidden; }
  .pa-bar-fill { height: 100%; border-radius: 999px; background: #94a3b8; transition: width 0.4s; }
  .pa-bar-fill.win { background: #4f46e5; }

  .pa-specs {
    margin-top: 18px;
    padding-top: 12px;
    border-top: 1px solid #f1f5f9;
    font-size: 12px;
    color: #64748b;
    line-height: 1.5;
  }

  .pa-calc-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 14px;
  }
  .pa-calc-title { font-size: 19px; font-weight: 800; margin: 0; }
  .pa-calc-tag {
    font-size: 12px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 999px;
    background: #d1fae5;
    color: #065f46;
  }
  .pa-calc-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    margin-bottom: 10px;
  }
  .pa-qty-wrap { display: flex; align-items: center; gap: 14px; }
  .pa-qty-box {
    display: flex;
    align-items: center;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    background: #ffffff;
    overflow: hidden;
  }
  .pa-qty-btn {
    width: 34px;
    height: 34px;
    border: none;
    background: #ffffff;
    font-size: 18px;
    font-weight: 700;
    cursor: pointer;
  }
  .pa-qty-input {
    width: 44px;
    text-align: center;
    border: none;
    font-size: 15px;
    font-weight: 700;
    outline: none;
  }
  .pa-subtotal { min-width: 110px; text-align: right; font-weight: 800; font-size: 15px; }
  .pa-total-row {
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid #e2e8f0;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }
  .pa-total-sum { font-size: 24px; font-weight: 900; color: #4f46e5; }
  .pa-empty {
    background: #ffffff;
    border: 2px dashed #cbd5e1;
    border-radius: 16px;
    padding: 48px 16px;
    text-align: center;
  }
`;

const DEMO_PHONES = {
  "iphone 15": {
    name: "Apple iPhone 15",
    image: "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15.jpg",
    specs_summary: {
      Процессор: "Apple A16 Bionic (4 nm)",
      Память: "128/256/512 GB, 6 GB RAM",
      Камера: "48 MP OIS + 12 MP Ultrawide",
      Батарея: "3349 mAh",
    },
    scores: { cpu: 86, ram: 70, storage: 93, camera: 85, battery: 60, overall: 79 },
    price: { min: 61990, max: 78990, currency: "RUB", offers_count: 14, sources: ["РФ Маркет"] },
  },
  "samsung galaxy s24": {
    name: "Samsung Galaxy S24",
    image: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-5g-sm-s921.jpg",
    specs_summary: {
      Процессор: "Exynos 2400 / Snapdragon 8 Gen 3",
      Память: "128/256/512 GB, 8/12 GB RAM",
      Камера: "50 MP OIS + 10 MP Telephoto + 12 MP",
      Батарея: "4000 mAh",
    },
    scores: { cpu: 95, ram: 90, storage: 93, camera: 92, battery: 70, overall: 88 },
    price: { min: 54990, max: 73990, currency: "RUB", offers_count: 18, sources: ["РФ Маркет"] },
  },
  "xiaomi 14": {
    name: "Xiaomi 14",
    image: "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14-new.jpg",
    specs_summary: {
      Процессор: "Qualcomm Snapdragon 8 Gen 3",
      Память: "256/512 GB, 12/16 GB RAM",
      Камера: "50 MP Leica OIS + 50 MP Tele + 50 MP",
      Батарея: "4610 mAh",
    },
    scores: { cpu: 95, ram: 100, storage: 93, camera: 95, battery: 81, overall: 93 },
    price: { min: 57900, max: 75900, currency: "RUB", offers_count: 11, sources: ["РФ Маркет"] },
  },
  "poco x6 pro": {
    name: "Xiaomi Poco X6 Pro",
    image: "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x6-pro.jpg",
    specs_summary: {
      Процессор: "MediaTek Dimensity 8300 Ultra",
      Память: "256/512 GB, 8/12 GB RAM",
      Камера: "64 MP OIS + 8 MP + 2 MP",
      Батарея: "5000 mAh",
    },
    scores: { cpu: 86, ram: 90, storage: 93, camera: 85, battery: 88, overall: 88 },
    price: { min: 26990, max: 34500, currency: "RUB", offers_count: 23, sources: ["РФ Маркет"] },
  },
  "iphone 15 pro": {
    name: "Apple iPhone 15 Pro",
    image: "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro.jpg",
    specs_summary: {
      Процессор: "Apple A17 Pro (3 nm)",
      Память: "128/256/512 GB / 1 TB, 8 GB RAM",
      Камера: "48 MP OIS + 12 MP 3x Telephoto + 12 MP",
      Батарея: "3274 mAh",
    },
    scores: { cpu: 95, ram: 75, storage: 100, camera: 94, battery: 58, overall: 84 },
    price: { min: 88900, max: 115000, currency: "RUB", offers_count: 16, sources: ["РФ Маркет"] },
  },
};

const QUICK_MODELS = ["iPhone 15", "Samsung Galaxy S24", "Xiaomi 14", "Poco X6 Pro", "iPhone 15 Pro"];

const SCORE_LABELS = [
  { key: "cpu", label: "Процессор" },
  { key: "ram", label: "Оперативная память (RAM)" },
  { key: "storage", label: "Встроенная память" },
  { key: "camera", label: "Камера" },
  { key: "battery", label: "Батарея" },
];

const formatPrice = (value) =>
  new Intl.NumberFormat("ru-RU").format(Math.round(value)) + " ₽";

function PriceCalculator({ phoneA, phoneB }) {
  const [qtyA, setQtyA] = useState(1);
  const [qtyB, setQtyB] = useState(1);

  const sumA = (phoneA?.price?.min || 0) * qtyA;
  const sumB = (phoneB?.price?.min || 0) * qtyB;
  const total = sumA + sumB;

  const renderRow = (phone, qty, setQty, subtotal) => (
    <div className="pa-calc-row">
      <div>
        <div style={{ fontWeight: 700 }}>{phone.name}</div>
        <div style={{ fontSize: 13, color: "#64748b" }}>
          Мин. цена: <span className="pa-price-min">{formatPrice(phone.price.min)}</span>
        </div>
      </div>

      <div className="pa-qty-wrap">
        <div className="pa-qty-box">
          <button type="button" className="pa-qty-btn" onClick={() => setQty((q) => Math.max(0, q - 1))}>
            −
          </button>
          <input
            type="number"
            min="0"
            value={qty}
            onChange={(e) => setQty(Math.max(0, parseInt(e.target.value || "0", 10)))}
            className="pa-qty-input"
          />
          <button type="button" className="pa-qty-btn" onClick={() => setQty((q) => q + 1)}>
            +
          </button>
        </div>
        <div className="pa-subtotal">{formatPrice(subtotal)}</div>
      </div>
    </div>
  );

  return (
    <section className="pa-box" style={{ marginTop: 24 }}>
      <div className="pa-calc-head">
        <h3 className="pa-calc-title">Калькулятор минимального бюджета</h3>
        <span className="pa-calc-tag">В рублях (₽) по мин. ценам</span>
      </div>

      {renderRow(phoneA, qtyA, setQtyA, sumA)}
      {renderRow(phoneB, qtyB, setQtyB, sumB)}

      <div className="pa-total-row">
        <span style={{ color: "#475569", fontWeight: 600 }}>
          Итоговая сумма заказа ({qtyA + qtyB} шт.):
        </span>
        <span className="pa-total-sum">{formatPrice(total)}</span>
      </div>
    </section>
  );
}

function ComparisonCard({ phone, opponent, onRemove }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="pa-card">
      <div>
        <div className="pa-card-top">
          <span className="pa-badge">Общий балл: {phone.scores.overall}%</span>
          <button type="button" className="pa-remove" onClick={onRemove}>
            Убрать
          </button>
        </div>

        <div className="pa-center">
          {!imgError ? (
            <img src={phone.image} alt={phone.name} onError={() => setImgError(true)} className="pa-img" />
          ) : (
            <div className="pa-img-stub">{phone.name}</div>
          )}

          <h3 className="pa-phone-name">{phone.name}</h3>
          <div className="pa-price-pill">
            <span style={{ color: "#64748b" }}>Цена:</span>
            <span className="pa-price-min">{formatPrice(phone.price.min)}</span>
            <span style={{ color: "#94a3b8" }}>—</span>
            <span className="pa-price-max">{formatPrice(phone.price.max)}</span>
          </div>
          <p className="pa-source">Источники: {phone.price.sources.join(", ")}</p>
        </div>

        <div className="pa-scores">
          {SCORE_LABELS.map(({ key, label }) => {
            const val = phone.scores[key];
            const oppVal = opponent?.scores[key] ?? 0;
            const isLeader = val > oppVal;

            return (
              <div key={key}>
                <div className="pa-score-head">
                  <span className="pa-score-label">{label}</span>
                  <span className={`pa-score-val ${isLeader ? "win" : ""}`}>
                    {val}% {isLeader && "★"}
                  </span>
                </div>
                <div className="pa-bar-bg">
                  <div className={`pa-bar-fill ${isLeader ? "win" : ""}`} style={{ width: `${val}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pa-specs">
        {Object.entries(phone.specs_summary).map(([k, v]) => (
          <div key={k}>
            <strong style={{ color: "#334155" }}>{k}:</strong> {v}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [loadedPhones, setLoadedPhones] = useState([
    DEMO_PHONES["iphone 15"],
    DEMO_PHONES["samsung galaxy s24"],
  ]);
  const [selectedNames, setSelectedNames] = useState([
    DEMO_PHONES["iphone 15"].name,
    DEMO_PHONES["samsung galaxy s24"].name,
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Подбор Angels — Подбор и сравнение смартфонов";
  }, []);

  const fetchAndAddPhone = async (modelName, autoSelect = true) => {
    const trimmed = modelName.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");

    let phone = null;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1800);
      const res = await fetch(`${API_BASE}/api/phone?model=${encodeURIComponent(trimmed)}`, {
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) phone = await res.json();
    } catch (_) {
      // Работаем автономно без бэкенда
    }

    if (!phone) {
      const key = Object.keys(DEMO_PHONES).find(
        (k) => k.includes(trimmed.toLowerCase()) || trimmed.toLowerCase().includes(k)
      );
      if (!key) {
        setLoading(false);
        setError(`Доступные модели без сервера: ${QUICK_MODELS.join(", ")}.`);
        return;
      }
      phone = DEMO_PHONES[key];
    }

    setLoadedPhones((prev) => (prev.some((p) => p.name === phone.name) ? prev : [phone, ...prev]));
    if (autoSelect) {
      setSelectedNames((prev) => {
        if (prev.includes(phone.name)) return prev;
        if (prev.length >= 2) return [prev[1], phone.name];
        return [...prev, phone.name];
      });
    }
    setQuery("");
    setLoading(false);
  };

  const toggleSelect = (name) => {
    setSelectedNames((prev) => {
      if (prev.includes(name)) return prev.filter((item) => item !== name);
      if (prev.length >= 2) {
        setError("Можно выбрать ровно две модели. Нажмите на уже выбранную, чтобы убрать её.");
        return prev;
      }
      setError("");
      return [...prev, name];
    });
  };

  const selectedPhones = selectedNames
    .map((name) => loadedPhones.find((p) => p.name === name))
    .filter(Boolean);

  return (
    <div className="pa-page">
      <style>{APP_CSS}</style>

      <header className="pa-header">
        <div className="pa-header-inner">
          <div className="pa-brand">
            <div className="pa-logo">A</div>
            <span className="pa-title">Подбор Angels</span>
          </div>
          <div className="pa-counter">
            Выбрано моделей:{" "}
            <b className={selectedPhones.length === 2 ? "" : "warn"}>
              {selectedPhones.length} / 2
            </b>
          </div>
        </div>
      </header>

      <main className="pa-main">
        <section className="pa-box">
          <form
            className="pa-form"
            onSubmit={(e) => {
              e.preventDefault();
              fetchAndAddPhone(query, true);
            }}
          >
            <input
              type="text"
              className="pa-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Введите модель (Xiaomi 14, iPhone 15 Pro)..."
            />
            <button type="submit" disabled={loading} className="pa-btn">
              {loading ? "Поиск..." : "Найти и добавить"}
            </button>
          </form>

          <div className="pa-chips">
            <span className="pa-chips-label">Быстрый выбор:</span>
            {QUICK_MODELS.map((m) => (
              <button
                key={m}
                type="button"
                className="pa-quick-btn"
                onClick={() => fetchAndAddPhone(m, true)}
              >
                + {m}
              </button>
            ))}
          </div>

          {loadedPhones.length > 0 && (
            <div className="pa-loaded">
              {loadedPhones.map((p) => {
                const active = selectedNames.includes(p.name);
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => toggleSelect(p.name)}
                    className={`pa-pill ${active ? "active" : ""}`}
                  >
                    {active ? "✓ " : ""}
                    {p.name}
                  </button>
                );
              })}
            </div>
          )}

          {error && <div className="pa-error">{error}</div>}
        </section>

        {selectedPhones.length === 2 ? (
          <>
            <h1 className="pa-h1">Подбор Angels — Сравнение моделей</h1>

            <div className="pa-grid">
              <ComparisonCard
                phone={selectedPhones[0]}
                opponent={selectedPhones[1]}
                onRemove={() => toggleSelect(selectedPhones[0].name)}
              />
              <ComparisonCard
                phone={selectedPhones[1]}
                opponent={selectedPhones[0]}
                onRemove={() => toggleSelect(selectedPhones[1].name)}
              />
            </div>

            <PriceCalculator phoneA={selectedPhones[0]} phoneB={selectedPhones[1]} />
          </>
        ) : (
          <div className="pa-empty">
            <h2 style={{ margin: "0 0 6px", fontSize: 18 }}>
              Выберите ровно 2 модели для сравнения в «Подбор Angels»
            </h2>
            <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>
              Нажмите на кнопки моделей выше или добавьте через поиск.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
