from djoser import email


class ActivationEmail(email.ActivationEmail):
    template_name = "email/email_activation.html"
