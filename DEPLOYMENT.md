# Deployment Guide: Serverless Architecture

This guide will help you deploy the AirQualityMap application using only GitHub and Google services (100% free).

## Prerequisites

- GitHub account
- Google account with access to Google Sheets
- Your Google Sheet ID (from the URL)

## Step 1: Deploy Google Apps Script

1. Open your Google Sheet (the one with subscriber emails)
2. Go to **Extensions** > **Apps Script**
3. Delete any existing code
4. Copy the entire content of `Code.gs` and paste it into the editor
5. Click **Save** (disk icon)
6. Click **Run** > **setup** (this creates the header row if needed)
7. Click **Deploy** > **New deployment**
8. Choose type: **Web app**
9. Settings:
   - Execute as: **Me**
   - Who has access: **Anyone**
10. Click **Deploy**
11. **Copy the Web App URL** (you'll need this for GitHub secrets)

## Step 2: Configure GitHub Secrets

Go to your GitHub repository > **Settings** > **Secrets and variables** > **Actions** > **New repository secret**

Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `VITE_API_URL` | The Web App URL from Step 1 |
| `GOOGLE_SHEET_ID` | Your Google Sheet ID (from the URL) |
| `GOOGLE_CREDENTIALS` | The entire content of `backend/credentials.json` |
| `SMTP_USER` | Your Gmail address |
| `SMTP_PASSWORD` | Your Gmail App Password ([create one here](https://myaccount.google.com/apppasswords)) |

## Step 3: Push to GitHub

```bash
git add .
git commit -m "Serverless architecture ready"
git remote add origin https://github.com/Djib-Carto/Djib-Carto.github.io.git
git branch -M main
git push -u origin main
```

## Step 4: Verify Deployment

1. Go to **Actions** tab in your GitHub repository
2. You should see the "Deploy to GitHub Pages" workflow running
3. Once complete, visit: `https://djib-carto.github.io/Atmosphere/`

## Step 5: Test Subscription

1. Visit your deployed site
2. Enter an email in the subscription modal
3. Check your Google Sheet - the email should appear immediately

## Step 6: Test Daily Reports (Optional)

The daily report runs automatically at 8:00 AM UTC. To test it manually:

1. Go to **Actions** tab
2. Click on "Daily Air Quality Report"
3. Click **Run workflow** > **Run workflow**
4. Check the logs to see if emails were sent

---

## Troubleshooting

**Subscription not working?**
- Verify the `VITE_API_URL` secret matches your Google Apps Script Web App URL
- Check that the Google Apps Script is deployed as "Anyone" can access

**Daily reports not sending?**
- Verify all secrets are set correctly
- Check the Action logs for error messages
- Ensure your Gmail App Password is correct
