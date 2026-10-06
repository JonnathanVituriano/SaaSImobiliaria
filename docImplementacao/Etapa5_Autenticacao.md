# Etapa 5 — Autenticação (Auth)

> [!NOTE]
> Esta etapa foi executada em 30/08/2026. A base de segurança da aplicação está pronta e a API está 100% protegida por padrão.

---

## O que foi feito

### 1. DTOs de Autenticação (Validação de Entrada e Saída) ✅
- `LoginDto`: Valida se o email e a senha (min. 6 caracteres) foram enviados no corpo da requisição corretamente usando `class-validator`.
- `TokenResponseDto`: Define o formato exato que será devolvido após um login bem-sucedido (contendo o `accessToken`, `refreshToken` e os dados do usuário).

### 2. AuthService (Regras de Negócio) ✅
- Localização do usuário usando o `PrismaService`.
- Verificação do status de ativação (`isActive`).
- Proteção contra **Brute Force**: caso o usuário erre a senha 5 vezes consecutivas, a conta é bloqueada por 15 minutos (`lockedUntil`).
- Checagem segura de senha contra o hash armazenado usando `bcrypt.compare`.
- Injeção das **Permissões** da role do usuário dentro do payload do JWT, permitindo verificações de acesso rápidas nas próximas etapas.
- Geração de `accessToken` e `refreshToken` usando a biblioteca `uuid` e o `JwtService`.

### 3. JWT Strategy & Guard ✅
- `JwtStrategy`: Trabalha junto com o Passport para extrair e ler automaticamente o `Bearer Token` do cabeçalho de Autorização, decifrando com o `JWT_SECRET`.
- `JwtAuthGuard`: Foi definido como **Guard Global** no `app.module.ts`. Isso significa que é impossível alguém acessar a API sem um token válido.

### 4. Decorators Utilitários ✅
- `@Public()`: Como o Guard bloqueou tudo, precisamos de uma forma de "abrir as portas" apenas para as rotas corretas. Aplicamos o `@Public()` no endpoint `/auth/login` para que os usuários consigam logar!
- `@CurrentUser()`: Quando o token é validado, ele fornece os dados que deciframos (como ID da Organização e as permissões). Este decorator nos permite acessar isso diretamente nos controladores das próximas etapas (ex: `@CurrentUser() user`).

---

## Novos Conceitos

| Conceito | Explicação |
|----------|---------|
| **Decorators Personalizados** | No NestJS podemos criar nossos próprios `@Algo`. Usamos a reflexão (`Reflector`) para ler metadados em tempo de execução e decidir coisas como "é público ou não?". |
| **Hash x Encriptação** | Usamos `bcrypt` que é um Hash de via única. A senha real *nunca* é recuperável, apenas comparada. O `JWT`, por outro lado, é codificado (Base64), ou seja, seu conteúdo pode ser lido por quem interceptá-lo (por isso nunca colocamos a senha dentro dele), mas ele não pode ser alterado, graças à assinatura secreta. |
| **ModuleResolution: nodenext** | Uma particularidade do ecossistema TypeScript atual (ESM) que exige que as importações relativas explicitem a extensão `.js` ao invés do caminho puro. Foi necessário adaptar a importação dos módulos após a geração via Nest CLI. |

---

## Próximo passo

**Etapa 6: Multi-tenancy Automático e Permissões.** — Vamos implementar a lógica que garante que o usuário A da imobiliária 1 nunca veja os dados da imobiliária 2, usando Prisma Extensions e Interceptors.

