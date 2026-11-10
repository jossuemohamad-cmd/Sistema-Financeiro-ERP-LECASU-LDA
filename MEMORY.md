# MEMÓRIA PERMANENTE E TREINAMENTO DO AGENTE IA (MEMORY.md)
**Sistema Financeiro ERP – LECASU, LDA. (Energy & Engineering Solutions)**

> 📌 **Objetivo deste Arquivo:**  
> Este documento funciona como a **memória de longo prazo** do agente IA no projeto. Ele consolida todo o aprendizado acumulado, preferências de design do utilizador, decisões de arquitetura e correções feitas ao longo do desenvolvimento. O agente consulta este arquivo obrigatoriamente antes de planejar ou executar qualquer tarefa.

---

## 1. Perfil da Empresa e Contexto Operacional

* **Empresa:** LECASU, LDA.
* **Segmento:** Soluções de Energia e Engenharia (*Energy and Engineering Solutions*).
* **Localização / Fuso:** Maputo, Moçambique (GMT+2 / CAT).
* **Sistema:** ERP de Gestão Financeira, Contabilística e Patrimonial Integrado.
* **Normativo Contábil:** PGC-NIRF (Plano Geral de Contabilidade com base nas Normas Internacionais de Relato Financeiro de Moçambique, Decreto n.º 70/2009).
* **Moeda Oficial:** Metical Moçambicano (`MZN`), taxa de câmbio e arredondamento a 2 casas decimais.
* **Taxa de IVA Padrão:** `16%` (Moçambique).
* **Segurança Social:** INSS Moçambique (3% encargo do trabalhador, 4% encargo patronal da empresa).

---

## 2. Aprendizados Críticos e Preferências do Utilizador (Learned Rules)

As regras abaixo resultam de correções diretas feitas pelo utilizador e são **de cumprimento estrito e inegociável**:

### A. Cores Oficiais da Marca e Proibições Visuais
1. **Identidade Oficial (do Logotipo LECASU):**
   * **Laranja Oficial LECASU:** `#FE8100` (cor primária `--ac`, botões principais, links ativos, abas ativas, destaques e gráficos).
   * **Laranja Suave de Fundo:** `#FFF3E6` (seleções, fundo sutil de abas ativas `--ab`, borda `--abb: #FED7AA`).
   * **Preto Grafite:** `#18202F` / `#000000` (textos de alto contraste, cabeçalhos e barras de categorias).
   * **Superfícies Neutras:** Fundo da aplicação `#F4F6F9`, superfícies brancas `#FFFFFF`, bordas `#E2E8F0`.
2. **Cores Antigas Proibidas:** Verde petróleo (`#0f766e`), azul royal (`#245fa8`), verde floresta (`#157347`) e amarelo mostarda (`#d9a21b`) foram removidos e **não devem ser reintroduzidos**.
3. **Vermelho Exclusivo para Ações Destrutivas:** A cor vermelha (`#B42318` com fundo `#FDE7E4`) é reservada **estritamente para botões de deletar/eliminar** (`.del`, `.btn-danger`, `#rst`), alertas de faturas vencidas e divergência contábil crítica.
4. **Zero Emojis:** Todos os ícones da interface devem ser obrigatoriamente elementos `<svg viewBox="0 0 24 24">` padronizados.

### B. Formatação Numérica e Monetária
* **Formatação Obrigatória:** Todo valor em dinheiro deve seguir estritamente o formato:
  $$\text{232.000,00 MZN}$$
  *(Separador de milhar: ponto `.`, separador decimal: vírgula `,`, sufixo: espaço + `MZN`)*.
* **Nunca exibir:** `MZN 232,000.00`, `232000.5 MZN` ou `232.000,5 MZN`. Sempre 2 casas decimais obrigatórias.

### C. Cards e KPIs (Estritamente Não-Clicáveis)
* **Cards e KPIs são informativos:** Nenhum card (`.cd`), KPI (`.k`) ou linha de tabela (`tr`) pode ser clicável ou disparar redirecionamento automático de página.
* **Proibição Total:** É proibido aplicar `data-href`, `.k-link`, `.cd-link`, `tr.row-link` ou interceptadores de clique em cards. Apenas botões intencionais e itens de notificação navegam.

### D. Barra Lateral (Sidebar) Sem Animação Fantasma
* **Problema Resolvido:** O movimento de "desencolher e encolher" ao navegar entre páginas ocorria devido a `transition` genérico no CSS somado ao carregamento assíncrono do estado.
* **Regra Mandatória:**
  * O elemento `aside` base **NÃO POSSUI** transição de largura.
  * A transição (`transition: width 0.25s...`) é restrita à classe `aside.animating`, aplicada exclusivamente durante o clique no `#toggle-sidebar`.
  * Toda página HTML deve conter o script síncrono inline logo no início de `<aside id="sidebar">`:
    ```html
    <script>try{if(localStorage.getItem('lecasu_sidebar_collapsed')==='1')document.getElementById('sidebar').classList.add('collapsed');}catch(e){}</script>
    ```

### E. Estabilidade de Rolagem Vertical (Sem "Movimento Estranho")
* **Prevenção de Scroll Fantasma:** Páginas com pouco conteúdo (como Configurações, Relatórios ou listagens curtas) devem caber perfeitamente na viewport sem barra de rolagem vertical.
* **Eliminação de Salto de Layout:** `html` deve ter `scrollbar-gutter: stable;` e `height: 100%;` para que o layout nunca salte horizontalmente ao alternar entre páginas com e sem scrollbar.
* **Diálogos Nativos:** Todo diálogo deve possuir `dialog:not([open]) { display: none !important; }`.

### F. Coluna de Ações Fixa na Rolagem Horizontal
* Em todas as tabelas com rolagem horizontal (`.sc`), a última coluna com os botões de ação (Editar e Apagar) fica **fixa à direita**:
  ```css
  th.col-actions, td.col-actions, th.ac, td.ac {
    position: sticky !important;
    right: 0 !important;
    z-index: 5;
    background: var(--cd);
    box-shadow: -3px 0 6px rgba(15, 23, 42, 0.08);
    border-left: 1px solid var(--bd) !important;
  }
  ```
* Os botões de ação ficam agrupados dentro do wrapper `<div class="actions-cell">`.

### G. Princípio de Edição Cirúrgica (Surgical Editing)
* **Nunca reescrever arquivos inteiros:** Altere apenas os trechos estritamente necessários.
* **Nunca ressuscitar textos removidos:** Se o utilizador pediu para remover um texto, bloco ou card (ex.: notas de rodapé redundantes, bloco de assinaturas, prefixos de código, fórmulas de saldo líquido), esse conteúdo **nunca deve ser reintroduzido** pelo agente em turns posteriores.

### H. Cor Oficial LECASU no Cabeçalho das Tabelas
* Todos os cabeçalhos de tabela (`th` e `th.col-actions`) usam a **cor primária oficial LECASU `#FE8100` (`var(--ac)`)** com texto branco em alta legibilidade (`#ffffff`), bordas de separação laranjas `#ff9d33` / `#e57400` e posição `sticky` no topo (`top: 0; z-index: 8;`).
* A coluna de ações no cabeçalho (`th.col-actions`) possui `z-index: 15;` e fundo sólido `#FE8100` para garantir que o texto das linhas nunca transpareça durante a rolagem horizontal e vertical.

### I. Layout Fixo 100vh com Scroll Interno nas Tabelas
* Nas telas com grande densidade de dados operacionais (**Cliente e Fornecedor**, **Material e Produtos**, e **Ativos e Inventários**):
  * O elemento `body` recebe a classe `.layout-fixed-100vh`.
  * A altura total da página fica travada em `100vh` (`overflow: hidden`).
  * O cabeçalho, KPIs e a barra de pesquisa/filtros ficam fixos no topo sem rolagem da página.
  * O container da tabela (`.sc`) assume o espaço restante (`flex: 1; min-height: 0; overflow: auto;`) com rolagem vertical e horizontal interna fluida.

### J. Ações de Backup e Restauro Exclusivas em Configurações
* Os botões de exportação, importação e reposição de dados (`Exportar Backup`, `Importar Backup`, `Repor dados`, `Imprimir`) foram **removidos do rodapé da sidebar** em todas as páginas do sistema.
* Essas ações agora residem **exclusivamente na tela de Configurações** (`configuracoes.html`), mantendo o menu lateral limpo e estritamente focado na navegação entre módulos.

### K. Nomenclatura Padronizada: "Material e Produtos"
* A aba e módulo de estoque são designados formalmente como **"Material e Produtos"** (sidebar, títulos, botões de inserção `+ Novo Material / Produto`, cabeçalhos de tabela e modais de cadastro).

### L. Ocultação de Fórmulas e Títulos Redundantes nas Abas
* A interface do utilizador deve priorizar clareza visual gerencial: fórmulas matemáticas explícitas (ex.: `Fórmula de Cálculo do Saldo Líquido`, percentuais em cabeçalhos de colunas como `INSS 3%`, referências a classes contábeis brutas como `(Classe 71/72)`) devem ser omitidas ou simplificadas para títulos diretos e legíveis (ex.: `INSS Trabalhador`, `INSS Empresa`, `Vendas e Serviços Prestados`).
* **Remoção de Títulos Redundantes em Financeiro:** Como as abas já identificam claramente cada seção (`Reconciliação bancária`, `Contas a Receber`, `Contas a Pagar`, `Terceiros`, `Plano de Contas`), os títulos `<h2>` redundantes dentro das barras de ação (`Movimentos do mês – ordem cronológica`, `Contas a receber – clientes`, `Contas a pagar – fornecedores`, `Ficheiro de terceiros...`, `Plano de Contas`) foram **removidos permanentemente**, mantendo a barra de ações limpa com os botões (`+ Novo movimento`, `+ Nova factura`, `+ Novo terceiro`, `+ Nova conta`), campo de pesquisa e controles de data.

### M. Gráficos Interativos no Dashboard (Chart.js via npm)
* Os antigos cards estáticos de barras horizontais (*Entradas e saídas do mês* e *Saídas por categoria*) foram substituídos por **dois gráficos interativos via Chart.js**:
  1. **Gráfico de Linha (Evolução de Fluxo):** Entradas (Laranja oficial `#FE8100`) vs. Saídas (Preto grafite `#18202F`) com preenchimento em gradiente translúcido suave, curvas `tension: 0.35` e tooltips estritamente formatados no padrão monetário oficial (`232.000,00 MZN`).
  2. **Gráfico de Pizza / Donut (Saídas por Categoria):** Distribuição percentual das categorias de custos com paleta oficial LECASU (`#FE8100`, `#18202F`, `#EA580C`, `#64748B`, `#F59E0B`), legenda lateral explicativa e tooltips com percentual e montante em MZN.
* **Gerenciamento com npm e Pacote Local:** O projeto possui `package.json` com dependência oficial de `chart.js` (`^4.4.7`), permitindo execução limpa de `npm install`, e mantém a cópia compilada `js/chart.umd.min.js` para execução direta no navegador.

### N. Navegação Sem Piscar e Estabilidade Visual Total (Estilo Photoshop / Explorador de Ficheiros)
1. **Navegação SPA Client-Side sem Recarregamento de Página:**  
   Ao clicar nos links da barra lateral (`#nav a` e `.brand-link`), o sistema interceta a navegação e executa a troca de telas instantaneamente via `navigateToPage(href)` e `history.pushState`. O frame da aplicação (sidebar, cabeçalho, relógio, clima, indicador Neon e perfil do usuário) permanece 100% estático, sem qualquer piscar de tela branca, recarregamento ou animação fantasma.
2. **Preservação de Nós DOM nas Abas:**  
   Ao alternar entre abas (ex.: em Finanças ou Relatórios), os botões de abas não são destruídos e recriados com `innerHTML`. Em vez disso, apenas a classe `.on` é alternada nos nós DOM existentes, eliminando qualquer tremulação.
3. **Proibição de `transition: all` e Transições de Layout:**  
   Transições genéricas `transition: all` ou `transition: transform` em botões, abas (`.pills button`, `.btn-sec`, `.btn-sm`) e cartões (`.k`) são proibidas, pois faziam elementos adjacentes deslizarem lateralmente e causavam efeito de tremor. Transições são restritas exclusivamente a cores (`background-color`, `border-color`, `color`).
4. **Substituição de `window.location.hash` por `history.replaceState`:**  
   A alteração de aba ativa nunca utiliza `window.location.hash = tab` (que causava salto vertical involuntário de rolagem do browser); utiliza-se `history.replaceState`.

### O. Datas e Períodos Dinâmicos (Janeiro a Dezembro / 2026, 2027 e Anos Seguintes)
* **Zero Datas Estáticas:** O sistema não possui datas ou meses travados no código. Todos os cálculos, balancetes, DRE, fluxos e folhas adaptam-se dinamicamente ao período selecionado.
* **Seletor de Período no Header Fixo:** Todas as páginas possuem o widget `.header-period-selector` permitindo alternar instantaneamente entre meses (**Janeiro a Dezembro** ou **Ano Completo**) e exercícios (**2026, 2027 a 2032**), permitindo a utilização a partir do próximo ano (2027) com anos seguintes sem qualquer fricção.
* **Valores Padrão Dinâmicos:** Ao criar novos movimentos, faturas ou registros, a data padrão do modal preenche-se automaticamente com base no período ativo (`getActivePeriod().refDate`).

### P. Persistência Integrada com Neon PostgreSQL
* **Base de Dados Central:** Conexão direta com a nuvem **Neon PostgreSQL** (AWS `us-east-2`, SSL obrigatório):
  * `postgresql://neondb_owner:npg_VOIEzcBv8ms9@ep-nameless-cake-bdoybgwr-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
  * Endpoint REST API: `https://ep-nameless-cake-bdoybgwr.apirest.c-8.us-east-2.aws.neon.tech/neondb/rest/v1`
* **Esquema de Tabelas:** `tb_usuarios`, `tb_lecasu_state` (JSONB mestre para recuperação de estado total), `tb_movimentos`, `tb_faturas_ar`, `tb_faturas_ap`, `tb_terceiros`, `tb_plano_contas`, `tb_material_produtos`, `tb_colaboradores`, `tb_ativos_inventario`.
* **Arquitetura Híbrida / Offline-First:** O cliente `js/db-client.js` sincroniza em tempo real com `server.js` (`POST /api/state`, `GET /api/state`) e mantém espelho no `localStorage`, garantindo zero latência na interface e funcionamento resiliente online/offline com badge de status (`.db-badge`) no topo de todas as páginas.

### Q. Autenticação Corporativa Real & Página de Login
* **Página Oficial de Acesso:** [`login.html`](file:///c:/Users/LECASU/Desktop/LECASU%20LDA%202026/Sistemas/Sistema%20Financeiro%20ERP/login.html) desenhada sob a identidade visual LECASU (`#FE8100`, `#18202F`, `#FFF3E6`).
* **Utilizador Administrador Inicial no Neon PostgreSQL:**
  * **Nome:** `Josue Mahomad Esmael`
  * **Email:** `jossuemohamad@gmail.com`
  * **Palavra-passe:** `Lecasu@2026,`
  * **Cargo / Perfil:** `Director Geral & Administrador` (`admin`)
  * **Segurança:** Senha criptografada com hash `bcrypt` (10 rounds) na tabela `tb_usuarios`.
* **Proteção de Rotas:** Utilizadores não autenticados são automaticamente redirecionados para `login.html`. Utilizadores autenticados acessam o ERP com token JWT seguro (`7 dias`), e o cabeçalho exibe o perfil do utilizador com botão de **"Sair" (Logout)** seguro.

### R. Fuso Horário Oficial (Africa/Maputo, CAT: UTC+2) e Tempo Real Dinâmico
* **Fuso Horário Obrigatório:** Todas as datas, relógio de segundos (`updateClock`) e períodos são computados e formatados no fuso horário oficial de Moçambique: `Africa/Maputo` (Central Africa Time - CAT, UTC+2).
* **Mês e Ano Atuais em Tempo Real:**
  * O sistema inicia por padrão no **Mês Atual**, **Data Atual** e **Ano Atual** em tempo real via `getRealTimeDate()`.
  * Se o utilizador desejar navegar para meses anteriores (ex.: Setembro de 2026) ou anos futuros (2027 a 2032), os seletores do topo permitem a troca dinâmica sem perda de dados.
* **Prevenção de Telas Brancas e Falhas de Carregamento:**
  * Nunca declarar identificadores globais repetidos (`const esc` vs `const _esc`) entre scripts independentes.
  * Todo bootstrap de página (`initDashboard()`, `initFinanceiro()`, etc.) utiliza detecção de prontidão de DOM universal (`document.readyState === "loading"` com fallback síncrono imediato), garantindo inicialização mesmo em carregamento assíncrono ou recarregamento pelo Live Server.
  * O `calc()` acumula os saldos de períodos anteriores, garantindo integridade de balanço contábil e impedindo divergências falsas ao trocar de mês.
  * Os gráficos (Chart.js) possuem guardas para períodos novos/vazios, exibindo linhas de base zeradas e donuts de estado vazio elegantes sem erros de renderização.

### S. Zerar / Repor o Sistema a Zero (Limpeza Real do Banco de Dados para 2026/2027)
* **Regra Fundamental de Reset:**  
  O utilizador determinou explicitamente que "Repor o sistema" **NÃO deve restaurar dados demo ou fictícios**. Em vez disso, deve **apagar completamente todos os registros operacionais** para que a empresa possa começar com tudo a ZERO (`0,00 MZN` de saldo bancário, 0 transações, 0 faturas AR/AP, 0 itens de estoque, 0 ativos, 0 colaboradores cadastrados).
* **Execução Segura no Neon PostgreSQL:**  
  O endpoint `POST /api/reset` e a função `resetDatabase(zeroState)` executam:
  1. `TRUNCATE TABLE tb_movimentos, tb_faturas_ar, tb_faturas_ap, tb_terceiros, tb_material_produtos, tb_colaboradores, tb_ativos_inventario;`
  2. Atualização dos saldos em `tb_plano_contas` para `0,00 MZN`;
  3. Atualização do estado JSONB mestre em `tb_lecasu_state` com um `zeroState` limpo;
  4. **Preservação Obrigatória do Administrador:** O usuário corporativo `Josue Mahomad Esmael` e o Plano Geral de Contas (PGC-NIRF) são preservados intactos;
  5. Sincronização e zeramento imediato do `localStorage` e emissão do sinal `BroadcastChannel` para zerar todas as abas abertas em tempo real.
* **Armazenamento de Novos Registros:**  
  Qualquer novo registro lançado pelo utilizador (novos movimentos, faturas, produtos ou bens) é persistido diretamente nas tabelas relacionais do Neon PostgreSQL e no snapshot de estado.

### T. Responsividade Completa (Mobile 320px, Tablet e Telas Grandes)
* **Design Fluid & Adaptativo:**
  * Em ecrãs pequenos (`@media (max-width: 860px)` e `@media (max-width: 520px)`), o menu de navegação `#nav` e a barra de filtros contam com rolagem horizontal suave por toque (`overflow-x: auto; -webkit-overflow-scrolling: touch;`).
  * O grid de KPIs ajusta-se automaticamente de `repeat(auto-fit, minmax(140px, 1fr))` para colunas legíveis em dispositivos móveis.
  * O layout fixo `100vh` converte-se em fluxo natural de rolagem vertical no mobile (`height: auto; overflow-y: auto;`) para acomodar teclados virtuais e formulários modais de até `95vw` sem cortes de conteúdo.

### U. PWA e Modo Aplicação Desktop (Instalação Como App)
* O sistema possui suporte nativo a Progressive Web App (PWA):
  * `manifest.webmanifest`: Ícones oficiais LECASU, modo `display: standalone`, tema `#FE8100` e orientação adaptável.
  * `sw.js`: Service Worker com cache-first para ativos estáticos e network-first para requisições de API REST. Permite instalar o ERP no Google Chrome / Edge como aplicativo de desktop autônomo, proporcionando uma experiência idêntica a um software nativo (estilo Photoshop / Explorador de Ficheiros).

### V. Importação e Atualização Inteligente via Excel (.xlsx, .xls, .csv)
* **Cobertura Integral dos 8 Módulos:**
  O sistema permite importar e atualizar dados em qualquer módulo do ERP:
  1. `mov`: Movimentos Bancários / Extrato (Tesouraria & Reconciliação);
  2. `ar`: Contas a Receber (Faturas de Clientes);
  3. `ap`: Contas a Pagar (Faturas de Fornecedores);
  4. `ter`: Clientes, Fornecedores e Terceiros;
  5. `materia`: Material e Produtos (Estoque de Equipamentos Solares);
  6. `rh`: Recursos Humanos (Colaboradores e Folha de Salários);
  7. `ativos`: Ativos e Inventários (Bens Patrimoniais Imobilizados);
  8. `pc`: Plano de Contas (PGC-NIRF).
* **Modos de Operação no Diálogo de Importação:**
  * **Importar novos e actualizar existentes (Upsert inteligente - Padrão):** Se um registo já existir (identificado por código, número de fatura, NUIT ou documento), os seus dados são atualizados com os valores da planilha. Se não existir, é criado um novo registo.
  * **Apenas adicionar novos (ignorar duplicados):** Preserva registos existentes intactos e apenas insere novos.
  * **Substituir todos os registos do módulo:** Zera o módulo selecionado e importa a planilha na íntegra.
* **Normalização Robusta de Dados:**
  * **Datas do Excel:** Reconhece números seriais do Excel (ex: `45575`), objetos Date e strings (`DD/MM/AAAA`, `AAAA-MM-DD`).
  * **Valores Numéricos:** Trata automaticamente moedas (`MZN`, `MT`), espaços, e formatos decimais com vírgula ou ponto.
* **Armazenamento e Execução 100% Local:**
  * A biblioteca SheetJS está gravada em `js/xlsx.full.min.js`, garantindo funcionamento offline sem depender de CDNs externas.
  * Ao concluir a importação, `saveData()` persiste os dados diretamente no **Neon PostgreSQL** e no `localStorage`.

### W. Design System e Tokens de Identidade Visual (idv.md Adaptado para o ERP)
* **Tipografia Moderna:** Integração de `"Plus Jakarta Sans"` para toda a interface de usuário (UI) e `"JetBrains Mono"` para valores monetários, tabelas financeiras, códigos de contas e referências.
* **Escala de Espaçamento Base 4px / 8px:**
  * `--space-1` (0.25rem / 4px), `--space-2` (0.5rem / 8px), `--space-3` (0.75rem / 12px), `--space-4` (1rem / 16px), `--space-5` (1.25rem / 20px), `--space-6` (1.5rem / 24px), `--space-8` (2rem / 32px), `--space-12` (3rem / 48px), `--space-16` (4rem / 64px).
* **Escala de Raios de Borda:**
  * `--radius-xs` (4px), `--radius-sm` (6px), `--radius-md` (10px - botões e inputs), `--radius-lg` (16px - cards), `--radius-xl` (24px - modais e login), `--radius-full` (9999px - badges e pílulas).
* **Elevação, Sombras e Brilho:**
  * `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--glow-button` (`0 0 16px rgba(254, 129, 0, 0.35)`).
* **Preservação Inegociável da Paleta LECASU:** As diretrizes estruturais de `idv.md` foram adotadas mantendo 100% intactas as cores oficiais da marca: Laranja `#FE8100`, fundo suave `#FFF3E6`, texto grafite `#18202F`, superfícies brancas `#FFFFFF` e fundo neutro `#F4F6F9`.

### X. Sincronização em Tempo Real e Prevenção de Ecrãs em Branco
* **Fuso Horário Oficial:** `Africa/Maputo` (CAT: GMT+2).
* **Mês e Ano Padrão:** O ERP inicializa dinamicamente no **Mês Atual** (`11` - Novembro), **Data Atual** (`10/11/2026`) e **Ano Atual** (`2026`). Nenhuma configuração estática de Setembro ('09') pode sobrepor o tempo real, exceto quando o usuário seleciona conscientemente outro mês no cabeçalho durante a sessão.
* **Relógio em Tempo Real:** O widget de relógio no cabeçalho (`#clock-time`) atualiza a cada segundo com a hora precisa de Maputo.
* **Blindagem Total Contra Nulos (Sanitization):**
  * Toda manipulação de estado passa por `sanitizeState(data)` em `js/data.js` e `js/db-client.js`.
  * `calc()`, `inv()`, `renderDashboardView()` e `setupGlobalListeners()` utilizam fallbacks defensivos (`S.mov || []`, `S.ar || []`, `S.ap || []`), impedindo qualquer `TypeError: S.mov is not iterable` ou quebra de renderização.
  * O seletor de período no cabeçalho inicializa imediatamente no mês e ano atuais sem depender da conclusão de requisições de rede.

---

## 3. Estrutura Modular do Projeto e Persistência

```
Sistema Financeiro ERP/
├── assets/
│   ├── favicon.png         # Favicon oficial (raio branco sobre fundo laranja)
│   ├── icon.png            # Ícone oficial para sidebar recolhida (138x136)
│   ├── logo.png            # Logotipo oficial colorido expandido (460x136)
│   └── logo-white.png      # Variação branca do logotipo oficial
├── css/
│   └── style.css           # Folha de estilos unificada (paleta oficial, sticky, layout)
├── db/
│   ├── schema.sql          # Esquema de tabelas DDL para o Neon PostgreSQL
│   ├── db.js               # Pool de conexão, migrações e persistência relacional
│   └── seed.js             # Semeador de dados iniciais do ERP no PostgreSQL
├── js/
│   ├── chart.umd.min.js    # Chart.js v4.4.7 compilado UMD (gráficos do Dashboard)
│   ├── db-client.js        # Cliente de sincronização em tempo real com Neon
│   ├── data.js             # Objeto SEED mestre e estado contábil inicial
│   ├── app.js              # Controlador operacional, CRUD, renderizadores e cálculos
│   └── xlsx.full.min.js    # Biblioteca SheetJS para importação de Excel
├── server.js               # Servidor Node Express + API REST Neon PostgreSQL
├── package.json            # Manifesto npm com dependências (chart.js, express, pg, cors)
├── dashboard.html          # Módulo 1: Visão Executiva e Tesouraria
├── financeiro.html         # Módulo 2: Reconciliação, Extrato, AR, AP, Plano de Contas
├── clientes-fornecedores.html # Módulo 3: CRUD de Clientes, Fornecedores e Estado
├── materia.html            # Módulo 4: Estoque de Materiais e Equipamentos Solares
├── rh.html                 # Módulo 5: Recursos Humanos e Folha de Salários Moçambique
├── ativos-inventarios.html # Módulo 6: Inventário Físico e Patrimonial de Bens
├── relatorios.html         # Módulo 7: Balancete PGC-NIRF, DRE, IVA 16%, Fluxo de Caixa
├── configuracoes.html      # Módulo 8: Parâmetros Corporativos, Fiscais e Backup
├── GEMINI.md               # Instruções mestras carregadas automaticamente pelo Antigravity
├── MEMORY.md               # Este arquivo de memória persistente e aprendizado
└── agentes.md              # Diretrizes operacionais e checklist técnico detalhado
```

### Camada de Armazenamento e Tempo Real:
* **Chave Mestre no `localStorage`:** `"lecasu-recon-v1"`
* **Chave de Estado da Sidebar:** `"lecasu_sidebar_collapsed"` (`"1"` ou `"0"`)
* **Canal de Sincronização Multi-Aba:** `new BroadcastChannel("lecasu_erp_channel")` combinado com listener `window.addEventListener("storage")`. Qualquer alteração salva atualiza imediatamente todas as outras abas abertas sem F5 manual.

---

## 4. Como Treinar o Agente e Como o Aprendizado Funciona

### Como o Antigravity Aprende:
1. **Carregamento Automático (`GEMINI.md`):**  
   No início de cada sessão ou conversa, o assistente Antigravity lê automaticamente o arquivo `GEMINI.md` na raiz do projeto. O `GEMINI.md` aponta diretamente para o `MEMORY.md`, fazendo com que todas as regras aqui gravadas sejam carregadas na memória ativa do modelo antes de gerar qualquer linha de código.
2. **Ciclo de Correção e Persistência:**  
   Quando o utilizador faz uma correção (por exemplo: *"não quero animação na sidebar"*, *"não coloque cards clicáveis"*), essa correção é formalizada e registrada neste arquivo na seção **2. Aprendizados Críticos e Preferências do Utilizador**.
3. **Comando Especial `/learn`:**  
   O utilizador pode utilizar o comando slash `/learn` no chat do Antigravity sempre que concluir uma solução ou correção importante. O agente automaticamente resumirá a lição aprendida e atualizará este `MEMORY.md`.

### Como Você (Utilizador) Pode Ensinar o Agente:
* **Para ensinar uma nova preferência:** Basta digitar no chat:  
  *"Aprende que a partir de agora [sua instrução] e salva na memória."*  
  O agente atualizará o `MEMORY.md` mantendo o histórico de preferências.
* **Para consultar o que o agente já aprendeu:** Basta perguntar:  
  *"O que tens guardado na memória sobre o projeto?"*
* **Para editar diretamente:** Você pode abrir o `MEMORY.md` a qualquer momento no seu editor e ajustar ou adicionar novas regras; no próximo comando, o agente já as adotará como regra de ouro.

