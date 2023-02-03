FROM nginx:latest

COPY default.conf /etc/nginx/conf.d/
COPY ./cuva /usr/share/nginx/html/
# COPY national-park /usr/share/nginx/html/

