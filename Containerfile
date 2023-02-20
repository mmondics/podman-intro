FROM docker.io/nginx:latest

LABEL description='This Containerfile will customize the parent nginx container image'

LABEL website='Cuyahoga Valley National Park'

ENV THIS_IS a_variable

EXPOSE 80

COPY default.conf /etc/nginx/conf.d/

COPY ./cuva /usr/share/nginx/html/

RUN ARCH=`dpkg --print-architecture` && \
    echo $ARCH > /tmp/container_arch && \
    CONTAINER_ARCH=$(cat /tmp/container_arch) && \
    sed -i "s|HOSTARCH|$CONTAINER_ARCH|g" /usr/share/nginx/html/index.html