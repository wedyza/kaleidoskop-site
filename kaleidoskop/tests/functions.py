from django.contrib.auth import get_user_model

User = get_user_model()

def user_create_closure():
    user_id = 0
    def user_wrapper():
        nonlocal user_id
        user = User.objects.create(email=f"another_example{user_id}@mail.ru")
        user_id += 1
        return user
    return user_wrapper