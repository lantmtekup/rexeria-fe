FROM tekupsolution/nextjsnode20ubuntunginx:latest AS builder

WORKDIR /home/app

COPY . .

RUN ls -liahS && mv .env.prod .env

RUN yarn

RUN yarn run build

# RUN pnpm run build-sitemap

FROM tekupsolution/nextjsnode20ubuntunginx:latest AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /home/app

COPY package*.json .env.prod ./
RUN yarn --production \
  && rm -rf /etc/nginx/sites-enabled/default \
  && mv .env.prod .env

# If you are using a custom next.config.js file, uncomment this line.
# COPY --from=builder /home/app/tailwind.config.ts ./
COPY --from=builder /home/app/next.config.ts ./
COPY --from=builder /home/app/.next ./.next
COPY --from=builder /home/app/public ./public

COPY infra/docker/nginx.conf /etc/nginx/conf.d/default.conf
