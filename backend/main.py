import os
import json
import sys
import asyncio
import httpx
from datetime import datetime, time
from typing import List, Optional
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from layers import LAYERS
from dotenv import load_dotenv
import gspread
from google.oauth2.service_account import Credentials
import aiosmtplib
from email.message import EmailMessage
from jinja2 import Template

# Load environment variables
load_dotenv()

app = FastAPI(title="AirQualityMap API", description="API for Air Quality Dashboard & Subscriptions")

# Files
SUBSCRIPTIONS_FILE = "subscriptions.json"
STATE_FILE = "notification_state.json"

class Subscription(BaseModel):
    email: EmailStr

# HTML Email Template (Dashboard Style)
EMAIL_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #020617; color: #f1f5f9; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: #0f172a; border-radius: 24px; border: 1px solid rgba(56, 189, 248, 0.3); overflow: hidden; }
        .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 30px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .flag { font-size: 24px; margin-bottom: 10px; }
        .title { font-size: 22px; font-weight: bold; margin: 0; color: #f1f5f9; }
        .subtitle { font-size: 14px; color: #38bdf8; text-transform: uppercase; letter-spacing: 1px; }
        .content { padding: 30px; }
        .hero-card { background-color: rgba(30, 41, 59, 0.5); border-radius: 20px; padding: 25px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.05); }
        .temp-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; }
        .temp-val { font-size: 48px; font-weight: bold; color: #f1f5f9; }
        .weather-desc { font-size: 18px; color: #94a3b8; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .stat-item { background: rgba(15, 23, 42, 0.4); padding: 15px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); }
        .stat-label { font-size: 12px; color: #64748b; margin-bottom: 5px; }
        .stat-value { font-size: 16px; font-weight: 600; color: #38bdf8; }
        .alert-box { padding: 15px; border-radius: 12px; margin-bottom: 20px; font-weight: bold; text-align: center; border: 1px solid; }
        .alert-critical { background: rgba(239, 68, 68, 0.15); border-color: #ef4444; color: #ef4444; }
        .alert-modere { background: rgba(245, 158, 11, 0.15); border-color: #f59e0b; color: #f59e0b; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #475569; background: rgba(0,0,0,0.2); }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="flag">🇩🇯</div>
            <h1 class="title">RÉPUBLIQUE DE DJIBOUTI</h1>
            <div class="subtitle">Station Environnementale Nationale</div>
        </div>
        <div class="content">
            {% if dust_alert.level != 'NORMAL' %}
            <div class="alert-box alert-{{ dust_alert.level|lower }}">
                ⚠️ ALERTE {{ dust_alert.level }} : {{ dust_alert.text }}
            </div>
            {% endif %}

            <div class="hero-card">
                <div class="temp-row">
                    <div>
                        <div class="temp-val">{{ weather.temp|round }}°C</div>
                        <div class="weather-desc">{{ weather.label }}</div>
                    </div>
                </div>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-label">AQI (Index Air)</div>
                        <div class="stat-value" style="color: {{ aqi.color }}">{{ aqi.val }} - {{ aqi.label }}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Humidité</div>
                        <div class="stat-value">{{ weather.humidity }}%</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Vent / Rafales</div>
                        <div class="stat-value">{{ weather.wind|round }} / {{ weather.gusts|round }} km/h</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Indice UV</div>
                        <div class="stat-value">{{ weather.uv }}</div>
                    </div>
                </div>
            </div>
            
            <p style="font-size: 14px; color: #94a3b8;">
                Ce rapport a été généré automatiquement par Atmosphère 3D pour la ville de Djibouti.
            </p>
        </div>
        <div class="footer">
            &copy; 2026 Moustapha Farah · Atmosphère 3D · Djibouti<br>
            Sources : Open-Meteo · ECMWF · CAMS
        </div>
    </div>
</body>
</html>
"""

def load_json(path, default):
    if not os.path.exists(path): return default
    with open(path, "r") as f:
        try: return json.load(f)
        except: return default

def save_json(path, data):
    with open(path, "w") as f: json.dump(data, f)

def get_dust_alert(pm10, wind_speed):
    if pm10 > 200 and wind_speed > 40: return {"level": "CRITIQUE", "color": "#ef4444", "text": "Tempête de sable active"}
    if pm10 > 100 and wind_speed > 25: return {"level": "ELEVE", "color": "#f97316", "text": "Brume de sable dense"}
    if pm10 > 50: return {"level": "MODERE", "color": "#f59e0b", "text": "Poussière en suspension"}
    return {"level": "NORMAL", "color": "#10b981", "text": "Conditions claires"}

def get_aqi_label(aqi):
    if aqi <= 50: return {"label": "Bon", "color": "#10b981"}
    if aqi <= 100: return {"label": "Modéré", "color": "#f59e0b"}
    if aqi <= 150: return {"label": "Sensible", "color": "#f97316"}
    if aqi <= 200: return {"label": "Mauvais", "color": "#ef4444"}
    return {"label": "Dangereux", "color": "#7c3aed"}

async def send_dashboard_email(email: str, weather: dict, air_quality: dict, dust_alert: dict, is_alert=False):
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")

    if not all([smtp_user, smtp_password]): return

    aqi_info = get_aqi_label(air_quality['aqi'])
    
    template = Template(EMAIL_TEMPLATE)
    html_content = template.render(
        weather=weather,
        aqi={**aqi_info, "val": air_quality['aqi']},
        dust_alert=dust_alert,
        date=datetime.now().strftime("%d/%m/%Y")
    )

    msg = EmailMessage()
    subject = "[ALERTE] " if is_alert else "[DAILY] "
    msg["Subject"] = f"{subject}Rapport Environnemental Djibouti"
    msg["From"] = smtp_user
    msg["To"] = email
    msg.add_alternative(html_content, subtype="html")

    try:
        await aiosmtplib.send(msg, hostname=smtp_host, port=smtp_port, username=smtp_user, password=smtp_password, start_tls=True)
    except Exception as e:
        print(f"Error sending email to {email}: {e}")

async def notification_loop():
    while True:
        try:
            state = load_json(STATE_FILE, {"last_daily": "", "last_alert_level": "NORMAL"})
            today = datetime.now().strftime("%Y-%m-%d")
            
            async with httpx.AsyncClient() as client:
                # Open-Meteo for Djibouti
                w_url = "https://api.open-meteo.com/v1/forecast?latitude=11.5884&longitude=43.1456&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,weather_code"
                aq_url = "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=11.5884&longitude=43.1456&current=pm2_5,pm10,us_aqi,dust"
                
                w_res = (await client.get(w_url)).json()
                aq_res = (await client.get(aq_url)).json()
                
                cur_w = w_res['current']
                cur_aq = aq_res['current']
                
                weather = {
                    "temp": cur_w['temperature_2m'],
                    "humidity": cur_w['relative_humidity_2m'],
                    "wind": cur_w['wind_speed_10m'],
                    "gusts": cur_w['wind_gusts_10m'],
                    "uv": cur_w['uv_index'],
                    "label": "Ciel Dégagé" if cur_w['weather_code'] == 0 else "Nuageux" 
                }
                aqi = {"aqi": cur_aq['us_aqi']}
                dust_alert = get_dust_alert(cur_aq['pm10'], cur_w['wind_speed_10m'])
                
                emails = load_json(SUBSCRIPTIONS_FILE, [])
                
                # Check for Alerts (CRITIQUE or ELEVE)
                if dust_alert['level'] in ['CRITIQUE', 'ELEVE'] and state['last_alert_level'] != dust_alert['level']:
                    for email in emails:
                        await send_dashboard_email(email, weather, aqi, dust_alert, is_alert=True)
                    state['last_alert_level'] = dust_alert['level']
                elif dust_alert['level'] == 'NORMAL':
                    state['last_alert_level'] = 'NORMAL'

                # Check for Daily Report (e.g., at e.g., 08:00 Local)
                # For simplicity, we just check if we sent it today.
                if state['last_daily'] != today:
                    for email in emails:
                        await send_dashboard_email(email, weather, aqi, dust_alert, is_alert=False)
                    state['last_daily'] = today
                
                save_json(STATE_FILE, state)

        except Exception as e:
            print(f"Loop error: {e}")
            
        await asyncio.sleep(1800) # Check every 30 mins

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(notification_loop())

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Robust development setting
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/layers")
def get_layers(): return LAYERS

@app.post("/api/subscribe")
async def subscribe(sub: Subscription, background_tasks: BackgroundTasks):
    emails = load_json(SUBSCRIPTIONS_FILE, [])
    if sub.email not in emails:
        emails.append(sub.email)
        save_json(SUBSCRIPTIONS_FILE, emails)
        
        # Log to Google Sheets (Background Task)
        background_tasks.add_task(log_to_google_sheets, sub.email)
        
        # Send immediate welcome report
        background_tasks.add_task(send_immediate_report, sub.email)
        
    return {"status": "ok"}

async def log_to_google_sheets(email: str):
    """Logs the email to a Google Sheet if configured."""
    print(f"DEBUG: Starting Google Sheets log for {email}", file=sys.stderr, flush=True)
    sheet_id = os.getenv("GOOGLE_SHEET_ID")
    base_dir = os.path.dirname(os.path.abspath(__file__))
    creds_val = os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE", "credentials.json")
    creds_file = os.path.join(base_dir, creds_val) if not os.path.isabs(creds_val) else creds_val
    
    print(f"DEBUG: Sheet ID: {sheet_id}, Creds File: {creds_file}", file=sys.stderr, flush=True)
    
    if not sheet_id or not os.path.exists(creds_file):
        print(f"DEBUG: Google Sheets integration skipped. File exists: {os.path.exists(creds_file)}", file=sys.stderr, flush=True)
        return

    try:
        print(f"DEBUG: Authorizing via gspread.service_account using {creds_file}...", file=sys.stderr, flush=True)
        client = gspread.service_account(filename=creds_file)
        
        print(f"DEBUG: Opening sheet {sheet_id}...", file=sys.stderr, flush=True)
        sheet = client.open_by_key(sheet_id).sheet1
        
        # Check if email already exists in sheet to avoid duplicates
        existing_emails = sheet.col_values(1)
        if email not in existing_emails:
            sheet.append_row([email, datetime.now().strftime("%Y-%m-%d %H:%M:%S")])
            print(f"Successfully logged {email} to Google Sheets.", file=sys.stderr, flush=True)
        else:
            print(f"Email {email} already exists in Google Sheets.", file=sys.stderr, flush=True)
    except Exception as e:
        import traceback
        print(f"Error logging to Google Sheets: {e}", file=sys.stderr, flush=True)
        traceback.print_exc()

async def send_immediate_report(email: str):
    try:
        async with httpx.AsyncClient() as client:
            w_url = "https://api.open-meteo.com/v1/forecast?latitude=11.5884&longitude=43.1456&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,weather_code"
            aq_url = "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=11.5884&longitude=43.1456&current=pm2_5,pm10,us_aqi,dust"
            
            w_res = (await client.get(w_url)).json()
            aq_res = (await client.get(aq_url)).json()
            
            cur_w = w_res['current']
            cur_aq = aq_res['current']
            
            weather = {
                "temp": cur_w['temperature_2m'],
                "humidity": cur_w['relative_humidity_2m'],
                "wind": cur_w['wind_speed_10m'],
                "gusts": cur_w['wind_gusts_10m'],
                "uv": cur_w['uv_index'],
                "label": "Ciel Dégagé" if cur_w['weather_code'] == 0 else "Nuageux" 
            }
            aqi = {"aqi": cur_aq['us_aqi']}
            dust_alert = get_dust_alert(cur_aq['pm10'], cur_w['wind_speed_10m'])
            
            await send_dashboard_email(email, weather, aqi, dust_alert, is_alert=False)
    except Exception as e:
        print(f"Immediate report error: {e}")

@app.get("/")
def health(): return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
