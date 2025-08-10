# Deployment Guide

This guide covers deploying the Two Player Chess application to various platforms and environments.

## 🎯 Deployment Overview

The application consists of two parts that need to be deployed:
- **Backend**: Node.js server with Socket.io
- **Frontend**: React SPA (Single Page Application)

## 🏗️ Production Build

### Backend Production Setup

1. **Environment Configuration**
   
   Create a `.env` file in the backend directory:
   ```env
   NODE_ENV=production
   PORT=3000
   FRONTEND_URL=https://your-frontend-domain.com
   ADMIN_UI_PASSWORD=your-secure-password
   ```

2. **Update CORS Configuration**
   
   In `backend/server.js`, update the CORS origins:
   ```javascript
   const allowedOrigins = [
       "https://your-frontend-domain.com",
       "https://admin.socket.io"
   ];
   ```

3. **Production Dependencies**
   ```bash
   cd backend
   npm ci --only=production
   ```

### Frontend Production Build

1. **Environment Configuration**
   
   Create `.env.production` in the frontend directory:
   ```env
   VITE_BACKEND_URL=https://your-backend-domain.com
   VITE_APP_NAME=Two Player Chess
   ```

2. **Update Backend URL**
   
   In `frontend/src/App.jsx`:
   ```javascript
   const url = import.meta.env.VITE_BACKEND_URL || "https://your-backend-domain.com";
   ```

3. **Build for Production**
   ```bash
   cd frontend
   npm run build
   ```

## 🌐 Platform-Specific Deployments

### Heroku Deployment

#### Backend Deployment

1. **Create Heroku App**
   ```bash
   cd backend
   heroku create your-app-name-backend
   ```

2. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set FRONTEND_URL=https://your-frontend-app.herokuapp.com
   ```

3. **Create Procfile**
   ```
   web: node server.js
   ```

4. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy backend to Heroku"
   git push heroku main
   ```

#### Frontend Deployment

1. **Build and Deploy to Heroku**
   ```bash
   cd frontend
   heroku create your-app-name-frontend
   
   # Add buildpack for static sites
   heroku buildpacks:add heroku/nodejs
   heroku buildpacks:add https://github.com/heroku/heroku-buildpack-static
   ```

2. **Create static.json**
   ```json
   {
     "root": "dist",
     "routes": {
       "/**": "index.html"
     },
     "headers": {
       "/**": {
         "Cache-Control": "public, max-age=31536000"
       },
       "/index.html": {
         "Cache-Control": "no-store, no-cache, must-revalidate"
       }
     }
   }
   ```

3. **Update package.json**
   ```json
   {
     "scripts": {
       "heroku-postbuild": "npm run build"
     }
   }
   ```

### Vercel Deployment

#### Frontend on Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy Frontend**
   ```bash
   cd frontend
   vercel --prod
   ```

3. **Set Environment Variables** in Vercel Dashboard:
   - `VITE_BACKEND_URL`: Your backend URL

#### Backend on Vercel

1. **Create vercel.json**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "server.js"
       }
     ]
   }
   ```

2. **Deploy Backend**
   ```bash
   cd backend
   vercel --prod
   ```

### Netlify Deployment (Frontend Only)

1. **Build and Deploy**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Netlify**
   - Upload `dist` folder to Netlify
   - Or connect GitHub repository

3. **Configure Redirects**
   
   Create `frontend/public/_redirects`:
   ```
   /*    /index.html   200
   ```

4. **Environment Variables** in Netlify Dashboard:
   - `VITE_BACKEND_URL`: Your backend URL

### Railway Deployment

#### Full Stack on Railway

1. **Create railway.json**
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "cd backend && npm start",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

2. **Create Start Script**
   
   Add to root `package.json`:
   ```json
   {
     "scripts": {
       "build": "cd frontend && npm run build",
       "start": "cd backend && npm start"
     }
   }
   ```

3. **Deploy**
   ```bash
   railway login
   railway init
   railway up
   ```

### DigitalOcean App Platform

1. **Create App Spec** (`.do/app.yaml`):
   ```yaml
   name: two-player-chess
   services:
   - name: backend
     source_dir: /backend
     github:
       repo: your-username/Two_Player_Chess
       branch: main
     run_command: npm start
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
     env:
     - key: NODE_ENV
       value: production
       
   - name: frontend
     source_dir: /frontend
     github:
       repo: your-username/Two_Player_Chess
       branch: main
     build_command: npm run build
     run_command: npm run preview
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
   ```

2. **Deploy via CLI**
   ```bash
   doctl apps create --spec .do/app.yaml
   ```

## 🐳 Docker Deployment

### Backend Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start server
CMD ["npm", "start"]
```

### Frontend Dockerfile

```dockerfile
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy build files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - FRONTEND_URL=http://localhost
    restart: unless-stopped
    
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    environment:
      - VITE_BACKEND_URL=http://localhost:3000
    depends_on:
      - backend
    restart: unless-stopped
```

### Nginx Configuration

Create `frontend/nginx.conf`:
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;
        
        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }
}
```

## ☁️ Cloud Provider Specific

### AWS Deployment

#### Using AWS Elastic Beanstalk

1. **Install EB CLI**
   ```bash
   pip install awsebcli
   ```

2. **Initialize and Deploy Backend**
   ```bash
   cd backend
   eb init --platform node.js
   eb create production
   eb deploy
   ```

3. **Deploy Frontend to S3 + CloudFront**
   ```bash
   cd frontend
   npm run build
   aws s3 sync dist/ s3://your-bucket-name
   aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
   ```

#### Using ECS (Container)

1. **Create ECR Repositories**
   ```bash
   aws ecr create-repository --repository-name chess-backend
   aws ecr create-repository --repository-name chess-frontend
   ```

2. **Build and Push Images**
   ```bash
   # Get login token
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com
   
   # Build and push
   docker build -t chess-backend ./backend
   docker tag chess-backend:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/chess-backend:latest
   docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/chess-backend:latest
   ```

### Google Cloud Platform

#### Using Cloud Run

1. **Deploy Backend**
   ```bash
   cd backend
   gcloud run deploy chess-backend \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

2. **Deploy Frontend to Firebase Hosting**
   ```bash
   cd frontend
   npm install -g firebase-tools
   firebase init hosting
   firebase deploy
   ```

### Microsoft Azure

#### Using Container Instances

1. **Create Resource Group**
   ```bash
   az group create --name chess-app --location eastus
   ```

2. **Deploy Backend Container**
   ```bash
   az container create \
     --resource-group chess-app \
     --name chess-backend \
     --image your-registry/chess-backend:latest \
     --dns-name-label chess-backend-unique \
     --ports 3000
   ```

3. **Deploy Frontend to Static Web Apps**
   ```bash
   cd frontend
   az staticwebapp create \
     --name chess-frontend \
     --resource-group chess-app \
     --source https://github.com/your-username/Two_Player_Chess \
     --location centralus
   ```

## 🔧 Production Configuration

### Environment Variables

#### Backend
```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://yourdomain.com
SOCKET_IO_ADMIN_PASSWORD=secure-password-here
LOG_LEVEL=info
```

#### Frontend
```env
VITE_BACKEND_URL=https://api.yourdomain.com
VITE_APP_NAME=Two Player Chess
VITE_VERSION=1.0.0
```

### Security Headers

Add security middleware to backend:
```javascript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "wss://your-domain.com"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

### SSL/TLS Configuration

For custom domains, ensure SSL certificates are properly configured:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}
```

## 📊 Monitoring and Logging

### Application Monitoring

1. **Add Health Check Endpoint**
   ```javascript
   // backend/server.js
   app.get('/health', (req, res) => {
     res.status(200).json({
       status: 'healthy',
       timestamp: new Date().toISOString(),
       uptime: process.uptime(),
       environment: process.env.NODE_ENV
     });
   });
   ```

2. **Log Aggregation**
   ```javascript
   import winston from 'winston';
   
   const logger = winston.createLogger({
     level: process.env.LOG_LEVEL || 'info',
     format: winston.format.json(),
     transports: [
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
       new winston.transports.File({ filename: 'combined.log' })
     ]
   });
   
   if (process.env.NODE_ENV !== 'production') {
     logger.add(new winston.transports.Console({
       format: winston.format.simple()
     }));
   }
   ```

### Performance Monitoring

Consider integrating:
- **Sentry** - Error tracking and performance monitoring
- **New Relic** - Application performance monitoring
- **DataDog** - Infrastructure and application monitoring

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: |
        cd frontend && npm ci
        cd ../backend && npm ci
        
    - name: Run tests
      run: |
        cd frontend && npm run test
        cd ../backend && npm run test
        
    - name: Build frontend
      run: cd frontend && npm run build

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "your-app-backend"
        heroku_email: "your-email@example.com"
        appdir: "backend"

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID}}
        vercel-project-id: ${{ secrets.PROJECT_ID}}
        working-directory: ./frontend
```

## 🚨 Troubleshooting

### Common Deployment Issues

1. **CORS Errors**
   - Verify frontend URL in backend CORS configuration
   - Check environment variables are properly set

2. **Socket.io Connection Issues**
   - Ensure WebSocket support on hosting platform
   - Check firewall rules for WebSocket traffic

3. **Build Failures**
   - Verify Node.js version compatibility
   - Check for missing environment variables

4. **Performance Issues**
   - Implement proper caching headers
   - Use CDN for static assets
   - Monitor server resources

### Debugging Tips

1. **Enable Debug Logging**
   ```javascript
   // Backend
   const debug = require('debug')('chess:server');
   debug('Server starting on port %d', port);
   
   // Socket.io debugging
   localStorage.debug = 'socket.io-client:socket';
   ```

2. **Health Checks**
   ```bash
   # Test backend health
   curl https://your-backend.com/health
   
   # Test WebSocket connection
   wscat -c wss://your-backend.com
   ```

This deployment guide should help you successfully deploy the Two Player Chess application to production environments. Choose the platform that best fits your needs and follow the specific instructions for your chosen deployment target.