# Armac — Trabalhe Conosco

Site de vagas da Armac: página pública com as vagas abertas (o candidato escolhe a
vaga, vê a descrição, e envia nome, e-mail, telefone e currículo em PDF ou imagem) +
painel administrativo com login para gerenciar cargos e ver os currículos recebidos.

Cores usadas: azul `#002A9B` e verde `#00A742`, extraídas do site oficial da Armac.

## O que você precisa (grátis)

- Conta no [Supabase](https://supabase.com) (banco de dados + login + armazenamento dos currículos)
- Conta no [GitHub](https://github.com) (guardar o código)
- Conta na [Vercel](https://vercel.com) ou [Netlify](https://netlify.com) (colocar o site no ar) — opcional, mas recomendado

---

## Passo 1 — Criar o projeto no Supabase

1. Entre em [supabase.com](https://supabase.com) e crie um novo projeto (escolha uma senha forte para o banco).
2. Depois que o projeto for criado, vá em **SQL Editor** → **New query**.
3. Abra o arquivo [`supabase/schema.sql`](./supabase/schema.sql) deste projeto, copie todo o conteúdo, cole no editor e clique em **Run**.
   - Isso cria as tabelas `cargos` e `candidaturas`, as regras de segurança (RLS), o bucket de armazenamento `curriculos` e já cadastra 2 vagas de exemplo (você pode editar ou apagar depois pelo painel).

4. Vá em **Project Settings → API** e copie:
   - **Project URL**
   - **anon public key**

## Passo 2 — Criar seu usuário administrador

Você (o admin) faz login com e-mail e senha, sem precisar de tela de cadastro:

1. No Supabase, vá em **Authentication → Users → Add user**.
2. Preencha seu e-mail e uma senha. Marque para confirmar o e-mail automaticamente (ou confirme pelo link enviado).
3. Pronto — esse e-mail/senha é o que você vai usar para entrar em `/admin`.

> Quer adicionar mais de um administrador? Repita esse passo para cada pessoa.

## Passo 3 — Rodar o projeto localmente (opcional, para testar antes de publicar)

```bash
npm install
cp .env.example .env
# edite o arquivo .env e cole a URL e a anon key do Supabase
npm run dev
```

Acesse `http://localhost:5173` para o site público e `http://localhost:5173/admin` para o painel.

## Passo 4 — Subir para o GitHub

```bash
git init
git add .
git commit -m "Primeira versão do site de vagas"
gh repo create armac-vagas --private --source=. --push
```

(Ou crie o repositório manualmente em github.com e siga as instruções de "push an existing repository".)

## Passo 5 — Publicar (Vercel, recomendado)

1. Entre em [vercel.com](https://vercel.com) → **Add New → Project** → selecione o repositório `armac-vagas`.
2. Em **Environment Variables**, adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Clique em **Deploy**. Em ~1 minuto o site está no ar com uma URL pública.
4. (Opcional) Configure um domínio próprio, como `vagas.armac.com.br`, em **Settings → Domains**.

---

## Como usar no dia a dia

- **Site público (`/`)**: lista as vagas ativas em formato de gaveta — o candidato clica, lê a descrição
  completa e clica em "Candidatar-se" para abrir o formulário. Também mostra um QR Code que aponta
  para a própria página, útil para colocar em cartazes/eventos.
- **Painel admin (`/admin`)**: faça login com o e-mail/senha criados no Passo 2.
  - Aba **Candidaturas**: veja todos os candidatos, filtre por vaga, e clique em "Ver currículo"
    para abrir o arquivo (o link é gerado na hora e expira em 60 segundos, por segurança).
  - Aba **Cargos**: crie, edite, ative/desative ou exclua vagas. Vagas desativadas somem do site
    público mas continuam com as candidaturas já recebidas.

## Estrutura do projeto

```
src/
  components/      componentes reutilizáveis (formulário de candidatura, gaveta de vaga, QR code...)
  pages/           Home (público), AdminLogin, AdminDashboard
  lib/supabase.js  conexão com o Supabase
supabase/schema.sql  script para criar tudo no banco de dados
```

## Segurança

- O formulário público só tem permissão para **enviar** candidaturas e **ler vagas ativas** —
  ele nunca consegue ler currículos de outras pessoas nem editar vagas.
- Somente usuários autenticados (criados no Passo 2) conseguem ver candidaturas, baixar
  currículos e gerenciar cargos, graças às políticas de Row Level Security configuradas no
  `schema.sql`.
