# Site oficial — Antonio Freitas

Site estático em HTML, CSS e JavaScript, pronto para GitHub e Cloudflare Pages.

## Arquivos
- `index.html`: conteúdo e links
- `style.css`: visual e responsividade
- `script.js`: menu mobile e ano automático
- `assets/logo-antonio-freitas.png`: logo

## Publicar no Cloudflare Pages
1. Envie todos os arquivos e a pasta `assets` para a raiz do repositório GitHub.
2. Cloudflare > Workers & Pages > Create > Pages > Connect to Git.
3. Selecione o repositório e a branch `main`.
4. Framework preset: `None`; Build command: deixar vazio; Build output directory: `/`.
5. Publique. Não use `npx wrangler deploy` para este site estático.

## Editar
Altere textos e links no `index.html`. Substitua a imagem na pasta `assets` mantendo o nome, se desejar.

**Observação:** a agenda e galeria estão com textos provisórios, sem datas ou fotos inventadas. O site não possui painel administrativo ou backend.
