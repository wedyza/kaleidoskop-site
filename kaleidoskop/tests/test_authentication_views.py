import unittest

from django.test import TestCase
from django.contrib.auth import get_user_model
from unittest.mock import patch
from rest_framework_simplejwt.tokens import RefreshToken
from django.urls import reverse
from django.utils.timezone import timedelta

User = get_user_model()

class LoginOrRegisterViewTest(TestCase):
    def setUp(self):
        self.email = "test_email@gmail.com"
    
    @patch('services.auth_service.AuthService._send_otp_email')
    def test_login_or_register(self, mock):
        """Регистрирует пользователя и отправляет ему на почту"""
        
        data = {
            "email": self.email
        }
        response = self.client.post(reverse('email-otp-login'), data=data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(User.objects.filter(email=self.email).exists(), True)        
        
        
class ValidateOtpViewTest(TestCase):
    def setUp(self):
        self.email = "test_email@gmail.com"
        
    @patch('services.auth_service.AuthService._send_otp_email')
    def test_login_or_register_pass(self, mock):
        """Входит через одноразовый пароль"""
        
        data = {
            "email": self.email
        }
        self.client.post(reverse('email-otp-login'), data=data)
        data['otp'] = User.objects.filter(email=self.email).first().otp
        response = self.client.post(reverse('email-otp-validate'), data=data)
        self.assertEqual(response.status_code, 200)
        
    @patch('services.auth_service.AuthService._send_otp_email')
    def test_login_or_register_no_user_with_email(self, mock):
        """При авторизации не обнаружено такой почты"""
        
        data = {
            "email": self.email
        }
        data['otp'] = '111111'
        response = self.client.post(reverse('email-otp-validate'), data=data)
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()['error'], "Что-то пошло не так")        
        
    @patch('services.auth_service.AuthService._send_otp_email')
    def test_login_or_register_wrong_code(self, mock):
        """Неправильный код"""
        
        data = {
            "email": self.email
        }
        self.client.post(reverse('email-otp-login'), data=data)
        data['otp'] = '111111'
        response = self.client.post(reverse('email-otp-validate'), data=data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['error'], "Неправильный код.")
    
    @patch('services.auth_service.AuthService._send_otp_email')
    def test_login_or_register_otp_timed_out(self, mock):
        """Срок действия кода истек"""
        
        data = {
            "email": self.email
        }
        self.client.post(reverse('email-otp-login'), data=data)
        user = User.objects.filter(email=self.email).first()
        data['otp'] = user.otp
        user.otp_expires = user.otp_expires - timedelta(hours=2)
        user.save()
        response = self.client.post(reverse('email-otp-validate'), data=data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['error'], "Срок действия пароля истек")
    

class ChangeEmailViewTest(TestCase):
    def setUp(self):
        self.email = "test_email@gmail.com"
        self.change_email = "email_to@change.com"
        
    @unittest.skip("Deprecated")
    @patch('services.auth_service.AuthService._send_otp_email')
    def test_change_email_pass(self, mock):
        """Успешный запрос на смену почты"""
        
        data = {
            "email": self.email
        }
        self.client.post(reverse('email-otp-login'), data=data)
        
        data["email"] = self.change_email
                
        user = User.objects.filter(email=self.email).first()
        
        refresh = RefreshToken.for_user(user)
        refresh.payload.update({"user_id": user.pk, "email": user.email})
        
        response = self.client.post(reverse('change-email'), data={
            'email': 'fixiki@mail.ru'
        }, headers={'Authorization': f'Bearer {str(refresh.access_token)}'})
        self.assertEqual(response.status_code, 200)
    
    @unittest.skip("Deprecated")
    @patch('services.auth_service.AuthService._send_otp_email')
    def test_change_email_fails_is_not_free(self, mock):
        """Такая почта занята"""
        
        data = {
            "email": self.email
        }
        self.client.post(reverse('email-otp-login'), data=data)

        user = User.objects.filter(email=self.email).first()
        self.client.force_login(user)
        response = self.client.post(reverse('change-email'), data=data)
        self.assertEqual(response.status_code, 400)
        
class ValidateOTPChangeEmailViewTest(TestCase):
    def setUp(self):
        self.email = "test_email@gmail.com"
        self.change_email = "email_to@change.com"
        
    @unittest.skip("Deprecated")
    @patch('services.auth_service.AuthService._send_otp_email')
    def test_change_email_pass(self, mock):
        """Успешная смена почты"""
        
        data = {
            "email": self.email
        }
        self.client.post(reverse('email-otp-login'), data=data)
        user = User.objects.filter(email=self.email).first()
        self.client.force_login(user)
        data["email"] = self.change_email
        self.client.post(reverse('change-email'), data=data)
        
        user.refresh_from_db()
        data['otp'] = user.otp_change_email
        response = self.client.post(reverse('otp-change-email'), data)
        user.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(user.email, self.change_email)
