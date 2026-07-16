FROM python:3.12-slim AS backend

WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ backend/

FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci 2>/dev/null || npm install
COPY frontend/ .
RUN npm run build

FROM python:3.12-slim AS production

RUN apt-get update && apt-get install -y nginx supervisor --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=backend /app/backend backend/
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

RUN pip install --no-cache-dir -r backend/requirements.txt

RUN rm -f /etc/nginx/sites-enabled/default

COPY <<'EOF' /etc/nginx/sites-available/matchday
server {
    listen 8080;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_http_version 1.1;
    }

    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "public, max-age=3600";
    }
}
EOF

RUN ln -sf /etc/nginx/sites-available/matchday /etc/nginx/sites-enabled/

COPY <<'EOF' /etc/supervisor/conf.d/matchday.conf
[program:uvicorn]
command = uvicorn backend.main:app --host 127.0.0.1 --port 8000 --workers 2
directory = /app
user = root
autostart = true
autorestart = true
stderr_logfile = /var/log/uvicorn.err.log
stdout_logfile = /var/log/uvicorn.out.log

[program:nginx]
command = nginx -g 'daemon off;'
user = root
autostart = true
autorestart = true
stderr_logfile = /var/log/nginx.err.log
stdout_logfile = /var/log/nginx.out.log
EOF

EXPOSE 8080

CMD ["supervisord", "-c", "/etc/supervisor/conf.d/matchday.conf"]
