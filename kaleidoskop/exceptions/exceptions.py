class KaleidoskopSpecificException(BaseException):
    """Ошибка для калейдоскопа"""
    
    ...

class NotFoundException(KaleidoskopSpecificException):
    """Не найдено в базе данных, можно пробросить, что именно"""
    ...
    
class EmptyCartException(KaleidoskopSpecificException):
    """Пустая корзина"""
    ...
    
class UnknownUserException(KaleidoskopSpecificException):
    """Неизвестный пользователь"""
    ...
    
class ExceededRemainsException(KaleidoskopSpecificException):
    """Недостаточно товаров на складе"""
    def __init__(self, *args, item_list):
        super().__init__(*args)
        self.item_list = item_list
        
class UserUnauthorized(KaleidoskopSpecificException):
    """Пользователь неавторизован"""
    ...


class OrderIsAgreed(KaleidoskopSpecificException):
    """Заказ согласован"""
    ...
    
class OTPTimedOutException(KaleidoskopSpecificException):
    """Вышло время жизни пароля"""
    ...
    
class WrongOTPPassedException(KaleidoskopSpecificException):
    """Неправильный одноразовый пароль"""
    ...
    
class EmailIsNotFree(KaleidoskopSpecificException):
    """Почта занята"""
    ...