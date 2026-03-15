FROM nginx:stable-alpine

WORKDIR /usr/share/nginx/html

COPY dist ./

# SPA history fallback + proxy /api to backend
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { try_files $uri $uri/ /index.html; } \
    location = /index.html { add_header Cache-Control "no-store, no-cache, must-revalidate"; } \
    location /static/ { expires 1y; add_header Cache-Control "public, immutable"; } \
    location /api { proxy_pass http://backend:3000; proxy_http_version 1.1; proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; proxy_set_header X-Forwarded-Proto $scheme; } \
    }' > /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
