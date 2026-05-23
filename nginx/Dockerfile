FROM nginx:1.22.1
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY security-headers.conf /etc/nginx/conf.d/security-headers.conf
COPY fullchain1.pem /etc/ssl/mycert.pem
COPY privkey1.pem /etc/ssl/mykey.pem
COPY robots.txt /robots.txt