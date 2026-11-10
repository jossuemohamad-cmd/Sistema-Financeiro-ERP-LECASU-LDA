# DIRETRIZES E REGRAS MANDATÓRIAS PARA AGENTES IA (agentes.md)

.\*\*

> ⚠️ **REGRA ZERO INEGOCIÁVEL PARA O AGENTE IA:**  
> O agente IA **DEVE OBRIGATORIAMENTE LER E SEGUIR ESTE ARQUIVO** antes de planejar, sugerir ou executar qualquer alteração em arquivos HTML, CSS ou JavaScript deste projeto.  
> Qualquer alteração deve respeitar integralmente a integridade contábil, as correções cirúrgicas, os padrões visuais e a arquitetura modular aqui especificados.

---

## 1. Princípios de Correção Cirúrgica (Surgical Editing)

1. **Modificações Pontuais e Cirúrgicas:**
   - Nunca reescreva ou substitua arquivos inteiros quando apenas um trecho precisa de ajuste.
   - Não remova classes CSS, IDs semânticos, atributos `data-*` ou funções existentes sem solicitação explícita.
   - Preserve nomes de chaves de armazenamento local (`localStorage`), em especial a chave mestre:
     ```javascript
     const KEY = "lecasu-recon-v1";
     ```
2. **Preservação de Integridade de Dados (`SEED` e Estado `S`):**
   - O objeto `SEED` no arquivo `js/data.js` é a base da contabilidade e gestão da empresa LECASU. Suas chaves mestras são:
     - `ini`, `ext`, `ref`, `bank`, `mov`, `ar`, `ap`, `ter`, `pc`, `notas` (Módulos Financeiro e Reconciliação).
     - `materia` (Gestão de Stock, Materiais e Matérias-Primas Solares).
     - `rh` (Quadro de Pessoal, Colaboradores e Folha de Salários).
     - `ativos` (Imobilizado, Activos Tangíveis e Amortizações).
     - `config` (Parâmetros da Empresa, Moeda, Taxa de IVA 16% e Exercício Fiscal).
   - Todas as páginas do ERP compartilham a mesma camada de dados persistente em tempo real (`localStorage` com a chave `lecasu-recon-v1`).
3. **Preservação Semântica do DOM:**
   - Sempre mantenha elementos com seus respectivos IDs operacionais: `#nav`, `#tabs`, `#main`, `#dlg`, `#dt`, `#df`, `#dc`, `#ds`, `#rst`, `#toast`.
   - Diálogos devem utilizar a tag nativa `<dialog id="dlg">` com acessibilidade para fechar com `Esc` ou botão `#dc`.

---

## 2. Padrões de Layout e Header Fixo

1. **Header Fixo (Sticky Header) & Widgets:**
   - O header da aplicação é **fixo no topo** (`position: sticky; top: 0; z-index: 50;`) e acompanha toda a navegação do utilizador.
   - Deve possuir fundo branco (`background: #ffffff;`), borda inferior sutil (`border-bottom: 1px solid var(--bd);`) e leve sombra de elevação (`box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);`).
   - **Widgets Obrigatórios no Header (`.header-meta`):**
     - **Tempo / Clima:** Indicador de temperatura e localização (`🌤️ 28°C · Maputo`).
     - **Relógio em Tempo Real:** Atualizado a cada segundo (`HH:MM:SS`) com `font-variant-numeric: tabular-nums`.
     - **Central de Notificações:** Botão de sino com badge de alertas (faturas vencidas, conciliação pendente) e dropdown interativo.
2. **Largura Total (100% Full Width) e Alinhamento Rigoroso:**
   - O cabeçalho (`.header-container`) e a área de conteúdo principal (`.cont`) devem ocupar **100% da largura útil disponível** (sem limites fixos como `max-width: 1500px`), permitindo expansão total em monitores ultrawide ou de qualquer resolução:
     ```css
     width: 100%;
     box-sizing: border-box;
     ```
   - O padding horizontal padrão em desktop é de `32px` rigorosamente uniforme tanto no header (`.header-container`) quanto no conteúdo principal (`.cont`), garantindo alinhamento pixel-perfect de ponta a ponta.
   - No mobile (`@media (max-width: 860px)`), o padding horizontal passa para `16px` em ambos.
3. **Sidebar Lateral com Modo Recolhível (Collapse):**
   - Largura expandida de `256px` e modo compacto/recolhido de `72px` (`aside.collapsed`).
   - No modo recolhido, oculta textos dos menus e botões (`.brand-text`, `.btn-text`, `span`), centraliza os ícones SVG e inverte a seta do botão toggle.
   - O estado de recolhimento é memorizado no `localStorage` (`lecasu_sidebar_collapsed`).
   - No mobile (`@media (max-width: 860px)`), converte-se em barra horizontal superior.

---

## 3. Tipografia e Tamanhos de Textos Exatos

O agente IA deve aplicar rigorosamente a seguinte escala tipográfica e propriedades visuais:

| Elemento / Função                       | Tamanho         | Peso (`font-weight`) | Linha / Espaçamento                                      | Cor / Observação                                                           |
| :-------------------------------------- | :-------------- | :------------------- | :------------------------------------------------------- | :------------------------------------------------------------------------- |
| **Família de Fontes**                   | —               | —                    | —                                                        | `"Inter", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif` |
| **Texto Base (`body`)**                 | `14px`          | `400` (Regular)      | `line-height: 1.45`                                      | `var(--tx)` (`#18202f`)                                                    |
| **H1 (Título da Página no Header)**     | `22px` a `24px` | `700` (Bold)         | `letter-spacing: -0.3px; margin: 0;`                     | `var(--tx)`                                                                |
| **Subtítulo / Metadados no Header**     | `13px`          | `400` (Regular)      | `margin-top: 3px;`                                       | `var(--mu)` (`#6b7487`)                                                    |
| **H2 (Títulos de Seção / Tabelas)**     | `15px`          | `700` (Bold)         | `margin: 24px 0 10px;`                                   | `var(--tx)`                                                                |
| **H3 (Títulos dos Cards)**              | `14px`          | `600` (Semi-bold)    | `margin: 0 0 10px;`                                      | `var(--tx)`                                                                |
| **KPIs - Rótulo Superior (`span`)**     | `12px`          | `600` (Semi-bold)    | `display: block;`                                        | `var(--mu)`                                                                |
| **KPIs - Valor Numérico (`b`)**         | `21px`          | `700` (Bold)         | `font-variant-numeric: tabular-nums;`                    | `var(--tx)`                                                                |
| **KPIs - Subtítulo / Nota (`small`)**   | `12px`          | `400` (Regular)      | `margin-top: 2px;`                                       | `var(--mu)`                                                                |
| **Tabelas - Cabeçalho (`th`)**          | `11.5px`        | `700` (Bold)         | `letter-spacing: 0.25px; text-transform: uppercase;`     | `#ffffff`, fundo oficial LECASU `#FE8100` (`var(--ac)`)                    |
| **Tabelas - Célula de Conteúdo (`td`)** | `13px` a `14px` | `400` (Regular)      | `white-space: nowrap;` (ou `.w` para descrição)          | `var(--tx)`                                                                |
| **Tabelas - Célula Numérica (`td.n`)**  | `13px` a `14px` | `400` a `700`        | `text-align: right; font-variant-numeric: tabular-nums;` | Alinhamento à direita                                                      |
| **Badges de Estado (`.b`)**             | `12px`          | `600` (Semi-bold)    | `padding: 1px 9px; border-radius: 99px;`                 | Cores semânticas conforme estado                                           |
| **Labels de Formulários**               | `12px`          | `600` (Semi-bold)    | `color: var(--mu);`                                      | Rótulo sobre o campo                                                       |
| **Inputs e Selects**                    | `14px`          | `400` (Regular)      | `padding: 7px 9px;`                                      | `border-radius: 8px; border: 1px solid var(--bd);`                         |
| **Placeholders dos Inputs**             | `13px`          | `400` (Regular)      | —                                                        | Cor cinza suave legível (`#9aa2b1`)                                        |
| **Notas de Rodapé (`.note`)**           | `12px`          | `400` (Regular)      | —                                                        | `var(--mu)`                                                                |

---

## 4. Paleta de Cores Oficiais da Marca LECASU e Tokens Visuais (`:root`)

Toda e qualquer estilização deve reutilizar rigorosamente as variáveis da identidade oficial LECASU declaradas no CSS:

```css
:root {
  /* Superfícies e Fundos */
  --bg: #f4f6f9; /* Fundo principal da página */
  --cd: #ffffff; /* Fundo dos cards, tabelas e cabeçalhos */

  /* Textos */
  --tx: #18202f; /* Texto principal preto grafite do logotipo Lecasu */
  --mu: #64748b; /* Texto secundário e rótulos atenuados */

  /* Linhas e Contornos */
  --bd: #e2e8f0; /* Cor padrão de bordas limpas */

  /* Cor Oficial da Marca LECASU (do Logotipo Oficial de Energia & Engenharia) */
  --ac: #fe8100; /* Laranja Oficial LECASU */
  --ach: #e57400; /* Laranja escurecido para hover e foco */
  --ab: #fff3e6; /* Laranja suave para fundos, pills ativas e seleções */
  --abb: #fed7aa; /* Borda suave laranja */

  /* Estados e Badges Alinhados à Marca */
  --ok: #fe8100;
  --okb: #fff3e6; /* Estados normais/concluídos em laranja da marca */
  --wa: #ea580c;
  --wab: #ffedd5; /* Alerta/Pendente em tom quente alinhado */

  /* Vermelho Mandatório e Exclusivo para Eliminar / Deletar / Alertas Críticos */
  --er: #b42318;
  --erb: #fde7e4; /* Vermelho oficial para botões de deletar */

  /* Neutros Elegantes para Códigos e Tags */
  --in: #334155;
  --inb: #f1f5f9; /* Grafite neutro para tags e categorias */
}
```

- **Eliminação de Cores Antigas:** As antigas tonalidades descontextualizadas (verde petróleo `#0f766e`, azul royal `#245fa8`, verde escuro `#157347` e amarelo mostarda `#d9a21b`) foram removidas do sistema visual.
- **Vermelho Reservado:** A cor vermelha é reservada **estritamente** para botões de eliminação/deletar (`.del`, `.btn-danger`, `#rst`), confirmações de exclusão e alertas de divergência/faturas vencidas.
- **Prevenção de Rolagem Vertical e Salto de Layout:** Em páginas com pouco conteúdo, a altura do layout é contida (`height: 100%`, `aside { max-height: 100vh; }`, `padding-bottom: 32px;` e `scrollbar-gutter: stable;`), eliminando rolagem fantasma e solavancos na interface.

---

## 5. Regras Obrigatórias para Tabelas (Linhas Verticais e Horizontais)

1. **Cor de Fundo Obrigatória em Todos os Headers de Tabela:**
   - Todas as tabelas do sistema **DEVEM possuir cor de fundo destacada na cor oficial da marca LECASU (`var(--ac)` / `#FE8100`) com texto em branco (`#ffffff`)**:
     ```css
     th {
       font-size: 11.5px;
       letter-spacing: 0.25px;
       color: #ffffff;
       background: var(--ac); /* Cor oficial da LECASU nos headers */
       text-transform: uppercase;
       font-weight: 700;
       border-bottom: 2px solid #e57400;
       border-right: 1px solid #ff9d33;
       padding: 10px 12px;
     }
     ```
2. **Linhas Verticais Obrigatórias:**
   - Todas as tabelas contábeis e financeiras **DEVEM OBRIGATORIAMENTE possuir linhas verticais** separando cada coluna de forma nítida.
   - Regra CSS obrigatória:
     ```css
     th,
     td {
       padding: 8px 11px;
       border-bottom: 1px solid var(--bd);
       border-right: 1px solid var(--bd); /* Linha vertical mandatória */
       text-align: left;
       vertical-align: top;
       white-space: nowrap;
     }
     th:last-child,
     td:last-child {
       border-right: none; /* A última coluna não tem borda direita externa */
     }
     ```
3. **Container com Rolagem e Borda Envolvente:**
   - Toda tabela deve estar contida dentro de `<div class="sc">` com borda e arredondamento:
     ```css
     .sc {
       overflow-x: auto;
       border: 1px solid var(--bd);
       border-radius: 12px;
       background: var(--cd);
     }
     ```
4. **Alinhamento Numérico:**
   - Colunas com valores monetários, datas ou quantidades devem conter a classe `.n` para alinhamento à direita e espaçamento tabular uniforme (`font-variant-numeric: tabular-nums`).

---

## 6. Regras Obrigatórias para Formulários e Placeholders

1. **Placeholders Obrigatórios em Todos os Campos:**
   - **Nenhum input deve ser gerado sem um `placeholder` explícito, amigável e explicativo.**
   - Padrão de placeholders adotado:
     - **Datas:** `placeholder="AAAA-MM-DD"`
     - **Valores monetários (Entrada / Saída / Valor s/ IVA):** `placeholder="0.00"`
     - **Referências bancárias:** `placeholder="Ex: TRF-IN-0903 ou POS-0912"`
     - **Número de Documento / Fatura:** `placeholder="Ex: FT 2026/047 ou ST-8812"`
     - **Descrição do Movimento / Fatura:** `placeholder="Ex: Recebimento FT 2026/041 – Pousada Maré Alta"`
     - **Código de Terceiro / Conta:** `placeholder="Ex: CLI-006, FOR-008, 63.6"`
     - **Nome / Designação:** `placeholder="Ex: Pousada Maré Alta, Lda."`
     - **NUIT:** `placeholder="Ex: 400123451"`
     - **Província:** `placeholder="Ex: Maputo, Matola, Gaza, Inhambane..."`
2. **Validação de Entrada:**
   - Campos monetários devem sempre utilizar `type="number" step="0.01" min="0"`.
   - Campos obrigatórios possuem marcação asterisco `*` e validação pré-submissão.

---

## 7. Regras de Negócio Contábil (LECASU / Moçambique)

1. **Moeda e Formato Numérico Estrito:** Metical Moçambicano (`MZN`). Formato visual obrigatório: `232.000,00 MZN` (ponto `.` para separação de milhares, vírgula `,` para separação decimal com 2 casas e sufixo monetário ` MZN`). Aplicado universalmente em células de tabelas, KPIs, gráficos de barras, resumos e inputs editáveis de saldo inicial e extrato (`.money-input`).
2. **Plano Geral de Contabilidade (PGC-NIRF):**
   - Contas de 1 e 2 dígitos seguem o Decreto n.º 70/2009 de Moçambique:
     - Classe 1: Meios Monetários (ex: 11 Caixa, 12 Bancos, 12.1.1 NedBank).
     - Classe 4: Terceiros (41.1 Clientes, 42.1 Fornecedores, 44 Estado, 45 Outros terceiros / Sócios).
     - Classe 6: Gastos e Perdas (62 Pessoal, 63 FST, 69 Gastos Financeiros).
     - Classe 7: Rendimentos e Ganhos (71 Vendas, 72 Serviços, 78 Ganhos Financeiros).
3. **Cálculo do IVA:** Taxa padrão de 16% (`rate: 0.16`) ou 0% para operações isentas.
4. **Reconciliação Matemática:**
   $$\text{Saldo Contabilístico Ajustado} = \text{Saldo Contab.} + \text{Créditos no Extracto} - \text{Débitos no Extracto}$$
   $$\text{Saldo Bancário Ajustado} = \text{Saldo Extracto} + \text{Depósitos em Trânsito} - \text{Pagamentos em Trânsito}$$
   $$\text{Diferença} = \text{Saldo Contabilístico Ajustado} - \text{Saldo Bancário Ajustado} \implies 0,00 \text{ MZN (OK)}$$

---

## 8. Importação de Planilhas Excel (.xlsx, .xls, .csv)

1. **Botão e Localização:**
   - O botão de importação (`#btn-import-excel`) está localizado no header fixo da página [financeiro.html](file:///c:/Users/LECASU/Desktop/LECASU%20LDA%202026/Sistemas/Sistema%20Financeiro%20ERP/financeiro.html), estilizado com a cor oficial verde Excel (`#107c41`).
2. **Suporte de Formatos:**
   - Suporte universal a `.xlsx`, `.xls` (via SheetJS) e arquivos `.csv` (com parser nativo delimitador `;`, `,` ou tabulações).
3. **Fluxo de Confirmação e Pré-Visualização:**
   - Abre o modal nativo `<dialog id="dlg-excel">` exibindo o nome do arquivo, contagem de linhas e uma pré-visualização das 3 primeiras linhas.
   - Permite ao utilizador selecionar para qual módulo contábil deseja importar: Movimentos Bancários, Contas a Receber, Contas a Pagar, Terceiros ou Plano de Contas.
   - Mapeamento inteligente de colunas com tolerância a variações de cabeçalho (`Data`, `Descrição`, `Entrada`, `Saída`, `Doc`, `Valor`, etc.).

---

## 9. Arquitetura dos Módulos do ERP e Navegação no Sidebar

O ERP organiza-se em 8 módulos dedicados, sincronizados e interligados:

1. **Dashboard (`dashboard.html`):** Visão executiva de tesouraria, KPIs consolidados, gráficos interativos de fluxo (Linha) e despesas (Pizza/Donut) via Chart.js, faturas por antiguidade e vencimentos em aberto.
2. **Financeiro (`financeiro.html`):** Reconciliação bancária PGC-NIRF, extrato bancário, contas a receber (AR), contas a pagar (AP), plano de contas PGC-NIRF e importador Excel (.xlsx, .csv).
3. **Cliente e fornecedor (`clientes-fornecedores.html`):** Ficheiro central de terceiros com CRUD funcional, filtros por tipo (Clientes, Fornecedores, Estado, Sócios) e busca em tempo real.
4. **Material e Produtos (`materia.html`):** Gestão de estoque de materiais solares, cabos, baterias, inversores, estruturas, painéis e produtos com CRUD, cálculo de custos e alertas de estoque mínimo.
5. **RH (`rh.html`):** Gestão de recursos humanos, quadro de colaboradores com CRUD, dados de BI/NUIT, salários base e folha sintética de salários com INSS (3% e 4%) e IRPS de Moçambique.
6. **Ativos e inventários (`ativos-inventarios.html`):** Inventário físico e patrimonial de bens e equipamentos da empresa (cadeiras, mesas, eletrodomésticos, telemóveis, ferramentas, viaturas, informática) com Código (prefixos INF, MOB, FER, MED, STK, VIA, EPI, OUT), Descrição do Bem, Categoria, Marca/Modelo, Nº de série, Quantidade, Unidade, Localização, Utilizador/Responsável, Data de aquisição, Valor unitário (MZN), Valor total (MZN), Fornecedor, Factura nº, Estado (Novo, Bom, Razoável, Avariado, Abatido), Última verificação, Observações, bloco de assinaturas formais e CRUD funcional. O ícone de navegação é obrigatoriamente a caixa de bens patrimoniais em SVG (`archive`).
7. **Relatórios (`relatorios.html`):** Balancete de Verificação (PGC-NIRF), DRE Sintética, Mapa Resumo de IVA 16%, Fluxo de Caixa e Aging de Faturas com impressão e exportação em PDF.
8. **Configurações (`configuracoes.html`):** Parâmetros corporativos (LECASU, LDA., NUIT, Morada, Contactos), parâmetros fiscais (IVA 16%, MZN, Exercício), gestão de backups JSON e reposição de dados.

---

## 10. Checklist de Verificação Antes de Finalizar Qualquer Tarefa

Antes de concluir qualquer resposta ou commit, o agente IA deve verificar:

- [ ] O header fixo permanece visível e com alinhamento pixel-perfect com o conteúdo em todas as 8 páginas?
- [ ] As tabelas continuam exibindo linhas horizontais e linhas verticais nítidas em todos os módulos?
- [ ] O fundo dos cabeçalhos das tabelas (`<th>`) possui a cor oficial LECASU `#FE8100` (`var(--ac)`) com texto branco?
- [ ] Todos os novos ou existentes inputs possuem `placeholder` adequados e explicativos?
- [ ] Os dados no `localStorage` continuam persistindo e sincronizados em tempo real entre todas as telas via `BroadcastChannel`?
- [ ] O CRUD completo (Novo, Editar, Apagar) opera sem falhas em todos os módulos?
- [ ] Botões de exclusão/eliminação e ações perigosas estão estilizados em vermelho (`.del`, `.btn-danger`)?
- [ ] Toda ação destrutiva aciona o modal visual de confirmação (`#dlg-confirm`)?
- [ ] Todos os ícones são estritamente SVGs inline (zero emojis na interface)?
- [ ] O sidebar recolhido exibe o logotipo e o botão toggle perfeitamente separados sem qualquer sobreposição?
- [ ] Todos os valores em dinheiro seguem estritamente a formatação: `232.000,00 MZN`?
- [ ] Nenhum erro de sintaxe JavaScript (`node -c`) ou visual foi introduzido?

---

## 11. Padrões de Interação, Confirmação e Sincronização em Tempo Real

1. **Ícones Estritamente em SVG Inline (Proibição Total de Emojis):**
   - Nenhum componente da interface gráfica deve empregar emojis visuais (como 💾, 📂, 🖨️, 🔄, 🌤️, 🗑️, ✏️).
   - Todos os ícones do sistema (menus laterais, botões do rodapé, ações de tabelas, status de clima e modais) devem utilizar elementos `<svg viewBox="0 0 24 24">` padronizados, com `stroke-width="2"`, `fill="none"` e `stroke="currentColor"`.
2. **Botões de Ação Destrutiva / Eliminar em Vermelho:**
   - Qualquer botão que execute eliminação de registos, remoção de linhas ou reposição de banco de dados (`.del`, `.btn-danger`, `#rst`) deve obrigatoriamente ter estilo visual vermelho:
     ```css
     .btn-sm.del,
     .btn-danger,
     button.del {
       background: #fde7e4;
       color: #b42318;
       border: 1px solid #fecdd3;
     }
     .btn-sm.del:hover,
     .btn-danger:hover,
     button.del:hover {
       background: #b42318 !important;
       color: #ffffff !important;
       border-color: #991b1b !important;
     }
     ```
3. **Popup Modal de Confirmação de Ações (`#dlg-confirm`):**
   - É estritamente proibido o uso do `confirm()` nativo do navegador para exclusão de dados ou reposição de sistema.
   - Toda exclusão ou reposição aciona a função `showConfirm(title, msg, onOk, okText, isDanger)` que abre o modal estilizado `<dialog id="dlg-confirm">`, exibindo ícone de alerta vermelho, título explicativo, texto contextual e botões "Cancelar" e "Sim, Eliminar" em vermelho.
4. **Sincronização em Tempo Real entre Abas (Real-Time Multi-Tab Sync):**
   - A aplicação opera com sincronização instantânea e bidirecional através de `BroadcastChannel("lecasu_erp_channel")` combinado com escuta ao evento nativo `window.addEventListener("storage")`.
   - Sempre que qualquer formulário, importador Excel, edição em linha ou exclusão invocar `saveData()`, a função `notifySync()` emite uma mensagem broadcast para que todas as outras abas do ERP abertas recarreguem imediatamente o estado e atualizem a tela sem necessidade de F5 manual.
5. **Prevenção de Sobreposição no Sidebar Recolhido:**
   - No modo compacto (`aside.collapsed`), o logotipo (`.logo`) e o botão toggle (`.sidebar-toggle`) organizam-se verticalmente em coluna (`flex-direction: column; position: static;`), garantindo que o botão toggle nunca fique sobreposto ou tape a logo da empresa LECASU.
6. **Organização Horizontal Unificada da Barra de Ferramentas (`.bar`):**
   - Títulos redundantes em `<h2>` no corpo das páginas são evitados, visto que o cabeçalho fixo (`.app-header h1`) já identifica o módulo com clareza.
   - Todos os controlos de topo organizam-se **obrigatoriamente na mesma linha horizontal**:
     - **À esquerda:** Grupo de botões de filtro (`.filters-wrap`), como categorias ou tipos;
     - **À direita:** Caixa de pesquisa (`<input type="search">`) e botão de ação primária (`.p`), contidos em `.bar-search-actions` com `margin-left: auto;`;
     - Todos os elementos de controle compartilham a altura exata de `36px`, garantindo alinhamento pixel-perfect e eliminando quebras desnecessárias ou botões sobrepostos/abaixo.

---

## 12. Reconciliação Bancária Lado a Lado e Coluna de Ações Fixa na Rolagem

1. **Reconciliação Bancária Comparativa Lado a Lado (`.recon-compare-grid`):**
   - A reconciliação bancária organiza-se em **duas colunas comparativas lado a lado**:
     - **Coluna Esquerda:** _1. Ajuste do Saldo Contabilístico (Livro Razão)_ — com saldo contabilístico inicial, saldo contábil antes de ajustes, créditos e débitos pendentes e o saldo contábil final ajustado.
     - **Coluna Direita:** _2. Ajuste do Saldo Bancário (Extracto Bancário)_ — com saldo do extrato bancário em 30/09, depósitos em trânsito, pagamentos em trânsito e o saldo bancário final ajustado.
   - **Cartão de Comparação / Resumo Unificado (`.recon-summary-card`):**
     - Posicionado imediatamente abaixo das duas tabelas, demonstrando a igualdade `Saldo Contabilístico Ajustado = Saldo Bancário Ajustado`.
     - Exibe o badge de status `CONCILIADO COM SUCESSO` (verde) ou `DIVERGÊNCIA A VERIFICAR` (vermelho), com o valor da diferença devendo ser rigorosamente `0,00 MZN`.
   - Preserva a reatividade em tempo real e persistência dos inputs com `data-f="ini"` e `data-f="ext"`.

2. **Coluna de Ações Fixa na Rolagem Horizontal (`th.col-actions, td.col-actions`):**
   - Em todas as tabelas com rolagem horizontal (`.sc`), a coluna final com os botões de ação ("Ações" / Editar e Apagar) permanece **fixa à direita** durante a rolagem:
     ```css
     th.col-actions,
     td.col-actions,
     th.ac,
     td.ac {
       position: sticky !important;
       right: 0 !important;
       z-index: 5;
       background: var(--cd);
       box-shadow: -3px 0 6px rgba(15, 23, 42, 0.08);
       border-left: 1px solid var(--bd) !important;
       white-space: nowrap;
     }
     th.col-actions,
     th.ac {
       background: var(--ac) !important;
       color: #ffffff !important;
       z-index: 15;
       border-left: 1px solid #e57400 !important;
     }
     tr.t td.col-actions,
     tr.t td.ac {
       background: #f8f9fb !important;
     }
     ```
   - As tags `<td>` mantêm o comportamento nativo de célula de tabela (`display: table-cell`), agrupando os botões dentro do wrapper `<div class="actions-cell">` para garantir fixação estável e livre de distorções em qualquer navegador.

---

## 13. Proibição de Cards Clicáveis e Prevenção de Animação Fantasma na Sidebar

1. **Cards e KPIs Estritamente Não-Clicáveis (Zero Redirecionamentos):**
   - Nenhum card (`.cd`), KPI (`.k`) ou linha de tabela (`tr`) pode ser clicável ou disparar redirecionamento automático de página (`data-href`, `.k-link`, `.cd-link`, `tr.row-link` são terminantemente proibidos).
   - Cards e KPIs têm finalidade puramente expositiva de dados contábeis, métricas e resumos. Apenas links explícitos (`<a>`), itens da lista de notificações ou botões de ação intencional devem navegar no sistema.

2. **Prevenção de Movimento Estranho no Sidebar (Flicker / Desencolher e Encolher):**
   - O elemento `aside#sidebar` **NÃO DEVE** possuir `transition` contínua na folha de estilo base.
   - A transição (`transition: width 0.25s...`) é restrita exclusivamente à classe temporária `aside.animating`, aplicada apenas durante o evento de clique intencional no botão toggle (`#toggle-sidebar`).
   - Todas as páginas HTML contêm um script síncrono inline imediatamente dentro da tag `<aside id="sidebar">` para aplicar a classe `.collapsed` antes do primeiro ciclo de renderização gráfica (`first paint`), garantindo abertura e navegação instantâneas com zero atraso, zero processamento fantasma e zero movimento indesejado.

---

## 14. Layout Fixo 100vh com Scroll Interno, Centralização de Backup e Higienização Visual

1. **Layout Fixo 100vh com Scroll Interno na Tabela (`body.layout-fixed-100vh`):**
   - Aplicado nas telas de grande volume e operação diária: **Cliente e Fornecedor** (`clientes-fornecedores.html`), **Material e Produtos** (`materia.html`) e **Ativos e Inventários** (`ativos-inventarios.html`).
   - A janela fica travada em 100vh (`overflow: hidden;`), fixando os KPIs e a barra de pesquisa/filtros no topo, enquanto apenas o container da tabela (`.sc`) realiza a rolagem vertical e horizontal.
2. **Centralização Exclusiva de Backups em Configurações:**
   - Os botões de exportar backup, importar backup, reposição e impressão foram eliminados do rodapé da barra lateral (`.sbf`). O sidebar dedica-se 100% à navegação entre os 8 módulos.
   - As operações de cópia de segurança residem exclusivamente no cartão dedicado de `configuracoes.html`.
3. **Higienização Visual de Fórmulas e Nomenclatura:**
   - Tabelas e relatórios omitem fórmulas explícitas em favor de títulos objetivos e gerenciais (ex.: `INSS Trabalhador`, `INSS Empresa`, `Vendas e Serviços Prestados`).
   - A nomenclatura oficial para o módulo de inventário e estoque é **"Material e Produtos"**.

---

## 15. Sistema Dinâmico de Períodos Fiscais e Conexão com Neon PostgreSQL

1. **Gestão Dinâmica de Datas (Janeiro a Dezembro / 2026, 2027 e Futuros):**
   - O sistema elimina qualquer data ou mês estático nos cálculos e interfaces.
   - O widget `.header-period-selector` permite alternar em tempo real entre qualquer mês (`Janeiro` a `Dezembro` ou `Ano Completo`) e anos fiscais (`2026, 2027 a 2032`).
   - Os cálculos contábeis (`calc()`), fluxo de caixa, DRE, reconciliação bancária e folha de salários refletem instantaneamente o período selecionado.
   - Novos lançamentos usam por padrão a data de referência ativa (`getActivePeriod().refDate`).

2. **Base de Dados Neon PostgreSQL:**
   - O ERP conecta-se diretamente à instância PostgreSQL na nuvem Neon (`AWS us-east-2`, SSL obrigatório):
     `postgresql://neondb_owner:npg_VOIEzcBv8ms9@ep-nameless-cake-bdoybgwr-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
   - O servidor `server.js` gerencia as conexões e migrações DDL automáticas (`db/schema.sql`).
   - O cliente `js/db-client.js` realiza sincronização bidirecional em segundo plano (`/api/state`) com espelhamento transparente no `localStorage`, garantindo alta performance, resiliência offline e persistência em nuvem segura.

---

## 16. Autenticação Corporativa Real e Reposição Integral do Sistema

1. **Autenticação Real com Neon PostgreSQL e JWT:**
   - Tela de login corporativa em `login.html`.
   - Administrador inicial gravado no banco: `Josue Mahomad Esmael`, `jossuemohamad@gmail.com`, senha `Lecasu@2026,` (hasheada com `bcrypt`).
   - Sessão segura JWT com validade de 7 dias e proteção de rotas (redirecionamento imediato caso não autenticado).
   - Perfil de utilizador e botão de encerramento de sessão (`Sair`) no cabeçalho fixo.

2. **Reposição Real de Dados:**
   - O botão `Repor Dados Iniciais` em `configuracoes.html` aciona `POST /api/reset`, que limpa e restaura de verdade o banco de dados Neon PostgreSQL para o estado `SEED` original, re-sincronizando o `localStorage` e todas as abas.
