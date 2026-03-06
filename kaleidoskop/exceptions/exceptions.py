class KaleidoskopSpecificException(BaseException):
    ...

class NotFoundException(KaleidoskopSpecificException):
    ...
    
class EmptyCartException(KaleidoskopSpecificException):
    ...
    
class UnknownUserException(KaleidoskopSpecificException):
    ...
    
class ExceededRemainsException(KaleidoskopSpecificException):
    def __init__(self, *args, item_list):
        super().__init__(*args)
        self.item_list = item_list
        
class UserUnauthorized(KaleidoskopSpecificException):
    ...


class OrderIsAgreed(KaleidoskopSpecificException):
    ...
    
class OTPTimedOutException(KaleidoskopSpecificException):
    ...
    
class WrongOTPPassedException(KaleidoskopSpecificException):
    ...
    
class EmailIsNotFree(KaleidoskopSpecificException):
    ...