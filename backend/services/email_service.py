import os
import base64
import requests
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

GMAIL_SENDER = os.getenv("GMAIL_SENDER", "")
CLIENT_ID = os.getenv("GMAIL_CLIENT_ID", "")
CLIENT_SECRET = os.getenv("GMAIL_CLIENT_SECRET", "")
REFRESH_TOKEN = os.getenv("GMAIL_REFRESH_TOKEN", "")

TOKEN_URL = "https://oauth2.googleapis.com/token"
GMAIL_SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send"


def _get_access_token() -> str:
    resp = requests.post(TOKEN_URL, data={
        "grant_type": "refresh_token",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "refresh_token": REFRESH_TOKEN,
    }, timeout=10)
    resp.raise_for_status()
    return resp.json()["access_token"]


def _build_message(to: str, subject: str, html_body: str) -> str:
    msg = MIMEMultipart("alternative")
    msg["From"] = GMAIL_SENDER
    msg["To"] = to
    msg["Subject"] = subject
    msg.attach(MIMEText(html_body, "html"))
    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
    return raw


def send_email(to: str, subject: str, html_body: str) -> bool:
    if not all([GMAIL_SENDER, CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN]):
        print("[email] Gmail credentials not configured – skipping email.")
        return False
    try:
        access_token = _get_access_token()
        raw_message = _build_message(to, subject, html_body)
        resp = requests.post(
            GMAIL_SEND_URL,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
            json={"raw": raw_message},
            timeout=15,
        )
        resp.raise_for_status()
        print(f"[email] Sent '{subject}' → {to}")
        return True
    except Exception as exc:
        print(f"[email] Failed to send email to {to}: {exc}")
        return False


def send_task_created_email(assignee_email, assignee_name, task_title,
                             task_description, creator_name, due_date, app_url):
    subject = f"📋 New task assigned to you: {task_title}"
    due_str = f"<p><strong>Due:</strong> {due_date}</p>" if due_date else ""
    html = f"""
    <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;padding:32px;border-radius:12px;">
      <div style="background:#1a1a2e;padding:24px;border-radius:8px;margin-bottom:24px;">
        <h1 style="color:#e2b96f;margin:0;font-size:24px;">TaskFlow</h1>
      </div>
      <h2 style="color:#1a1a2e;">Hey {assignee_name} 👋</h2>
      <p style="color:#555;font-size:16px;">A new task has been assigned to you by <strong>{creator_name}</strong>.</p>
      <div style="background:#fff;border-left:4px solid #e2b96f;padding:20px;border-radius:8px;margin:24px 0;">
        <h3 style="color:#1a1a2e;margin-top:0;">{task_title}</h3>
        <p style="color:#666;">{task_description or 'No description provided.'}</p>
        {due_str}
      </div>
      <a href="{app_url}/dashboard" style="display:inline-block;background:#e2b96f;color:#1a1a2e;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:700;">View Task →</a>
    </div>
    """
    return send_email(assignee_email, subject, html)


def send_task_completed_email(creator_email, creator_name, task_title,
                               completer_name, app_url):
    subject = f"✅ Task completed: {task_title}"
    html = f"""
    <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;padding:32px;border-radius:12px;">
      <div style="background:#1a1a2e;padding:24px;border-radius:8px;margin-bottom:24px;">
        <h1 style="color:#e2b96f;margin:0;font-size:24px;">TaskFlow</h1>
      </div>
      <h2 style="color:#1a1a2e;">Great news, {creator_name}! 🎉</h2>
      <p style="color:#555;font-size:16px;"><strong>{completer_name}</strong> has marked a task as completed.</p>
      <div style="background:#fff;border-left:4px solid #22c55e;padding:20px;border-radius:8px;margin:24px 0;">
        <h3 style="color:#1a1a2e;margin-top:0;">✅ {task_title}</h3>
        <p style="color:#22c55e;font-weight:600;">Status: Completed</p>
      </div>
      <a href="{app_url}/dashboard" style="display:inline-block;background:#e2b96f;color:#1a1a2e;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:700;">View Dashboard →</a>
    </div>
    """
    return send_email(creator_email, subject, html)