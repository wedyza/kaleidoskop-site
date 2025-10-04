from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from model import ProductRecommendationSystem
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel
import pandas as pd
import json
import redis


app = FastAPI()
r = redis.StrictRedis(
    host='localhost',
    port=6379,
    decode_responses=True
)


app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Глобальная переменная для модели
recommender = None

class RecommendationRequest(BaseModel):
    product_id: UUID
    n_recommendations: int = 10

class RecommendationResponse(BaseModel):
    product_id: UUID
    title: str
    similarity_score: float
    rank: int

class ProductData(BaseModel):
    id: UUID
    title: str

@app.on_event("startup")
async def load_model():
    """
    Загрузка модели при запуске API
    """
    global recommender
    try:
        recommender = ProductRecommendationSystem(model_type='sentence_bert')
        # В реальности здесь загрузка из файла или БД
        # recommender.load_model('recommendation_model.pkl')
        recommender.load_model('recommendation_model.pkl')
        print("Модель загружена успешно")
    except Exception as e:
        print(f"Ошибка загрузки модели: {e}")


@app.post("/train", summary="Обучение модели")
def train_model(products: List[ProductData]):
    """
    Обучение рекомендательной модели
    """
    global recommender
    # try:
    # Конвертация в DataFrame
    products_df = pd.DataFrame([product.dict() for product in products])

    # Обучение модели
    recommender.fit(products_df)

    recommender.save_model('recommendation_model.pkl')
    return {"message": f"Модель обучена на {len(products)} товарах"}
    # except Exception as e:
    #     raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/recommendations", response_model=List[RecommendationResponse], 
         summary="Получение рекомендаций")
async def get_recommendations(request: RecommendationRequest):
    """
    Получение рекомендаций для товара
    """
    global recommender
    if recommender is None:
        raise HTTPException(status_code=503, detail="Модель не загружена")

    #проверка на кэш
    try:
        cache = r.get

    try:
        recommendations = recommender.get_recommendations(
            product_id=request.product_id,
            n_recommendations=request.n_recommendations
        )
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health", summary="Проверка работоспособности")
async def health_check():
    """
    Проверка состояния API
    """
    return {
        "status": "healthy",
        "model_loaded": recommender is not None,
        "model_type": recommender.model_type if recommender else None
    }

@app.get("/stats", summary="Статистика модели")
async def get_stats():
    """
    Получение статистики модели
    """
    global recommender
    if recommender is None:
        raise HTTPException(status_code=503, detail="Модель не загружена")

    stats = {
        "model_type": recommender.model_type,
        "total_products": len(recommender.products_df) if recommender.products_df is not None else 0,
        "vector_dimensions": recommender.product_vectors.shape[1] if recommender.product_vectors is not None else 0
    }

    return stats