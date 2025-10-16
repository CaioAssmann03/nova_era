# Multi-stage build para otimizar o tamanho da imagem final
FROM node:18-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependências (incluindo devDependencies para build)
RUN npm ci --only=production=false

# Copiar código fonte
COPY src/ ./src/

# Compilar TypeScript para JavaScript
RUN npm run build

# Remover devDependencies
RUN npm prune --production

# Estágio final - imagem menor
FROM node:18-alpine AS production

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S barbershop -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Copiar apenas arquivos necessários do estágio de build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Criar diretório para banco SQLite e dar permissões
RUN mkdir -p /app/data && chown -R barbershop:nodejs /app

# Mudar para usuário não-root
USER barbershop

# Expor porta da aplicação
EXPOSE 3000

# Definir variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000

# Health check para verificar se a aplicação está funcionando
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/barbers || exit 1

# Comando para iniciar a aplicação
CMD ["node", "dist/app.js"]