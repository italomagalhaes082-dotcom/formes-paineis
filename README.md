# Formes Painéis — Painel Gerencial das SPEs

Painel unificado (Jazz Exclusive · Bossa Nova · Liberty Unique) — HTML único parametrizado por `?emp=`.

- **Produção:** https://formes-paineis.netlify.app
- **Deploy:** automático via Netlify a cada push na branch `main`
- **Fontes de dados:** Google Sheets (transporte CSV via gviz), aba curada GESTAO VENDAS no Jazz
- **Antes de todo deploy:** `node tests/predeploy.js` — só publicar com "PODE PUBLICAR"
- **Testes:** `node tests/smoke4.js` (requer `npm i jsdom`) — 45 verificações nos 3 empreendimentos

Manutenção assistida por Claude (Anthropic). Carimbo de versão visível no cabeçalho do painel.
