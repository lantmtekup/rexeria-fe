FROM tekupsolution/nextjsnode20ubuntunginx:latest AS builder

WORKDIR /home/app

COPY . .

RUN ls -liahS && mv .env.stg .env

# RUN pnpm config set auto-install-peers true && pnpm config set strict-peer-dependencies false && pnpm i
RUN yarn

RUN yarn run build

# RUN yarn run build-sitemap


FROM tekupsolution/nextjsnode20ubuntunginx:latest AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /home/app

COPY package*.json .env.stg ./
# RUN pnpm config set auto-install-peers true && pnpm config set strict-peer-dependencies false && pnpm i --production \
RUN yarn --production \
    && rm -rf /etc/nginx/sites-enabled/default \
    && mv .env.stg .env

# If you are using a custom next.config.js file, uncomment this line.
# COPY --from=builder /home/app/tailwind.config.ts ./
COPY --from=builder /home/app/next.config.ts ./
COPY --from=builder /home/app/.next ./.next
COPY --from=builder /home/app/public ./public


COPY infra/docker/nginx.conf /etc/nginx/conf.d/default.conf
