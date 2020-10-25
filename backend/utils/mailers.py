from django.conf import settings
from sendgrid.helpers.mail import Mail
from sendgrid import SendGridAPIClient
from django.template.loader import render_to_string


def send_confirmation_code(user):
    email_template = render_to_string('confirm_account.html',
                                      context={
                                          'user': user,
                                          'frontend_url': settings.FRONTEND_URL,
                                      }
                                      )
    message = Mail(
        from_email=settings.DEFAULT_FROM_EMAIL,
        to_emails=user.email,
        subject='Confirm your registration!',
        html_content=email_template
    )
    sender = SendGridAPIClient(settings.SENDGRID_API_KEY)
    sender.send(message)


def send_reset_password_code(user):
    email_template = render_to_string('reset_password.html',
                                      context={
                                          'user': user,
                                          'frontend_url': settings.FRONTEND_URL,
                                      }
                                      )
    message = Mail(
        from_email=settings.DEFAULT_FROM_EMAIL,
        to_emails=user.email,
        subject='Reset your password!',
        html_content=email_template
    )
    sender = SendGridAPIClient(settings.SENDGRID_API_KEY)
    sender.send(message)


def send_leaving_project_mail(user, project):
    email_template = render_to_string('leave_project.html',
                                      context={
                                          'user': user,
                                          'project': project,
                                      }
                                      )
    message = Mail(
        from_email=settings.DEFAULT_FROM_EMAIL,
        to_emails=project.created_by.email,
        subject='A member has left your project!',
        html_content=email_template
    )
    sender = SendGridAPIClient(settings.SENDGRID_API_KEY)
    sender.send(message)


def send_mail_to_new_member(member):
    print(member.member.email)
    email_template = render_to_string('add_new_member.html', context={'member': member})
    message = Mail(
        from_email=settings.DEFAULT_FROM_EMAIL,
        to_emails=member.member.email,
        subject='New project for labeling!',
        html_content=email_template
    )
    sender = SendGridAPIClient(settings.SENDGRID_API_KEY)
    sender.send(message)
