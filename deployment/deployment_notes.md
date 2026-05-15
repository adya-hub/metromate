# MetroMate AWS EC2 Deployment Guide

## 1. Prerequisites
Ensure your EC2 instance (Ubuntu 22.04 LTS recommended) has the following installed:
- Node.js (v18+)
- npm
- PM2 (`npm install -g pm2`)
- Nginx (`sudo apt install nginx`)
- Git

## 2. Cloning & Setup
```bash
git clone https://github.com/yourusername/metromate.git
cd metromate
```

## 3. Backend Deployment
The backend needs to generate its JSON graphs before running.
```bash
cd backend
npm install
# Set production environment
cp .env.example .env
nano .env # Add your METRO_API_KEY and set PORT=3001

# Preprocess GTFS (Requires ~2GB RAM temporarily)
npm run preprocess

# Compile TypeScript
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup # Follow the prompt to enable startup on boot
```

## 4. Nginx Configuration
```bash
# Copy the config
sudo cp ../deployment/nginx.conf /etc/nginx/sites-available/metromate
sudo ln -s /etc/nginx/sites-available/metromate /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

## 5. Frontend Deployment (Vercel)
The Next.js frontend is heavily optimized for Vercel's Edge network.
1. Connect your repository to Vercel.
2. Set the Environment Variable:
   - `NEXT_PUBLIC_API_URL=https://api.metromate.com` (Your EC2 domain)
3. Deploy!

## 6. SSL Configuration (Certbot)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.metromate.com
```

## 7. Monitoring & Health
Monitor the PM2 cluster:
```bash
pm2 monit
pm2 logs metromate-api
```
Check health endpoints:
- `curl http://localhost:3001/health`
- `curl http://localhost:3001/api/metro/debug`
