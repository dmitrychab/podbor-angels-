Подбор Angels

Веб-приложение (MVP) для подбора, сравнения двух смартфонов и расчёта минимального бюджета в рублях (₽).

Возможности
Поиск характеристик (mobile-specs-api) и цен в РФ (Wildberries + курс ЦБ РФ).
Оценка внутренних компонентов (процессор, RAM, память, камера, батарея) в процентах.
Сравнение ровно 2 моделей в двух колонках (адаптивно под мобильные устройства).
Встроенный калькулятор стоимости по минимальным ценам.

Быстрый старт

1. Бэкенд (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
