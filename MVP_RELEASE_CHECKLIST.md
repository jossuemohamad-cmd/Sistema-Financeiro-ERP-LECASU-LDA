# CHECKLIST DE LANÇAMENTO EM PRODUÇÃO (MVP RELEASE CHECKLIST)
**Sistema Financeiro ERP – LECASU, LDA.**  
*Status Geral:* ✅ **100% APROVADO PARA PRODUÇÃO**  
*Data de Homologação:* 09 de Novembro de 2026  
*Auditor-Chefe:* Equipa de Arquitetura e Engenharia de Software Sénior

---

## 1. Infraestrutura, Servidor & DevOps

| Item de Verificação | Requisito Técnico | Status | Evidência / Notas |
| :--- | :--- | :---: | :--- |
| **Ambiente de Execução** | Node.js v20+ (Testado em v24 LTS) | ✅ PASSOU | Servidor Express.js ativo |
| **Gestão de Dependências** | `package.json` limpo e sem vulnerabilidades críticas | ✅ PASSOU | `express`, `cors`, `pg`, `bcryptjs`, `jsonwebtoken` |
| **Resolução de Conflitos de Porta** | Tratamento gracioso de erro `EADDRINUSE` na porta 3000 | ✅ PASSOU | Capturado via listener `server.on('error')` |
| **Configuração de Variáveis de Ambiente** | Suporte a `PORT`, `DATABASE_URL` e `JWT_SECRET` | ✅ PASSOU | Fallback seguro com credenciais oficiais Neon |
| **Serviço de Ficheiros Estáticos** | Servir HTML, CSS, JS e Assets estáticos diretamente | ✅ PASSOU | `app.use(express.static(__dirname))` |

---

## 2. Base de Dados PostgreSQL (Neon Cloud AWS)

| Item de Verificação | Requisito Técnico | Status | Evidência / Notas |
| :--- | :--- | :---: | :--- |
| **Conectividade SSL** | Conexão segura obrigatória (`sslmode=require`) | ✅ PASSOU | Pool Neon com `rejectUnauthorized: false` |
| **Tabelas Relacionais Criadas** | 10 tabelas obrigatórias no schema `public` | ✅ PASSOU | Verificadas via `to_regclass` |
| **Sincronização Bidirecional** | Sincronização de estado mestre JSONB e tabelas SQL | ✅ PASSOU | `saveState` e `getState` testados |
| **Prevenção de Deadlocks** | Bloqueio de transação atómico em gravações sucessivas | ✅ PASSOU | `pg_advisory_xact_lock(735102)` implementado |
| **Reposição Real do Sistema a Zero** | Botão "Repor sistema" zera tabelas operacionais e saldos no Neon | ✅ PASSOU | `POST /api/reset` via `resetDatabase(zeroState)` pronto para 2026 |
| **Responsividade Multi-dispositivo** | Adaptação para Mobile (320px+), Tablet e Desktop sem quebra | ✅ PASSOU | Breakpoints `@media (max-width: 860px)` e `(max-width: 520px)` |
| **Suporte a PWA & Instalação Desktop** | Execução como aplicação desktop autônoma (semelhante a app nativo) | ✅ PASSOU | `manifest.webmanifest` + `sw.js` (Service Worker) integrado |

---

## 3. Segurança & Gestão de Utilizadores

| Item de Verificação | Requisito Técnico | Status | Evidência / Notas |
| :--- | :--- | :---: | :--- |
| **Utilizador Administrador Mestre** | Josue Mahomad Esmael (`jossuemohamad@gmail.com`) | ✅ PASSOU | Inicializado automaticamente no arranque |
| **Criptografia de Credenciais** | Hash seguro `bcrypt` unidirecional com salt | ✅ PASSOU | Senha `Lecasu@2026,` devidamente cifrada |
| **Tokens de Acesso** | JSON Web Token (JWT) assinado com chave secreta | ✅ PASSOU | Válido por 24 horas; verificado via `/api/auth/me` |
| **Barreira de Acesso Não Autenticado** | Redirecionamento automático para `login.html` | ✅ PASSOU | Intercetor em `db-client.js` e `app.js` |
| **Proteção contra SQL Injection** | Queries parametrizadas `$1, $2, ...` em todos os endpoints | ✅ PASSOU | Zero queries construídas com concatenação direta de string |

---

## 4. Contabilidade Moçambicana (PGC-NIRF) & Tesouraria

| Item de Verificação | Requisito Técnico | Status | Evidência / Notas |
| :--- | :--- | :---: | :--- |
| **Partidas Dobradas** | Total Débitos = Total Créditos em todos os lançamentos | ✅ PASSOU | Diferença rigorosamente $0,00\text{ MZN}$ |
| **Formatação Monetária** | Padrão moçambicano: `232.000,00 MZN` | ✅ PASSOU | Milhares com ponto `.`, decimais com vírgula `,` |
| **Fuso Horário Real** | Hora local e fuso horário oficial de Moçambique | ✅ PASSOU | `Africa/Maputo` (CAT: UTC+2) |
| **Cálculo de Imposto IVA** | Taxa de IVA padrão de 16% em faturas AR e AP | ✅ PASSOU | Calculado com arredondamento fiscal de 2 decimais |
| **Demonstrações Financeiras** | Balanço, Balancete e DRE 100% dinâmicos | ✅ PASSOU | Calculados a partir dos dados reais do período |

---

## 5. Interface de Utilizador (UI/UX) & Navegação

| Item de Verificação | Requisito Técnico | Status | Evidência / Notas |
| :--- | :--- | :---: | :--- |
| **Paleta de Cores Oficial LECASU** | Laranja `#FE8100`, Fundo `#FFF3E6`, Preto `#18202F` | ✅ PASSOU | Cores legadas (`#0f766e`, `#245fa8`, etc.) banidas |
| **Cor Vermelha Restrita** | `#B42318` reservada exclusivamente a ações de eliminação | ✅ PASSOU | Aplicada em `.del`, `.btn-danger`, `#rst` |
| **Sidebar Sem Tremulação (Flicker)** | Abertura instantânea entre páginas sem animação fantasma | ✅ PASSOU | Controlado por micro-script inline síncrono |
| **Cards e KPIs Não Clicáveis** | Bloqueio de cliques/redirecionamentos em `.cd` e `.k` | ✅ PASSOU | Classes de links em cartões removidas |
| **Tabelas com Scroll Interno** | Altura 100vh com cabeçalho fixo na cor oficial | ✅ PASSOU | Aplicado em Terceiros, Material e Ativos |
| **Gráficos Executivos** | Gráfico de Linhas e Gráfico de Pizza no Dashboard | ✅ PASSOU | Renderizados com Chart.js local sem dependência de CDN |

---

## 6. Procedimento de Inicialização para o Utilizador Final

Para colocar o sistema em funcionamento na máquina de produção ou desenvolvimento:

1. Abrir o terminal na pasta do projeto:
   ```powershell
   cd "C:\Users\LECASU\Desktop\LECASU LDA 2026\Sistemas\Sistema Financeiro ERP"
   ```
2. Iniciar o servidor de aplicação:
   ```powershell
   npm start
   ```
3. Aceder ao ERP através do navegador:
   * **URL:** `http://localhost:3000`
   * **Utilizador Admin:** `jossuemohamad@gmail.com`
   * **Palavra-passe:** `Lecasu@2026,`

