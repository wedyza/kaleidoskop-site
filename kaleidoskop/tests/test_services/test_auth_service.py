from django.test import TestCase
from unittest.mock import patch
from services.auth_service import AuthService
from django.utils.timezone import timedelta
from django.contrib.auth import get_user_model
from exceptions.exceptions import EmailIsNotFree, OTPTimedOutException, WrongOTPPassedException
import unittest

User = get_user_model()

class TestAuthService(TestCase):
    def setUp(self):
        self.test_email = "test@email.ru"
        self.auth_service = AuthService()
        
    @patch('services.auth_service.AuthService._send_otp_email')
    def test_validate_login_or_register_register_case(self, mock_send_email):
        """Регистрирует пользователя и отправляет ему письмо"""

        self.auth_service.login_or_register(self.test_email)
        
        mock_send_email.assert_called_once()
        call_args = mock_send_email.call_args[0]
        
        self.assertEqual(call_args[0], self.test_email)
        self.assertEqual(len(call_args[1]), 6)
        self.assertEqual(User.objects.all().count(), 1)
        
    
    @patch('services.auth_service.AuthService._send_otp_email')
    def test_validate_login_or_register_login_case(self, mock_send_email):
        """Видит, что пользователь существует и отправляет ему письмо, не создавая нового"""

        User.objects.create(email=self.test_email)
        self.auth_service.login_or_register(self.test_email)
        
        mock_send_email.assert_called_once()
        call_args = mock_send_email.call_args[0]
        
        self.assertEqual(call_args[0], self.test_email)
        self.assertEqual(len(call_args[1]), 6)
        self.assertEqual(User.objects.all().count(), 1)
    
    @patch('services.auth_service.AuthService._send_otp_email')
    def test_validate_otp_pass(self, mock_send_email):
        """Проверка пароля - правильный"""

        self.auth_service.login_or_register(self.test_email)
        user = User.objects.filter(email=self.test_email).first()
        payload = self.auth_service.validate_otp(self.test_email, user.otp)
        self.assertNotEqual(payload, None)
        
        
    @patch('services.auth_service.AuthService._send_otp_email')
    def test_validate_otp_wrong(self, mock_send_email):
        """Проверка пароля - неправильный"""

        self.auth_service.login_or_register(self.test_email)
        user = User.objects.filter(email=self.test_email).first()

        try:
            payload = self.auth_service.validate_otp(self.test_email, '7777777')
            self.fail("Прошло с неправильным паролем")        
        except WrongOTPPassedException:
            pass
        except Exception as e:
            raise e
    
    @patch('services.auth_service.AuthService._send_otp_email')
    def test_validate_otp_timed_out(self, mock_send_email):
        """Проверка пароля - время действия пароля истекло"""

        self.auth_service.login_or_register(self.test_email)
        user = User.objects.filter(email=self.test_email).first()
        user.otp_expires = user.otp_expires - timedelta(hours=2)
        user.save()
        try:
            payload = self.auth_service.validate_otp(self.test_email, user.otp)
            self.fail("Прошло с истеченным паролем")        
        except OTPTimedOutException:
            pass
        except Exception as e:
            raise e
    
    @unittest.expectedFailure
    @patch('services.auth_service.AuthService._send_otp_email')
    def test_change_email_pass(self, mock_send_email):
        """Смена почты - Успех"""

        user = User.objects.create(email=self.test_email)
        new_email = 'new_email@gmail.com'
        self.auth_service.change_email(user, new_email)
        self.assertEqual(user.email_to_change, new_email)
        
    @patch('services.auth_service.AuthService._send_otp_email')
    def test_change_email_fails(self, mock_send_email):
        """Смена почты - Занято"""
        
        user = User.objects.create(email=self.test_email)
        new_email = 'new_email@gmail.com'
        user = User.objects.create(email=new_email)
        try:
            self.auth_service.change_email(user, new_email)
        except EmailIsNotFree:
            pass
        except Exception as e:
            raise e

    @unittest.expectedFailure
    @patch('services.auth_service.AuthService._send_otp_email')
    def test_validate_change_email_pass(self, mock_send_email):
        """Валидация смены почты - успех"""
        
        user = User.objects.create(email=self.test_email)
        new_email = 'new_email@gmail.com'
        self.auth_service.change_email(user, new_email)
        self.auth_service.validate_change_email_otp(user, user.otp_change_email)
        
    @unittest.expectedFailure
    @patch('services.auth_service.AuthService._send_otp_email')
    def test_validate_change_email_fails(self, mock_send_email):
        """Валидация смены почты - неудача, неправильный пароль"""

        user = User.objects.create(email=self.test_email)
        new_email = 'new_email@gmail.com'
        self.auth_service.change_email(user, new_email)
        
        try:
            self.auth_service.validate_change_email_otp(user, '7777777')
        except WrongOTPPassedException:
            pass
        except Exception as e:
            raise e
        

    @unittest.expectedFailure
    @patch('services.auth_service.AuthService._send_otp_email')
    def test_validate_change_email_otp_timed_out(self, mock_send_email):
        """Валидация смены почты - неудача, истекло время действия"""

        user = User.objects.create(email=self.test_email)
        new_email = 'new_email@gmail.com'
        self.auth_service.change_email(user, new_email)
        user.otp_expires_change_email = user.otp_expires_change_email - timedelta(hours=2)
        user.save()
        
        try:
            self.auth_service.validate_change_email_otp(user, user.otp_change_email)
        except OTPTimedOutException:
            pass
        except Exception as e:
            raise e
