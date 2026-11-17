FROM node:24-bookworm-slim AS build
WORKDIR /cobranca-service-INFISICAL

# Dependências necessárias ao Prisma
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        openssl \
        ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código-fonte
COPY . .

# Gerar Prisma Client com variável temporária
RUN DATABASE_URL="placeholder" npx prisma generate && \
    npm run build && \
    find dist -name "main.js"

# Configuração da aplicação
ENV NODE_ENV=development
ENV PORT=7544

EXPOSE 7544

# Executa diretamente o JavaScript compilado (main.js)
CMD ["npm", "run", "start:prod"]
