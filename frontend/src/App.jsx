import React, { useEffect, useState } from "react";

// Можно переопределить через VITE_API_URL при деплое на Vercel + Render
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const QUICK_MODELS = ["iPhone 15", "Samsung Galaxy S24", "Xiaomi 14", "Poco X6 Pro", "iPhone 15 Pro"];

const SCORE_LABELS = [
  { key: "cpu", label: "Процессор" },
  { key: "ram", label: "Оперативная память (RAM)" },
  { key: "storage", label: "Встроенная память" },
  { key: "camera", label: "Камера" },
  { key: "battery", label: "Батарея" },
];

// Форматирование цены в российских рублях (₽)
const formatPrice = (value) =>
  new Intl.NumberFormat("ru-RU").format(Math.round(value)) + " ₽";

function PriceCalculator({ phoneA, phoneB }) {
  const [qtyA, setQtyA] = useState(1);
  const [qtyB, setQtyB] = useState(1);

  const sumA = (phoneA?.price?.min || 0) * qtyA;
  const sumB = (phoneB?.price?.min || 0) * qtyB;
  const total = sumA + sumB;

  const renderRow = (phone, qty, setQty, subtotal) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
      <div>
        <div className="font-semibold text-slate-800">{phone.name}</div>
        <div className="text-sm text-slate-500">
          Мин. цена:{" "}
          <span className="font-medium text-emerald-700">{formatPrice(phone.price.min)}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(0, q - 1))}
            className="px-3 py-1.5 text-slate-700 hover:bg-slate-100 font-bold"
          >
            −
          </button>
          <input
            type="number"
            min="0"
            value={qty}
            onChange={(e) => setQty(Math.max(0, parseInt(e.target.value || "0", 10)))}
            className="w-14 text-center py-1.5 text-sm font-semibold focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            className="px-3 py-1.5 text-slate-700 hover:bg-slate-100 font-bold"
          >
            +
          </button>
        </div>

        <div className="min-w-[130px] text-right font-bold text-slate-900">
          {formatPrice(subtotal)}
        </div>
      </div>
    </div>
  );

  return (
    <section className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-slate-900">Калькулятор минимального бюджета</h3>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
          В рублях (₽) по мин. ценам
        </span>
      </div>

      <div className="space-y-3">
        {renderRow(phoneA, qtyA, setQtyA, sumA)}
        {renderRow(phoneB, qtyB, setQtyB, sumB)}
      </div>

      <div className="mt-5 pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span className="text-slate-600 font-medium">Итоговая сумма заказа ({qtyA + qtyB} шт.):</span>
        <span className="text-2xl font-extrabold text-indigo-600">{formatPrice(total)}</span>
      </div>
    </section>
  );
}

function ComparisonCard({ phone, opponent, onRemove }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start gap-2 mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
            Общий балл: {phone.scores.overall}%
          </span>
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-rose-600 hover:text-rose-800 font-medium"
          >
            Убрать
          </button>
        </div>

        <div className="flex flex-col items-center text-center mb-6">
          {!imgError ? (
            <img
              src={phone.image}
              alt={phone.name}
              onError={() => setImgError(true)}
              className="h-44 object-contain mb-4 rounded-lg"
            />
          ) : (
            <div className="h-44 w-32 mb-4 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-400 p-2">
              {phone.name}
            </div>
          )}

          <h3 className="text-xl font-bold text-slate-900">{phone.name}</h3>
          <div className="mt-2 inline-flex items-center gap-2 text-sm bg-slate-100 px-3 py-1.5 rounded-lg">
            <span className="text-slate-500">Цена:</span>
            <span className="font-bold text-emerald-700">{formatPrice(phone.price.min)}</span>
            <span className="text-slate-400">—</span>
            <span className="font-semibold text-slate-700">{formatPrice(phone.price.max)}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Источники: {phone.price.sources.join(", ")} ({phone.data_mode})
          </p>
        </div>

        <div className="space-y-3.5">
          {SCORE_LABELS.map(({ key, label }) => {
            const val = phone.scores[key];
            const oppVal = opponent?.scores[key] ?? 0;
            const isLeader = val > oppVal;

            return (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 font-medium">{label}</span>
                  <span className={`font-bold ${isLeader ? "text-indigo-600" : "text-slate-800"}`}>
                    {val}% {isLeader && "★"}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isLeader ? "bg-indigo-600" : "bg-slate-400"
                    }`}
                    style={{ width: `${val}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
        {Object.entries(phone.specs_summary).map(([k, v]) => (
          <div key={k} className="truncate" title={v}>
            <span className="font-semibold text-slate-700">{k}:</span> {v}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [loadedPhones, setLoadedPhones] = useState([]);
  const [selectedNames, setSelectedNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Подбор Angels — Подбор и сравнение смартфонов";
    const init = async () => {
      await fetchAndAddPhone("iPhone 15", true);
      await fetchAndAddPhone("Samsung Galaxy S24", true);
    };
    init();
  }, []);

  const fetchAndAddPhone = async (modelName, autoSelect = true) => {
    const trimmed = modelName.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/phone?model=${encodeURIComponent(trimmed)}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Не удалось получить данные о модели");
      }
      const phone = await res.json();

      setLoadedPhones((prev) => (prev.some((p) => p.name === phone.name) ? prev : [phone, ...prev]));
      if (autoSelect) {
        setSelectedNames((prev) => {
          if (prev.includes(phone.name)) return prev;
          if (prev.length >= 2) return [prev[1], phone.name];
          return [...prev, phone.name];
        });
      }
      setQuery("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (name) => {
    setSelectedNames((prev) => {
      if (prev.includes(name)) return prev.filter((item) => item !== name);
      if (prev.length >= 2) {
        setError("Можно выбрать ровно две модели. Снимите выбор с одной из текущих.");
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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg">
              A
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">Подбор Angels</span>
          </div>
          <div className="text-sm text-slate-500">
            Выбрано моделей для сравнения:{" "}
            <span className={`font-bold ${selectedPhones.length === 2 ? "text-emerald-600" : "text-amber-600"}`}>
              {selectedPhones.length} / 2
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchAndAddPhone(query, true);
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Введите модель (например: Xiaomi 14, iPhone 15 Pro)..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold rounded-xl transition"
            >
              {loading ? "Поиск..." : "Найти и добавить"}
            </button>
          </form>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400">Популярные:</span>
            {QUICK_MODELS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => fetchAndAddPhone(m, true)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 transition"
              >
                + {m}
              </button>
            ))}
          </div>

          {loadedPhones.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
              {loadedPhones.map((p) => {
                const active = selectedNames.includes(p.name);
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => toggleSelect(p.name)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                      active
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-slate-700 border-slate-300 hover:border-indigo-400"
                    }`}
                  >
                    {active ? "✓ " : ""}
                    {p.name}
                  </button>
                );
              })}
            </div>
          )}

          {error && (
            <div className="mt-3 p-3 rounded-xl bg-rose-50 text-rose-700 text-sm border border-rose-200">
              {error}
            </div>
          )}
        </section>

        {selectedPhones.length === 2 ? (
          <>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-6 text-center">
              Подбор Angels — Сравнение моделей
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
            <h2 className="text-xl font-bold text-slate-700">
              Выберите ровно 2 модели для сравнения в «Подбор Angels»
            </h2>
            <p className="text-slate-500 mt-1 text-sm">
              Воспользуйтесь поиском выше или кликните по загруженным моделям.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
