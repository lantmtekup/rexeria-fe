# Tài liệu lưu hành nội bộ trong công ty Tekup JSC

# Hướng dẫn sử dụng kiến trúc deploy

## 1. Giải thích các loại file ENV

1. .env - File env để sử dụng chạy trực tiếp dự án, không thông qua docker hoặc chạy với file docker-compose.local.yml, mỗi khi start dự án thường copy file .env.example để tạo ra file .env,
2. .env.dev - File env để sử dụng khi deploy với file docker-compose.dev.yml, hiện tại khi deploy lên k8s dev sẽ phải luôn đảm bảo file .env.dev được config đúng, đủ biến môi trường để chạy
3. .env.prod - File env để sử dụng khi deploy với file docker-compose.prod.yml, phải luôn đảm bảo file .env.prod được config đúng, đủ biến môi trường để chạy

## 2. Giải thích các loại file docker-compose

1. docker-compose.local.yml - File docker-compose dùng để start dev ở máy tính cá nhân khi code
2. docker-compose.dev.yml - File docker-compose dùng để deploy dự án lên k8s dev
3. docker-compose.prod.yml - File docker-compose dùng để deploy dự án lên môi trường prod

## 3. Giới thiệu các bước khi triển khai

Tương ứng với mỗi môi trường deploy sẽ có 1 cách khởi tạo riêng, vậy nên chúng ta cần biết chúng ta đang thiết lập deploy cho môi trường nào để chọn cách thích hợp

1. Môi trường local - máy tính cá nhân của developer
2. Môi trường dev - server dev hoặc k8s dev
3. Môi trường prod - server prod

### 3.1. Lần đầu khởi tạo

Mỗi khi lần đầu tiên pull code về server, máy tính thì cần thực hiện bước này đầu tiên.

#### 3.1.1. Môi trường local

```
cp .env.example .env
bash infra/init-first-setup-local.sh
```

#### 3.1.2. Môi trường dev

```
cp .env.example .env.dev
bash infra/init-first-setup-dev.sh
```

#### 3.1.3. Môi trường prod

```
cp .env.example .env.prod
bash infra/init-first-setup-prod.sh
```

### 3.2. Khởi động, khởi chạy, làm mới

Mỗi khi bạn cần chạy lại service docker-compose này nhưng không phải là lần đầu tiên setup, ví dụ khi cần deploy code mới được merge lên server sẽ sử dụng bước này, hoặc sau khi chạy bước khởi tạo sẽ có thể chạy lại bước này

#### 3.2.1. Môi trường local

```
bash infra/start-dev.sh
```

#### 3.2.2. Môi trường dev

```
bash infra/start-dev.sh
```

#### 3.2.3. Môi trường prod

```
bash infra/start-prod.sh
```

### 3.3. Khởi động lại

Mỗi khi bạn chỉ cần khởi động lại service mà không cần build image code mới, thì dùng bước này.

#### 3.3.1. Môi trường local

```
bash infra/restart-local.sh
```

#### 3.3.2. Môi trường dev

```
bash infra/restart-dev.sh
```

#### 3.3.3. Môi trường prod

```
bash infra/restart-prod.sh
```

### 3.4. Dừng, chấm dứt

Mỗi khi bạn chỉ cần stop service mà không cần build image code mới, không cần restart, thì dùng bước này.

#### 3.3.1. Môi trường local

```
bash infra/stop-local.sh
```

#### 3.3.2. Môi trường dev

```
bash infra/stop-dev.sh
```

#### 3.3.3. Môi trường prod

```
bash infra/stop-prod.sh
```

### 3.5. Dừng, chấm dứt

Mỗi khi bạn chỉ cần build service image mà push lên docker hub, hoặc không cần restart, shutdown service thì dùng bước này

#### 3.5.1. Môi trường local

```
bash infra/build-local.sh
```

#### 3.5.2. Môi trường dev

```
bash infra/build-dev.sh
```

#### 3.5.3. Môi trường prod

```
bash infra/build-prod.sh
```

## 4. Giải thích file docker-compose

Có một vài điều lưu ý khi chỉnh sửa docker-compose file để tùy dự án chúng ta có thể dễ dàng kiểm soát

### 4.1. Network - mạng

```
    network_mode: bridge
    extra_hosts:
      - 'host.docker.internal:host-gateway'
```

2 dòng trên sẽ thực hiện việc mapping địa chỉ domain host.docker.internal thành ip của hostmachine. Để truy cập đến 1 service ip khác đã được expose - export ra bên ngoài thì chỉ cần dùng domain trên kia.

Ví dụ: Để config service A kết nối đến mysql thì trong file env của image A chúng ta sử dụng hostname sau cho việc connect service A tới mysql `host.docker.internal:3306`

### 4.2. Health check - Kiểm tra sức khỏe

```
    healthcheck:
      test: ['CMD', 'curl', '--fail', 'http://localhost']
      interval: 10s
      start_period: 30s
      retries: 5
```

Cài đặt trên sẽ định kỳ kiểm tra trạng thái sức khỏe của service A, lệnh curl sẽ được thực thi bên trong docker container, vậy nên ở đây sử dụng hostname là `localhost` hoặc `127.0.0.1` Có thể tùy chỉnh lại ở 1 số service đặc biệt
