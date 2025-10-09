
# Гибридная рекомендательная система (Content-Based + Collaborative Filtering)

import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import TruncatedSVD
from scipy.sparse import csr_matrix
from sentence_transformers import SentenceTransformer
import faiss
import pickle
import warnings
warnings.filterwarnings('ignore')

class HybridRecommendationSystem:
    """
    Гибридная рекомендательная система объединяющая Content-Based и Collaborative Filtering
    """

    def __init__(self, content_weight=0.4, collaborative_weight=0.6):
        """
        Инициализация гибридной системы

        Args:
            content_weight: Вес content-based рекомендаций (0-1)
            collaborative_weight: Вес collaborative filtering рекомендаций (0-1)
        """
        self.content_weight = content_weight
        self.collaborative_weight = collaborative_weight

        # Content-based компоненты
        self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.product_vectors = None
        self.products_df = None
        self.faiss_index = None

        # Collaborative filtering компоненты
        self.user_item_matrix = None
        self.svd_model = None
        self.user_to_idx = {}
        self.item_to_idx = {}
        self.idx_to_user = {}
        self.idx_to_item = {}

        print(f"Инициализирована гибридная система с весами: Content={content_weight}, Collaborative={collaborative_weight}")

    def preprocess_text(self, text):
        """Предобработка текста товара"""
        if pd.isna(text):
            return ""
        return str(text).lower().strip()

    def fit_content_based(self, products_df):
        """
        Обучение content-based части системы

        Args:
            products_df: DataFrame с колонками ['id', 'title']
        """
        print("Обучение content-based модели...")

        self.products_df = products_df.copy()

        # Объединяем название и характеристики
        self.products_df['combined_features'] = (
            self.products_df['title'].fillna('')
        )

        # Предобработка текста
        self.products_df['processed_features'] = (
            self.products_df['combined_features'].apply(self.preprocess_text)
        )

        # Создание эмбеддингов с помощью Sentence-BERT
        print("Создание эмбеддингов товаров...")
        embeddings = self.sentence_model.encode(
            self.products_df['processed_features'].tolist(),
            show_progress_bar=True,
            batch_size=32
        )

        self.product_vectors = embeddings

        # Создание FAISS индекса для быстрого поиска
        dimension = embeddings.shape[1]
        self.faiss_index = faiss.IndexFlatIP(dimension)  # Inner Product для косинусного расстояния

        # Нормализация для косинусного расстояния
        faiss.normalize_L2(embeddings)
        self.faiss_index.add(embeddings.astype('float32'))

        print(f"Content-based модель обучена на {len(self.products_df)} товарах")

    def fit_collaborative(self, interactions_df):
        """
        Обучение collaborative filtering части системы

        Args:
            interactions_df: DataFrame с колонками ['user_id', 'item_id', 'rating']
        """
        print("Обучение collaborative filtering модели...")

        # Создание индексов пользователей и товаров
        unique_users = interactions_df['user_id'].unique()
        unique_items = interactions_df['item_id'].unique()

        self.user_to_idx = {user: idx for idx, user in enumerate(unique_users)}
        self.item_to_idx = {item: idx for idx, item in enumerate(unique_items)}
        self.idx_to_user = {idx: user for user, idx in self.user_to_idx.items()}
        self.idx_to_item = {idx: item for item, idx in self.item_to_idx.items()}

        # Создание матрицы пользователь-товар
        rows = interactions_df['user_id'].map(self.user_to_idx)
        cols = interactions_df['item_id'].map(self.item_to_idx)
        data = interactions_df['rating']

        self.user_item_matrix = csr_matrix(
            (data, (rows, cols)), 
            shape=(len(unique_users), len(unique_items))
        )

        # Обучение SVD модели для matrix factorization
        print("Обучение SVD модели...")
        self.svd_model = TruncatedSVD(n_components=50, random_state=42)
        self.user_factors = self.svd_model.fit_transform(self.user_item_matrix)
        self.item_factors = self.svd_model.components_.T

        print(f"Collaborative filtering обучен на {len(unique_users)} пользователях и {len(unique_items)} товарах")

    def get_content_recommendations(self, product_id, n_recommendations=10):
        """
        Получение рекомендаций на основе контента

        Args:
            product_id: ID товара для поиска похожих
            n_recommendations: Количество рекомендаций

        Returns:
            List[Dict]: Список рекомендаций с баллами
        """
        if self.products_df is None or self.faiss_index is None:
            return []

        # Находим индекс товара
        product_mask = self.products_df['id'] == product_id
        if not product_mask.any():
            return []

        product_idx = product_mask.idxmax()

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
                'rank': i + 1,
                'method': 'content_based'
            })

        return recommendations

    def get_collaborative_recommendations(self, user_id, n_recommendations=10):
        """
        Получение рекомендаций на основе collaborative filtering

        Args:
            user_id: ID пользователя
            n_recommendations: Количество рекомендаций

        Returns:
            List[Dict]: Список рекомендаций с баллами
        """
        if self.svd_model is None or user_id not in self.user_to_idx:
            return []

        user_idx = self.user_to_idx[user_id]

        # Получаем факторы пользователя
        user_vector = self.user_factors[user_idx]

        # Вычисляем предсказанные рейтинги для всех товаров
        predicted_ratings = np.dot(user_vector, self.item_factors.T)

        # Исключаем товары, с которыми пользователь уже взаимодействовал
        user_items = self.user_item_matrix[user_idx].nonzero()[1]
        predicted_ratings[user_items] = -np.inf

        # Получаем топ рекомендации
        top_items_idx = np.argsort(predicted_ratings)[::-1][:n_recommendations]

        recommendations = []
        for i, item_idx in enumerate(top_items_idx):
            if predicted_ratings[item_idx] > -np.inf:
                item_id = self.idx_to_item[item_idx]
                # Находим название товара в products_df
                product_title = ""
                if self.products_df is not None:
                    product_mask = self.products_df['id'] == item_id
                    if product_mask.any():
                        product_title = self.products_df[product_mask]['title'].iloc[0]

                recommendations.append({
                    'product_id': item_id,
                    'title': product_title,
                    'predicted_rating': float(predicted_ratings[item_idx]),
                    'rank': i + 1,
                    'method': 'collaborative'
                })

        return recommendations

    def get_hybrid_recommendations(self, user_id=None, product_id=None, n_recommendations=10):
        """
        Получение гибридных рекомендаций

        Args:
            user_id: ID пользователя (для collaborative)
            product_id: ID товара (для content-based)
            n_recommendations: Количество рекомендаций

        Returns:
            List[Dict]: Список гибридных рекомендаций
        """
        all_recommendations = {}

        # Получаем content-based рекомендации
        if product_id is not None:
            content_recs = self.get_content_recommendations(product_id, n_recommendations * 2)
            for rec in content_recs:
                item_id = rec['product_id']
                score = rec['similarity_score'] * self.content_weight

                if item_id not in all_recommendations:
                    all_recommendations[item_id] = {
                        'product_id': item_id,
                        'title': rec['title'],
                        'content_score': rec['similarity_score'],
                        'collaborative_score': 0.0,
                        'total_score': 0.0,
                        'methods': []
                    }

                all_recommendations[item_id]['total_score'] += score
                all_recommendations[item_id]['methods'].append('content_based')

        # Получаем collaborative рекомендации
        if user_id is not None:
            collab_recs = self.get_collaborative_recommendations(user_id, n_recommendations * 2)
            for rec in collab_recs:
                item_id = rec['product_id']
                # Нормализуем predicted_rating к диапазону [0, 1]
                normalized_score = max(0, min(1, (rec['predicted_rating'] + 1) / 2))
                score = normalized_score * self.collaborative_weight

                if item_id not in all_recommendations:
                    all_recommendations[item_id] = {
                        'product_id': item_id,
                        'title': rec['title'],
                        'content_score': 0.0,
                        'collaborative_score': rec['predicted_rating'],
                        'total_score': 0.0,
                        'methods': []
                    }

                all_recommendations[item_id]['total_score'] += score
                all_recommendations[item_id]['collaborative_score'] = rec['predicted_rating']
                all_recommendations[item_id]['methods'].append('collaborative')

        # Сортируем по общему баллу
        sorted_recommendations = sorted(
            all_recommendations.values(), 
            key=lambda x: x['total_score'], 
            reverse=True
        )[:n_recommendations]

        # Добавляем ранги
        for i, rec in enumerate(sorted_recommendations):
            rec['rank'] = i + 1

        return sorted_recommendations

    def save_model(self, filepath):
        """Сохранение модели"""
        model_data = {
            'content_weight': self.content_weight,
            'collaborative_weight': self.collaborative_weight,
            'products_df': self.products_df,
            'product_vectors': self.product_vectors,
            'user_item_matrix': self.user_item_matrix,
            'svd_model': self.svd_model,
            'user_to_idx': self.user_to_idx,
            'item_to_idx': self.item_to_idx,
            'idx_to_user': self.idx_to_user,
            'idx_to_item': self.idx_to_item
        }

        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)

        if self.faiss_index:
            faiss.write_index(self.faiss_index, filepath.replace('.pkl', '_faiss.index'))

        print(f"Модель сохранена в {filepath}")

    def load_model(self, filepath):
        """Загрузка модели"""
        with open(filepath, 'rb') as f:
            model_data = pickle.load(f)

        self.content_weight = model_data['content_weight']
        self.collaborative_weight = model_data['collaborative_weight']
        self.products_df = model_data['products_df']
        self.product_vectors = model_data['product_vectors']
        self.user_item_matrix = model_data['user_item_matrix']
        self.svd_model = model_data['svd_model']
        self.user_to_idx = model_data['user_to_idx']
        self.item_to_idx = model_data['item_to_idx']
        self.idx_to_user = model_data['idx_to_user']
        self.idx_to_item = model_data['idx_to_item']

        # Загрузка FAISS индекса
        faiss_path = filepath.replace('.pkl', '_faiss.index')
        try:
            self.faiss_index = faiss.read_index(faiss_path)
        except:
            pass

        print(f"Модель загружена из {filepath}")
