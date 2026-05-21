# Biblioteca — Acervo de Estudo

Site para hospedar PDFs de livros do professor. Interface editorial minimalista, área admin protegida por senha, storage via Vercel Blob.

## Stack

- Next.js 14 (App Router)
- Vercel Blob (PDFs + catálogo)
- TypeScript
- CSS Modules (sem dependências de UI)

## Deploy na Vercel — passo a passo

### 1. Subir o código para um repositório

```bash
cd biblioteca
git init
git add .
git commit -m "Biblioteca inicial"
gh repo create biblioteca --private --source=. --push
```

Ou suba pelo GitHub Desktop / web.

### 2. Importar na Vercel

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Importe o repositório
3. **Não faça deploy ainda** — primeiro configure o storage e as env vars.

### 3. Criar o Blob Storage

1. No projeto da Vercel → aba **Storage** → **Create Database**
2. Escolha **Blob**
3. Nome: `biblioteca-pdfs` (qualquer um)
4. Conecte ao projeto — a variável `BLOB_READ_WRITE_TOKEN` é injetada automaticamente.

### 4. Configurar a senha de admin

Em **Settings → Environment Variables**, adicione:

| Nome             | Valor                                  |
| ---------------- | -------------------------------------- |
| `ADMIN_PASSWORD` | uma senha forte que só você sabe       |

### 5. Deploy

Clique em **Deploy**. Quando concluir:

- A URL pública (`/`) mostra o acervo.
- `/admin` pede a senha e abre o painel de gerenciamento.

## Como usar localmente

```bash
npm install
cp .env.example .env.local
# preencha ADMIN_PASSWORD e (opcional) BLOB_READ_WRITE_TOKEN
npm run dev
```

Para testar o Blob localmente, gere um token em **Storage → seu blob store → .env.local** na Vercel e cole no `.env.local`.

## Arquitetura

- **Catálogo**: arquivo `catalog.json` armazenado no próprio Blob. Sem banco de dados.
- **PDFs**: cada upload vira um blob público em `livros/{slug}.pdf`.
- **Auth**: cookie httpOnly com hash SHA-256 da senha (constante por ambiente). Suficiente para uso pessoal — não recomendado para múltiplos usuários.

## Limites

- 50MB por PDF (configurável em `app/api/upload/route.ts`)
- Vercel Hobby: 1GB grátis de Blob, depois pago.
- Free tier permite uploads via API route até 4.5MB pela borda; para acima disso, o `runtime = 'nodejs'` no `route.ts` resolve em ambiente serverless padrão (60s timeout).

## Estrutura

```
app/
  page.tsx                 # acervo público
  layout.tsx
  globals.css
  livro/[slug]/page.tsx    # leitor de PDF
  admin/page.tsx           # painel privado
  api/
    auth/route.ts          # login/logout
    upload/route.ts        # POST de novo livro
    books/route.ts         # DELETE livro
components/
  BookList.tsx             # lista com busca
  AdminPanel.tsx           # form de upload + gerenciar
  LoginForm.tsx
lib/
  books.ts                 # CRUD do catálogo
  auth.ts                  # senha/cookie
  types.ts
```
