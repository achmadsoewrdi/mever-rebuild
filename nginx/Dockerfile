# ============================================================
# STAGE 1: Builder
# Compile Nginx dari source + tambahkan Kaltura VOD Module
# ============================================================
FROM alpine:3.18 AS builder

ENV NGINX_VERSION=1.25.3
ENV VOD_MODULE_VERSION=1.33

# Install semua tools yang dibutuhkan untuk compile
RUN apk add --no-cache \
    build-base \
    pcre-dev \
    zlib-dev \
    openssl-dev \
    libxml2-dev \
    libxslt-dev \
    wget

# Download source Nginx dan VOD Module
WORKDIR /tmp
RUN wget -q https://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz && \
    tar zxf nginx-${NGINX_VERSION}.tar.gz && \
    wget -q https://github.com/kaltura/nginx-vod-module/archive/refs/tags/${VOD_MODULE_VERSION}.tar.gz && \
    tar zxf ${VOD_MODULE_VERSION}.tar.gz

# Compile Nginx + VOD Module
WORKDIR /tmp/nginx-${NGINX_VERSION}
RUN ./configure \
    --prefix=/etc/nginx \
    --sbin-path=/usr/sbin/nginx \
    --modules-path=/usr/lib/nginx/modules \
    --conf-path=/etc/nginx/nginx.conf \
    --error-log-path=/var/log/nginx/error.log \
    --http-log-path=/var/log/nginx/access.log \
    --pid-path=/var/run/nginx.pid \
    --lock-path=/var/run/nginx.lock \
    --with-http_ssl_module \
    --with-http_v2_module \
    --with-threads \
    --with-cc-opt="-O3" \
    --add-module=../nginx-vod-module-${VOD_MODULE_VERSION} \
    && make -j$(nproc) \
    && make install

# ============================================================
# STAGE 2: Final Image
# Hanya copy binary Nginx - hasilnya image ringan & bersih
# ============================================================
FROM alpine:3.18

RUN apk add --no-cache \
    pcre \
    zlib \
    openssl \
    libxml2 \
    libxslt \
    tzdata

COPY --from=builder /usr/sbin/nginx /usr/sbin/nginx
COPY --from=builder /etc/nginx /etc/nginx

RUN mkdir -p /var/log/nginx /var/cache/nginx /var/run

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
