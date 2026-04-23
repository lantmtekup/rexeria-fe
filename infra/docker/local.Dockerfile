FROM tekupsolution/nextjsnode20ubuntunginx:latest AS development

WORKDIR /home/app

COPY package*.json ./

RUN pnpm

CMD ["pnpm", "dev"]
