from django.apps import AppConfig

class RecomendationSystemConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "recomendation_system"
    
    # def ready(self):
    #     train_model()
    #     return super().ready()