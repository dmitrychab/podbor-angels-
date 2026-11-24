import asyncio
import os
import re
import statistics
from typing import Any, Dict, List, Optional

import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Подбор Angels API (RUB)", version="1.1.0")

# Разрешаем CORS-запросы от фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SPECS_API_URL = os.getenv("SPECS_API_URL", "https://phone-specs-api.azharimm.dev")

HTTP_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0.0.0 Safari/537.36",
    "Accept": "application/json",
}

# Отсеиваем аксессуары, чехлы и запчасти при парсинге цен
STOP_WORDS = (
    "чехол", "стекло", "пленка", "плёнка", "зарядка", "кабель",
    "коробка", "на запчасти", "разбит", "корпус", "ремешок", "держатель",
)


class HardwareScores(BaseModel):
    cpu: int
    ram: int
    storage: int
    camera: int
    battery: int
    overall: int


class PriceRange(BaseModel):
    min: float
    max: float
    currency: str = "RUB"
    offers_count: int
    sources: List[str]


class PhoneResponse(BaseModel):
    name: str
    image: str
    specs_summary: Dict[str, str]
    scores: HardwareScores
    price: PriceRange
    data_mode: str


# Резервная база в рублях на случай блокировки внешних площадок
FALLBACK_DB: Dict[str, Dict[str, Any]] = {
    "iphone 15": {
        "name": "Apple iPhone 15",
        "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15.jpg",
        "chipset": "Apple A16 Bionic (4 nm)",
        "memory": "128GB 6GB RAM, 256GB 6GB RAM, 512GB 6GB RAM",
        "camera": "48 MP, f/1.6, 26mm (wide), OIS + 12 MP ultrawide",
        "battery": "Li-Ion 3349 mAh",
        "prices": [61990, 68500, 78990],
    },
    "iphone 15 pro": {
        "name": "Apple iPhone 15 Pro",
        "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro.jpg",
        "chipset": "Apple A17 Pro (3 nm)",
        "memory": "128GB 8GB RAM, 256GB 8GB RAM, 512GB 8GB RAM, 1TB 8GB RAM",
        "camera": "48 MP, f/1.8, OIS + 12 MP 3x telephoto + 12 MP ultrawide",
        "battery": "Li-Ion 3274 mAh",
        "prices": [88900, 99500, 115000],
    },
    "samsung galaxy s24": {
        "name": "Samsung Galaxy S24",
        "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-5g-sm-s921.jpg",
        "chipset": "Exynos 2400 / Snapdragon 8 Gen 3",
        "memory": "128GB 8GB RAM, 256GB 8GB RAM, 512GB 12GB RAM",
        "camera": "50 MP, f/1.8 (wide), OIS + 10 MP telephoto + 12 MP ultrawide",
        "battery": "Li-Ion 4000 mAh",
        "prices": [54990, 63900, 73990],
    },
    "xiaomi 14": {
        "name": "Xiaomi 14",
        "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14-new.jpg",
        "chipset": "Qualcomm Snapdragon 8 Gen 3 (4 nm)",
        "memory": "256GB 12GB RAM, 512GB 16GB RAM",
        "camera": "50 MP, f/1.6, OIS, Leica + 50 MP telephoto + 50 MP ultrawide",
        "battery": "Li-Po 4610 mAh",
        "prices": [57900, 64900, 75900],
    },
    "poco x6 pro": {
        "name": "Xiaomi Poco X6 Pro",
        "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x6-pro.jpg",
        "chipset": "Mediatek Dimensity 8300 Ultra (4 nm)",
        "memory": "256GB 8GB RAM, 512GB 12GB RAM",
        "camera": "64 MP, f/1.7, OIS + 8 MP ultrawide + 2 MP macro",
        "battery": "5000 mAh",
        "prices": [26990, 29990, 34500],
    },
}


def calculate_scores(chipset: str, memory: str, camera: str, battery: str) -> HardwareScores:
    """Рассчитывает баллы внутренних компонентов (0–100%)."""
    chip_lower = chipset.lower()
    if any(k in chip_lower for k in ("8 elite", "8 gen 3", "a18", "a17", "dimensity 9300", "dimensity 9400", "exynos 2400")):
        cpu_score = 95
    elif any(k in chip_lower for k in ("8 gen 2", "a16", "8300", "8s gen 3", "tensor g4")):
        cpu_score = 86
    elif any(k in chip_lower for k in ("7+ gen", "7 gen 3", "a15", "dimensity 8200", "exynos 1480")):
        cpu_score = 75
    else:
        cpu_score = 62

    ram_matches = [int(x) for x in re.findall(r"(\d+)\s*GB\s*RAM", memory, re.IGNORECASE)]
    max_ram = max(ram_matches) if ram_matches else 6
    ram_score = min(100, max(40, int((max_ram / 16) * 100) + 15))

    storage_gb = 128
    if "1tb" in memory.lower():
        storage_gb = 1024
    else:
        gb_matches = [int(x) for x in re.findall(r"(\d+)\s*GB(?!\s*RAM)", memory, re.IGNORECASE)]
        if gb_matches:
            storage_gb = max(gb_matches)
    storage_map = {64: 50, 128: 68, 256: 82, 512: 93, 1024: 100}
    storage_score = storage_map.get(storage_gb, min(100, int((storage_gb / 512) * 90)))

    mp_matches = [int(x) for x in re.findall(r"(\d+)\s*MP", camera, re.IGNORECASE)]
    main_mp = max(mp_matches) if mp_matches else 12
    cam_score = 65
    if main_mp >= 48:
        cam_score += 12
    if main_mp >= 108:
        cam_score += 8
    if "ois" in camera.lower():
        cam_score += 8
    if "telephoto" in camera.lower() or "periscope" in camera.lower():
        cam_score += 7
    camera_score = min(100, cam_score)

    bat_matches = [int(x) for x in re.findall(r"(\d{4})\s*mAh", battery, re.IGNORECASE)]
    mah = max(bat_matches) if bat_matches else 4000
    battery_score = min(100, max(45, int((mah / 5700) * 100)))

    overall = round((cpu_score + ram_score + storage_score + camera_score + battery_score) / 5)
    return HardwareScores(
        cpu=cpu_score,
        ram=ram_score,
        storage=storage_score,
        camera=camera_score,
        battery=battery_score,
        overall=overall,
    )


async def fetch_specs_from_api(client: httpx.AsyncClient, query: str) -> Optional[Dict[str, str]]:
    """Получает характеристики устройства из mobile-specs-api."""
    try:
        search_resp = await client.get(f"{SPECS_API_URL}/search", params={"query": query}, timeout=6.0)
        phones = search_resp.json().get("data", {}).get("phones", [])
        if not phones:
            return None

        slug = phones[0]["slug"]
        detail_resp = await client.get(f"{SPECS_API_URL}/{slug}", timeout=6.0)
        detail = detail_resp.json().get("data", {})

        specs_flat = {"chipset": "", "memory": "", "camera": "", "battery": ""}
        for group in detail.get("specifications", []):
            for spec in group.get("specs", []):
                key = spec.get("key", "").lower()
                val = ", ".join(spec.get("val", []))
                if "chipset" in key:
                    specs_flat["chipset"] = val
                elif "internal" in key:
                    specs_flat["memory"] = val
                elif "triple" in key or "dual" in key or "single" in key or "quad" in key:
                    if group.get("title", "").lower() == "main camera":
                        specs_flat["camera"] = val
                elif "type" in key and group.get("title", "").lower() == "battery":
                    specs_flat["battery"] = val

        return {
            "name": f"{detail.get('brand', '')} {detail.get('phone_name', query)}".strip(),
            "image": detail.get("thumbnail") or phones[0].get("image", ""),
            **specs_flat,
        }
    except Exception:
        return None


async def fetch_prices_wildberries_ru(client: httpx.AsyncClient, query: str) -> List[float]:
    """Запрашивает цены в российских рублях (curr=rub) через API Wildberries."""
    prices: List[float] = []
    try:
        url = "https://search.wb.ru/exactmatch/ru/common/v18/search"
        params = {
            "appType": 1,
            "curr": "rub",
            "dest": -1257786,
            "lang": "ru",
            "page": 1,
            "query": f"смартфон {query}",
            "resultset": "catalog",
            "sort": "popular",
            "spp": 30,
        }
        resp = await client.get(url, params=params, headers=HTTP_HEADERS, timeout=6.0)
        if resp.status_code != 200:
            return prices

        data = resp.json()
        products = data.get("products") or data.get("data", {}).get("products", [])
        for p in products[:25]:
            title = str(p.get("name", "")).lower()
            if any(bad in title for bad in STOP_WORDS):
                continue

            price_kopecks = None
            sizes = p.get("sizes") or []
            if sizes and isinstance(sizes[0], dict):
                price_kopecks = sizes[0].get("price", {}).get("product") or sizes[0].get("price", {}).get("basic")
            if not price_kopecks:
                price_kopecks = p.get("salePriceU")

            if isinstance(price_kopecks, (int, float)):
                rub = round(price_kopecks / 100)
                if rub >= 8000:
                    prices.append(float(rub))
    except Exception:
        pass
    return prices


async def fetch_cbr_usd_rate(client: httpx.AsyncClient) -> float:
    """Получает курс USD -> RUB от ЦБ РФ."""
    try:
        resp = await client.get("https://www.cbr-xml-daily.ru/daily_json.js", timeout=4.0)
        if resp.status_code == 200:
            return float(resp.json()["Valute"]["USD"]["Value"])
    except Exception:
        pass
    return 95.0


def filter_price_outliers(prices: List[float]) -> List[float]:
    """Отсекает ценовые выбросы относительно медианы."""
    if len(prices) < 3:
        return prices
    med = statistics.median(prices)
    cleaned = [p for p in prices if 0.45 * med <= p <= 2.0 * med]
    return cleaned if cleaned else prices


@app.get("/api/phone", response_model=PhoneResponse)
async def get_phone_info(model: str = Query(..., min_length=2, description="Название модели смартфона")):
    """Принимает название модели и возвращает характеристики + мин/макс цену в рублях."""
    async with httpx.AsyncClient() as client:
        specs_data, wb_prices, usd_rate = await asyncio.gather(
            fetch_specs_from_api(client, model),
            fetch_prices_wildberries_ru(client, model),
            fetch_cbr_usd_rate(client),
        )

    data_mode = "live"
    all_prices: List[float] = []
    sources: List[str] = []

    if wb_prices:
        all_prices.extend(wb_prices)
        sources.append("Wildberries (РФ)")

    fallback_key = next((k for k in FALLBACK_DB if k in model.lower() or model.lower() in k), None)

    if not specs_data:
        if not fallback_key:
            raise HTTPException(
                status_code=404,
                detail=f"Модель «{model}» не найдена. Попробуйте: iPhone 15, iPhone 15 Pro, Samsung Galaxy S24, Xiaomi 14, Poco X6 Pro.",
            )
        fb = FALLBACK_DB[fallback_key]
        specs_data = {
            "name": fb["name"],
            "image": fb["image"],
            "chipset": fb["chipset"],
            "memory": fb["memory"],
            "camera": fb["camera"],
            "battery": fb["battery"],
        }
        data_mode = "fallback"

    if not all_prices:
        if fallback_key:
            all_prices = FALLBACK_DB[fallback_key]["prices"]
            sources = ["База цен РФ (Fallback)"]
            data_mode = "fallback"
        else:
            all_prices = [round(450 * usd_rate, -2), round(650 * usd_rate, -2)]
            sources = ["Оценка рынка (ЦБ РФ)"]
            data_mode = "partial"

    clean_prices = filter_price_outliers(all_prices)
    scores = calculate_scores(
        specs_data.get("chipset", ""),
        specs_data.get("memory", ""),
        specs_data.get("camera", ""),
        specs_data.get("battery", ""),
    )

    return PhoneResponse(
        name=specs_data["name"],
        image=specs_data["image"],
        specs_summary={
            "Процессор": specs_data.get("chipset") or "Нет данных",
            "Память": specs_data.get("memory") or "Нет данных",
            "Камера": specs_data.get("camera") or "Нет данных",
            "Батарея": specs_data.get("battery") or "Нет данных",
        },
        scores=scores,
        price=PriceRange(
            min=min(clean_prices),
            max=max(clean_prices),
            currency="RUB",
            offers_count=len(clean_prices),
            sources=sources,
        ),
        data_mode=data_mode,
    )
