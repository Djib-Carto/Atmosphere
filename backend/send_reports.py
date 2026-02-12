#!/usr/bin/env python3
"""
Daily Email Report Script for GitHub Actions
Reads subscribers from Google Sheets and sends daily air quality reports
"""
import os
import sys
import asyncio
import httpx
from datetime import datetime
import gspread
import aiosmtplib
from email.message import EmailMessage
from jinja2 import Template

# Email template (same as main.py)
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
                    <div class="temp-val">{{ weather.temp }}°C</div>
                    <div class="weather-desc">{{ weather.label }}</div>
                </div>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-label">Humidité</div>
                        <div class="stat-value">{{ weather.humidity }}%</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Vent</div>
                        <div class="stat-value">{{ weather.wind }} km/h</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Rafales</div>
                        <div class="stat-value">{{ weather.gusts }} km/h</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">UV Index</div>
                        <div class="stat-value">{{ weather.uv }}</div>
                    </div>
                </div>
            </div>
            <h3 style="color: #38bdf8; margin-top: 30px;">Qualité de l'Air</h3>
            <div class="hero-card">
                <div class="temp-row">
                    <div class="temp-val" style="font-size: 36px;">{{ air_quality.aqi }}</div>
                    <div class="weather-desc">AQI US</div>
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

def get_dust_alert(pm10, wind_speed):
    if pm10 > 200 and wind_speed > 40: 
        return {"level": "CRITIQUE", "color": "#ef4444", "text": "Tempête de sable active"}
    if pm10 > 100 and wind_speed > 25: 
        return {"level": "ELEVE", "color": "#f97316", "text": "Brume de sable dense"}
    if pm10 > 50: 
        return {"level": "MODERE", "color": "#f59e0b", "text": "Poussière en suspension"}
    return {"level": "NORMAL", "color": "#10b981", "text": "Conditions claires"}

async def send_email(to_email, weather, air_quality, dust_alert):
    """Send email to a single subscriber"""
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    
    if not smtp_user or not smtp_password:
        print("SMTP credentials not configured", file=sys.stderr)
        return False
    
    template = Template(EMAIL_TEMPLATE)
    html_body = template.render(
        weather=weather,
        air_quality=air_quality,
        dust_alert=dust_alert
    )
    
    msg = EmailMessage()
    msg["From"] = smtp_user
    msg["To"] = to_email
    msg["Subject"] = f"🌍 Rapport Quotidien - Atmosphère 3D Djibouti - {datetime.now().strftime('%d/%m/%Y')}"
    msg.set_content("Veuillez activer l'affichage HTML pour voir ce rapport.")
    msg.add_alternative(html_body, subtype="html")
    
    try:
        await aiosmtplib.send(
            msg,
            hostname=smtp_host,
            port=smtp_port,
            username=smtp_user,
            password=smtp_password,
            start_tls=True
        )
        print(f"✓ Email sent to {to_email}")
        return True
    except Exception as e:
        print(f"✗ Failed to send to {to_email}: {e}", file=sys.stderr)
        return False

async def fetch_weather_data():
    """Fetch current weather and air quality data"""
    lat, lon = 11.589, 43.145  # Djibouti
    
    async with httpx.AsyncClient() as client:
        # Weather data
        weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_gusts_10m,uv_index&timezone=auto"
        weather_resp = await client.get(weather_url)
        weather_data = weather_resp.json()
        
        # Air quality data
        aq_url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&current=us_aqi,pm10&timezone=auto"
        aq_resp = await client.get(aq_url)
        aq_data = aq_resp.json()
        
        cur_w = weather_data['current']
        cur_aq = aq_data['current']
        
        weather = {
            "temp": cur_w['temperature_2m'],
            "humidity": cur_w['relative_humidity_2m'],
            "wind": cur_w['wind_speed_10m'],
            "gusts": cur_w['wind_gusts_10m'],
            "uv": cur_w['uv_index'],
            "label": "Ciel Dégagé" if cur_w['weather_code'] == 0 else "Nuageux"
        }
        
        air_quality = {"aqi": cur_aq['us_aqi']}
        dust_alert = get_dust_alert(cur_aq['pm10'], cur_w['wind_speed_10m'])
        
        return weather, air_quality, dust_alert

async def main():
    """Main execution function"""
    print("Starting daily report job...")
    
    # Get subscribers from Google Sheets
    sheet_id = os.getenv("GOOGLE_SHEET_ID")
    creds_file = os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE", "backend/credentials.json")
    
    if not sheet_id or not os.path.exists(creds_file):
        print(f"ERROR: Missing Google Sheets configuration", file=sys.stderr)
        sys.exit(1)
    
    try:
        client = gspread.service_account(filename=creds_file)
        sheet = client.open_by_key(sheet_id).sheet1
        emails = [row[0] for row in sheet.get_all_values()[1:] if row and row[0]]  # Skip header
        print(f"Found {len(emails)} subscribers")
    except Exception as e:
        print(f"ERROR: Failed to read Google Sheets: {e}", file=sys.stderr)
        sys.exit(1)
    
    if not emails:
        print("No subscribers found, exiting.")
        return
    
    # Fetch weather data
    try:
        weather, air_quality, dust_alert = await fetch_weather_data()
        print(f"Weather data fetched: {weather['temp']}°C, AQI: {air_quality['aqi']}")
    except Exception as e:
        print(f"ERROR: Failed to fetch weather data: {e}", file=sys.stderr)
        sys.exit(1)
    
    # Send emails
    tasks = [send_email(email, weather, air_quality, dust_alert) for email in emails]
    results = await asyncio.gather(*tasks)
    
    success_count = sum(results)
    print(f"\n✓ Report complete: {success_count}/{len(emails)} emails sent successfully")

if __name__ == "__main__":
    asyncio.run(main())
