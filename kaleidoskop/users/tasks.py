from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings
from celery import shared_task
from django.template.loader import render_to_string

@shared_task
def send_otp_email(email, otp):
    subject = "Your OTP for Login"
    message = f"Your OTP is: {otp}"
    from_email = settings.EMAIL_HOST_USER
    recipient_list = [email]
    msg = EmailMultiAlternatives(subject, message, from_email, recipient_list)
    
    html_content = render_to_string("email_otp.html", {"site_name": "Калейдоскоп", "OTP": otp})
    msg.attach_alternative(html_content, "text/html")
    msg.send()
