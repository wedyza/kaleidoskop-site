
# API для гибридной рекомендательной системы

import asyncio
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import pandas as pd
from contextlib import asynccontextmanager
from .hybrid_model import HybridRecommendationSystem
from uuid import UUID
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent  # AI_Feature
INDEX_DIR = BASE_DIR / "indexes"

# Глобальная переменная для модели
hybrid_recommender = None

class ProductData(BaseModel):
    id: UUID
    title: str

class InteractionData(BaseModel):
    user_id: UUID
    item_id: UUID
    rating: float

class RecommendationContentRequest(BaseModel):
    product_id: UUID
    n_recommendations: int = 10

class HybridRecommendationRequest(BaseModel):
    user_id: Optional[UUID] = None
    product_id: Optional[UUID] = None
    n_recommendations: int = 10

class RecommendationResponse(BaseModel):
    product_id: UUID
    name: str
    rank: int
    total_score: float
    content_score: float
    collaborative_score: float
    methods: List[str]

async def startup_event():
    """Функция инициализации при запуске"""
    global hybrid_recommender
    print('Инициализация')
    try:
        print("Инициализация гибридной рекомендательной системы...")
        hybrid_recommender = HybridRecommendationSystem()

        # Попытка загрузить существующую модель
        try:
            hybrid_recommender.load_model(f'{INDEX_DIR}/hybrid_recommendation_model.pkl')
            print("Модель загружена из файла!")
        except:
            print("Модель не найдена - требуется обучение")

    except Exception as e:
        print(f"Ошибка при инициализации: {e}")
    
    await asyncio.sleep(0)

async def shutdown_event():
    """Функция очистки при выключении"""
    global hybrid_recommender
    print("Выключение API, сохраняем модель...")
    hybrid_recommender.save_model('hybrid_recommendation_model.pkl')

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Контекстный менеджер для управления жизненным циклом"""
    await startup_event()
    try:
        yield
    finally:
        await shutdown_event()

app = FastAPI(
    title="Hybrid Recommendation API",
    version="1.0.0",
    lifespan=lifespan
)

@app.post("/train/content")
async def train_content_model(products: List[ProductData]):
    """Обучение content-based части"""
    global hybrid_recommender
    if hybrid_recommender is None:
        raise HTTPException(status_code=503, detail="Система не инициализирована")

    try:
        products_df = pd.DataFrame([product.dict() for product in products])
        hybrid_recommender.fit_content_based(products_df)
        return {"message": f"Content-based модель обучена на {len(products)} товарах"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train/collaborative")
async def train_collaborative_model(interactions: List[InteractionData]):
    """Обучение collaborative filtering части"""
    global hybrid_recommender
    if hybrid_recommender is None:
        raise HTTPException(status_code=503, detail="Система не инициализирована")

    try:
        interactions_df = pd.DataFrame([interaction.dict() for interaction in interactions])
        hybrid_recommender.fit_collaborative(interactions_df)
        return {"message": f"Collaborative модель обучена на {len(interactions)} взаимодействиях"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recommendations/hybrid", response_model=List[RecommendationResponse])
async def get_hybrid_recommendations(request: HybridRecommendationRequest):
    """Получение гибридных рекомендаций"""
    global hybrid_recommender
    if hybrid_recommender is None:
        raise HTTPException(status_code=503, detail="Система не инициализирована")

    try:
        recommendations = hybrid_recommender.get_hybrid_recommendations(
            user_id=request.user_id,
            product_id=request.product_id,
            n_recommendations=request.n_recommendations
        )
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recommendations/content")
async def get_content_recommendations(request: RecommendationContentRequest):
    """Получение только content-based рекомендаций"""
    global hybrid_recommender
    if hybrid_recommender is None:
        raise HTTPException(status_code=503, detail="Система не инициализирована")

    try:
        recommendations = hybrid_recommender.get_content_recommendations(
            product_id=request.product_id,
            n_recommendations=request.n_recommendations
        )
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recommendations/collaborative")
async def get_collaborative_recommendations(user_id: int, n_recommendations: int = 10):
    """Получение только collaborative рекомендаций"""
    global hybrid_recommender
    if hybrid_recommender is None:
        raise HTTPException(status_code=503, detail="Система не инициализирована")

    try:
        recommendations = hybrid_recommender.get_collaborative_recommendations(
            user_id=user_id,
            n_recommendations=n_recommendations
        )
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Проверка состояния API"""
    return {
        "status": "healthy",
        "system_loaded": hybrid_recommender is not None
    }

@app.post("/save")
async def save_model():
    """Сохранение модели"""
    global hybrid_recommender
    if hybrid_recommender is None:
        raise HTTPException(status_code=503, detail="Система не инициализирована")

    try:
        hybrid_recommender.save_model('hybrid_recommendation_model.pkl')
        return {"message": "Модель сохранена успешно"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
