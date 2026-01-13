FROM nginx:1.22.1
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY localhost+2.pem /etc/ssl/mycert.pem
COPY localhost+2-key.pem /etc/ssl/mykey.pem