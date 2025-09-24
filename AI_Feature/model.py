# Content-Based Рекомендательная Система для Интернет-Магазина
# Пример реализации для 30,000 товаров

import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
import faiss
import pickle
import re
from typing import List, Dict, Tuple

class ProductRecommendationSystem:
    """
    Content-based рекомендательная система для товаров
    """

    def __init__(self, model_type='tfidf'):
        """
        Инициализация системы

        Args:
            model_type: 'tfidf', 'sentence_bert', 'word2vec'
        """
        self.model_type = model_type
        self.vectorizer = None
        self.similarity_matrix = None
        self.product_vectors = None
        self.products_df = None
        self.faiss_index = None

        if model_type == 'sentence_bert':
            self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')

    def preprocess_text(self, text: str) -> str:
        """
        Предобработка текста товара
        """
        if pd.isna(text):
            return ""

        # Приведение к нижнему регистру
        text = text.lower()

        # Удаление специальных символов
        text = re.sub(r'[^а-яё\w\s]', ' ', text)

        # Удаление лишних пробелов
        text = re.sub(r'\s+', ' ', text).strip()

        return text

    def prepare_product_features(self, products_df: pd.DataFrame) -> pd.DataFrame:
        """
        Подготовка признаков товаров

        Args:
            products_df: DataFrame с колонками ['id', 'title']
        """
        self.products_df = products_df.copy()

        # Объединяем название и характеристики
        self.products_df['combined_features'] = (
            self.products_df['title'].fillna('')
        )

        # Предобработка текста
        self.products_df['processed_features'] = (
            self.products_df['combined_features']
            .apply(self.preprocess_text)
        )

        return self.products_df

    def fit_tfidf_model(self):
        """
        Обучение TF-IDF модели
        """
        print("Обучение TF-IDF модели...")

        self.vectorizer = TfidfVectorizer(
            max_features=10000,
            ngram_range=(1, 2),
            stop_words='english',  # Можно добавить русские стоп-слова
            max_df=0.8,
            min_df=2
        )

        # Векторизация текстов
        self.product_vectors = self.vectorizer.fit_transform(
            self.products_df['processed_features']
        )

        print(f"Создано {self.product_vectors.shape[1]} признаков")
        print(f"Размер матрицы: {self.product_vectors.shape}")

    def fit_sentence_bert_model(self):
        """
        Обучение Sentence-BERT модели с FAISS индексом
        """
        print("Создание embeddings с Sentence-BERT...")

        # Создание эмбеддингов
        embeddings = self.sentence_model.encode(
            self.products_df['processed_features'].tolist(),
            show_progress_bar=True,
            batch_size=32
        )

        self.product_vectors = embeddings

        # Создание FAISS индекса для быстрого поиска
        dimension = embeddings.shape[1]
        self.faiss_index = faiss.IndexFlatIP(dimension)  # Inner Product

        # Нормализация для косинусного расстояния
        faiss.normalize_L2(embeddings)
        self.faiss_index.add(embeddings.astype('float32'))

        print(f"Создано {dimension} эмбеддингов")
        print(f"FAISS индекс построен для {embeddings.shape[0]} товаров")

    def fit(self, products_df: pd.DataFrame):
        """
        Обучение модели
        """
        self.prepare_product_features(products_df)

        if self.model_type == 'tfidf':
            self.fit_tfidf_model()
        elif self.model_type == 'sentence_bert':
            self.fit_sentence_bert_model()
        else:
            raise ValueError(f"Неподдерживаемый тип модели: {self.model_type}")

    def get_recommendations_tfidf(self, product_id: int, n_recommendations: int = 10) -> List[Dict]:
        """
        Получение рекомендаций с TF-IDF
        """
        # Находим индекс товара
        product_idx = self.products_df[self.products_df['id'] == product_id].index[0]

        # Вычисляем косинусное сходство
        similarities = cosine_similarity(
            self.product_vectors[product_idx], 
            self.product_vectors
        ).flatten()

        # Сортируем по убыванию схожести (исключая сам товар)
        similar_indices = similarities.argsort()[::-1][1:n_recommendations+1]

        recommendations = []
        for idx in similar_indices:
            recommendations.append({
                'product_id': self.products_df.iloc[idx]['id'],
                'title': self.products_df.iloc[idx]['title'],
                'similarity_score': similarities[idx],
                'rank': len(recommendations) + 1
            })

        return recommendations

    def get_recommendations_sentence_bert(self, product_id: int, n_recommendations: int = 10) -> List[Dict]:
        """
        Получение рекомендаций с Sentence-BERT и FAISS
        """
        # Находим индекс товара
        product_idx = self.products_df[self.products_df['id'] == product_id].index[0]

        # Поиск похожих товаров через FAISS
        query_vector = self.product_vectors[product_idx:product_idx+1].astype('float32')
        similarities, indices = self.faiss_index.search(query_vector, n_recommendations + 1)

        # Исключаем сам товар из результатов
        similarities = similarities[0][1:]
        indices = indices[0][1:]

        recommendations = []
        for i, idx in enumerate(indices):
            recommendations.append({
                'product_id': self.products_df.iloc[idx]['id'],
                'title': self.products_df.iloc[idx]['title'],
                'similarity_score': float(similarities[i]),
                'rank': i + 1
            })

        return recommendations

    def get_recommendations(self, product_id: int, n_recommendations: int = 10) -> List[Dict]:
        """
        Универсальный метод получения рекомендаций
        """
        if self.model_type == 'tfidf':
            return self.get_recommendations_tfidf(product_id, n_recommendations)
        elif self.model_type == 'sentence_bert':
            return self.get_recommendations_sentence_bert(product_id, n_recommendations)

    def save_model(self, filepath: str):
        """
        Сохранение модели
        """
        model_data = {
            'model_type': self.model_type,
            'products_df': self.products_df,
            'vectorizer': self.vectorizer,
            'product_vectors': self.product_vectors
        }

        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)

        if self.faiss_index:
            faiss.write_index(self.faiss_index, filepath.replace('.pkl', '_faiss.index'))

    def load_model(self, filepath: str):
        """
        Загрузка модели
        """
        with open(filepath, 'rb') as f:
            model_data = pickle.load(f)

        self.model_type = model_data['model_type']
        self.products_df = model_data['products_df']
        self.vectorizer = model_data['vectorizer']
        self.product_vectors = model_data['product_vectors']

        if self.model_type == 'sentence_bert':
            faiss_path = filepath.replace('.pkl', '_faiss.index')
            self.faiss_index = faiss.read_index(faiss_path)


# Пример использования системы
def example_usage():
    """
    Пример использования рекомендательной системы
    """

    # Создание тестовых данных (в реальности загружается из БД)
    products_data = {
        'id': list(range(1, 1001)),  # 1000 товаров для примера
        'name': [f'Товар {i}' for i in range(1, 1001)],
        'characteristics': [f'Характеристики товара {i}' for i in range(1, 1001)]
    }
    products_df = pd.DataFrame(products_data)

    # Инициализация системы
    recommender = ProductRecommendationSystem(model_type='sentence_bert')

    # Обучение модели
    recommender.fit(products_df)

    # Получение рекомендаций для товара с ID=1
    recommendations = recommender.get_recommendations(product_id=1, n_recommendations=5)

    print("Рекомендации для товара ID=1:")
    for rec in recommendations:
        print(f"Ранг {rec['rank']}: {rec['name']} (схожесть: {rec['similarity_score']:.3f})")

    # Сохранение модели
    recommender.save_model('recommendation_model.pkl')

    return recommender

if __name__ == "__main__":
    recommender = example_usage()