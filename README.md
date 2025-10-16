node src/app.js

npm install express body-parser
npm install typeorm reflect-metadata sqlite3

# Barbershop API

Esta é uma API RESTful para gerenciar uma barbearia, incluindo funcionalidades para gerenciar barbeiros, clientes e agendamentos.

## 🚀 Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **TypeScript** - Superset tipado do JavaScript
- **Express.js** - Framework web para Node.js
- **TypeORM** - ORM para TypeScript e JavaScript
- **SQLite** - Banco de dados (padrão)
- **PostgreSQL** - Banco de dados (opcional, via Docker)
- **Docker** - Containerização da aplicação
- **Reflect Metadata** - Para decorators do TypeORM

## 📦 Instalação

### 🔧 Desenvolvimento Local (TypeScript)

1. Clone o repositório:
   ```bash
   git clone <repository-url>
   cd barbershop-api
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Execute em modo desenvolvimento:
   ```bash
   npm run dev
   ```

4. Build para produção:
   ```bash
   npm run build
   npm start
   ```

### 🐳 Docker (Recomendado)

1. **Opção 1 - SQLite simples:**
   ```bash
   npm run docker:compose:simple
   ```

2. **Opção 2 - PostgreSQL completo:**
   ```bash
   npm run docker:compose:up
   ```

3. **Build manual:**
   ```bash
   npm run docker:build
   npm run docker:run
   ```

A API estará disponível em `http://localhost:3000`.

## 🎯 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Executa em modo desenvolvimento
npm run dev:watch        # Executa com reload automático
npm run build            # Compila TypeScript

# Docker
npm run docker:build     # Constrói imagem Docker
npm run docker:run       # Executa container
npm run docker:stop      # Para container
npm run docker:clean     # Remove imagem

# Docker Compose
npm run docker:compose:simple    # SQLite
npm run docker:compose:up        # PostgreSQL
npm run docker:compose:down      # Para serviços
npm run docker:compose:logs      # Visualiza logs
```

## Endpoints da API

### Barbeiros

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/barbers` | Criar um novo barbeiro |
| `GET` | `/api/barbers` | Listar todos os barbeiros |
| `GET` | `/api/barbers/:id` | Buscar um barbeiro por ID |
| `PUT` | `/api/barbers/:id` | Atualizar um barbeiro por ID |
| `DELETE` | `/api/barbers/:id` | Excluir um barbeiro por ID |

**Exemplo de POST /api/barbers:**
```json
{
  "name": "João Silva",
  "email": "joao@barbearia.com",
  "phone": "11999999999"
}
```

### Clientes

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/clients` | Criar um novo cliente |
| `GET` | `/api/clients` | Listar todos os clientes |
| `GET` | `/api/clients/:id` | Buscar um cliente por ID |
| `PUT` | `/api/clients/:id` | Atualizar um cliente por ID |
| `DELETE` | `/api/clients/:id` | Excluir um cliente por ID |

**Exemplo de POST /api/clients:**
```json
{
  "name": "Carlos Souza",
  "email": "carlos@email.com",
  "phone": "11888888888"
}
```

### Agendamentos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/schedules` | Criar um novo agendamento |
| `GET` | `/api/schedules` | Listar todos os agendamentos |
| `GET` | `/api/schedules/:id` | Buscar um agendamento por ID |
| `PUT` | `/api/schedules/:id` | Atualizar um agendamento por ID |
| `DELETE` | `/api/schedules/:id` | Excluir um agendamento por ID |

**Exemplo de POST /api/schedules:**
```json
{
  "barberId": 1,
  "clientId": 2,
  "appointmentTime": "2025-10-15T14:30:00"
}
```

**Resposta dos agendamentos:**
```json
{
  "id": 7,
  "appointmentTime": "15/10/2025 14:30",
  "barberId": 1,
  "barberName": "João Silva",
  "clientId": 2,
  "clientName": "Carlos Souza"
}
```

## 📁 Estrutura do Projeto

```
barbershop-api/
├── Dockerfile                    # Multi-stage build otimizado
├── docker-compose.yml            # PostgreSQL + pgAdmin
├── docker-compose.simple.yml     # Apenas SQLite
├── .dockerignore                 # Otimização de build
├── package.json                  # Scripts e dependências
├── tsconfig.json                 # Configuração TypeScript
├── README.md
├── ormconfig.js
├── barbershop.sqlite             # Banco SQLite (desenvolvimento)
└── src/ (TypeScript)
    ├── app.ts                    # Express + inicialização
    ├── data-source.ts            # Configuração TypeORM
    ├── controllers/              # Lógica dos endpoints (tipados)
    │   ├── barberController.ts
    │   ├── clientController.ts
    │   └── scheduleController.ts
    ├── entity/                   # Entidades TypeORM (decorators)
    │   ├── Barber.ts
    │   ├── BarberProfile.ts
    │   ├── Client.ts
    │   └── Schedule.ts
    ├── middleware/               # Middleware Express (tipados)
    │   ├── errorHandler.ts
    │   └── validation.ts
    ├── routes/                   # Rotas Express (ES6 imports)
    │   ├── barberRoutes.ts
    │   ├── clientRoutes.ts
    │   └── scheduleRoutes.ts
    └── services/                 # Lógica de negócio (Repository pattern)
        ├── BarberService.ts
        ├── ClientService.ts
        └── ScheduleService.ts
```

## ✨ Funcionalidades

### 🔧 API Features
- ✅ **Gerenciamento de Barbeiros**: CRUD completo com validações
- ✅ **Gerenciamento de Clientes**: CRUD completo com validações
- ✅ **Agendamentos**: CRUD completo com validações de negócio
- ✅ **Relacionamento 1-1**: Barbeiros têm perfis detalhados
- ✅ **Transferência de Agendamentos**: Entre barbeiros
- ✅ **Formatação de datas**: Padrão brasileiro (DD/MM/AAAA HH:MM)
- ✅ **Relações**: Agendamentos mostram barbeiro e cliente completos

### 🛡️ Validações de Negócio
- ✅ **Horário Comercial**: Agendamentos apenas 8h-18h
- ✅ **Disponibilidade**: Barbeiros não podem ter conflitos
- ✅ **Antecedência**: Cancelamento mínimo 2h antes
- ✅ **Email Único**: Barbeiros e clientes únicos por email
- ✅ **IDs Numéricos**: Validação de parâmetros de rota

### 🏗️ Arquitetura
- ✅ **TypeScript**: Tipagem forte em toda aplicação
- ✅ **Camada Service**: Lógica de negócio separada
- ✅ **Middleware Global**: Tratamento de erros padronizado
- ✅ **Repository Pattern**: Acesso a dados via TypeORM
- ✅ **Docker**: Containerização com multi-stage build
- ✅ **Multi-Database**: SQLite (dev) + PostgreSQL (prod)

## 🌍 Variáveis de Ambiente

```bash
# Aplicação
NODE_ENV=production
PORT=3000

# SQLite (padrão)
DB_TYPE=sqlite
DB_DATABASE=/app/data/barbershop.sqlite
DB_SYNCHRONIZE=true

# PostgreSQL (opcional)
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=barbershop
DB_PASSWORD=barbershop123
DB_DATABASE=barbershop
```

## Licença

Este projeto está licenciado sob a licença MIT.

## Licença

Este projeto está licenciado sob a licença **MIT**.

---

Quer que eu adicione também uma seção “Tecnologias utilizadas” (ex: Node.js, Express, etc.) antes da licença? Isso deixa o README mais completo.


1. Quais endpoints usar?
Barbeiros:
POST http://localhost:3000/api/barbers
GET http://localhost:3000/api/barbers
Clientes:
POST http://localhost:3000/api/clients
GET http://localhost:3000/api/clients
Agendamentos:
POST http://localhost:3000/api/schedules
GET http://localhost:3000/api/schedules
2. Qual JSON enviar?
Barbeiro (POST /api/barbers)
Veja o arquivo src/models/barber.js para saber os campos obrigatórios.
Se não existir, normalmente é algo assim:

{
  "name": "João Silva",
  "email": "joao@barbearia.com",
  "phone": "11999999999"
}

Cliente (POST /api/clients)
Veja o arquivo src/models/client.js para os campos obrigatórios.
Exemplo comum:

{
  "name": "Carlos Souza",
  "email": "carlos@email.com",
  "phone": "11888888888"
}

Agendamento (POST /api/schedules)
Veja o arquivo src/models/schedule.js:

{
  "barberId": "COLE_AQUI_O_ID_DO_BARBEIRO",
  "clientId": "COLE_AQUI_O_ID_DO_CLIENTE",
  "appointmentTime": "2025-10-10T14:00:00.000Z"
}

barberId (ObjectId do barbeiro)
clientId (ObjectId do cliente)
appointmentTime (data/hora)
Exemplo:

3. Como saber os campos obrigatórios?
Abra os arquivos em src/models/ (por exemplo, barber.js, client.js, schedule.js).
No schema Mongoose, os campos com required: true são obrigatórios.

esumo dos papéis de cada pasta/arquivo
app.js: Inicializa o Express, middleware, rotas e conexão com o banco.
controllers/: Funções que recebem as requisições e respondem (CRUD).
models/: Schemas do Mongoose (MongoDB).
Quando migrar para TypeORM, crie as entidades em entity/ e remova os models.
entity/: (Para TypeORM) Define as entidades/tabelas do banco relacional.
routes/: Define os endpoints e liga cada rota ao controller correspondente.
utils/db.js: Faz a conexão com o banco de dados (MongoDB ou, futuramente, TypeORM).