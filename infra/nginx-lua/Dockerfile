FROM openresty/openresty:alpine

# Cài đặt các gói cần thiết
RUN apk update && apk add --no-cache \
    git \
    build-base \
    curl \
    lua5.1 \
    luajit \
    lua5.1-dev \
    lua5.1-curl \
    wget

# Cài đặt luarocks
RUN wget https://luarocks.org/releases/luarocks-3.9.0.tar.gz && \
    tar zxpf luarocks-3.9.0.tar.gz && \
    cd luarocks-3.9.0 && \
    ./configure && \
    make && \
    make install


RUN apk update && \
apk add --no-cache \
ca-certificates


# Cài đặt lua-resty-http bằng luarocks
RUN luarocks install lua-resty-http

RUN luarocks install lua-cjson

# Cập nhật đường dẫn Lua
ENV LUA_PATH '/usr/local/openresty/lualib/?.lua;;'
ENV LUA_CPATH '/usr/local/openresty/lualib/?.so;;'

