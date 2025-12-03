# 🔐 Guia de Autenticação - Barbershop API

## 1. Registrar um Barbeiro

**Endpoint:** `POST /api/barbers`

```json
{
  "name": "João Silva",
  "email": "joao@barbearia.com",
  "password": "senha123",
  "phone": "11999999999"
}
```

**Resposta:**
```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@barbearia.com",
  "phone": "11999999999",
  "profile": null
}
```

---

## 2. Fazer Login - Barbeiro

**Endpoint:** `POST /api/auth/barber/login`

```json
{
  "email": "joao@barbearia.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@barbearia.com",
    "type": "barber"
  }
}
```

---

## 3. Registrar um Cliente

**Endpoint:** `POST /api/clients`

```json
{
  "name": "Carlos Souza",
  "email": "carlos@email.com",
  "password": "senha456",
  "phone": "11888888888"
}
```

**Resposta:**
```json
{
  "id": 1,
  "name": "Carlos Souza",
  "email": "carlos@email.com",
  "phone": "11888888888"
}
```

---

## 4. Fazer Login - Cliente

**Endpoint:** `POST /api/auth/client/login`

```json
{
  "email": "carlos@email.com",
  "password": "senha456"
}
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Carlos Souza",
    "email": "carlos@email.com",
    "type": "client"
  }
}
```

---

## 5. Usar o Token em Requisições Protegidas

Após fazer login, use o token retornado no header `Authorization`:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Exemplo - Criar Agendamento:**

```bash
POST /api/schedules
Authorization: Bearer <seu_token_aqui>
Content-Type: application/json

{
  "barberId": 1,
  "clientId": 1,
  "appointmentTime": "2025-12-10T14:00:00.000"
}
```

---

## 6. Possíveis Erros de Autenticação

| Código | Mensagem | Causa |
|--------|----------|-------|
| 400 | Email e senha são obrigatórios | Faltam campos |
| 404 | Barbeiro/Cliente não encontrado | Email não existe |
| 401 | Senha incorreta | Senha está errada |
| 401 | Token inválido ou expirado | Token expirou ou é inválido |
| 403 | Acesso restrito a barbeiros | Tenta acessar rota de barbeiro com token de cliente |

---

## 7. Validade do Token

- **Duração:** 7 dias
- **Tipo:** JWT (JSON Web Token)
- **Renovação:** Fazer login novamente para obter um novo token

---

## 8. Endpoints Públicos (Sem Token)

Estes endpoints não requerem autenticação:

- `POST /api/auth/barber/login` - Login do barbeiro
- `POST /api/auth/client/login` - Login do cliente
- `POST /api/barbers` - Registrar novo barbeiro (criar conta)
- `POST /api/clients` - Registrar novo cliente (criar conta)
- `GET /health` - Health check

---

## 9. Endpoints Protegidos

Requerem token no header `Authorization: Bearer <token>`:

- `GET /api/barbers` - Listar barbeiros
- `GET /api/barbers/:id` - Buscar barbeiro por ID
- `PUT /api/barbers/:id` - Atualizar barbeiro
- `DELETE /api/barbers/:id` - Deletar barbeiro
- `GET /api/clients` - Listar clientes
- `GET /api/clients/:id` - Buscar cliente por ID
- `PUT /api/clients/:id` - Atualizar cliente
- `DELETE /api/clients/:id` - Deletar cliente
- `POST /api/schedules` - Criar agendamento
- `GET /api/schedules` - Listar agendamentos
- `PUT /api/schedules/:id` - Atualizar agendamento
- `DELETE /api/schedules/:id` - Deletar agendamento

---

## 10. Testando no Insomnia/Postman

### Passo 1: Registre um barbeiro
```
POST http://localhost:3000/api/barbers
{
  "name": "João",
  "email": "joao@bar.com",
  "password": "123456",
  "phone": "11999999999"
}
```

### Passo 2: Faça login
```
POST http://localhost:3000/api/auth/barber/login
{
  "email": "joao@bar.com",
  "password": "123456"
}
```

### Passo 3: Copie o token retornado e use em outras requisições
```
Authorization: Bearer <token_copiado>
```

---

## 🔒 Segurança

- ✅ Senhas são criptografadas com bcryptjs
- ✅ Tokens JWT com validade de 7 dias
- ✅ Proteção contra acesso não autorizado
- ✅ Senhas nunca são retornadas nas respostas da API
