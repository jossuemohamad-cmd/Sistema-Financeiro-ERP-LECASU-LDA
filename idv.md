# Diretrizes de Identidade Visual & Design System (idv.md)
**Sistema Financeiro ERP – LECASU, LDA. (Energy & Engineering Solutions)**

Este documento centraliza todas as especificações de design, tokens CSS, componentes e regras estruturais para o ERP e sistemas administrativos da **LECASU, LDA.** Todos os agentes de inteligência artificial e desenvolvedores devem seguir estritamente estas diretrizes.

---

## 1. Princípios de Design & Direção Criativa

1. **Identidade Oficial LECASU (Energy & Engineering):** Foco na cor primária oficial Laranja LECASU `#FE8100`, fundo suave `#FFF3E6`, superfícies brancas `#FFFFFF` e tipografia em Preto Grafite de alto contraste `#18202F`.
2. **Clareza & Legibilidade Operacional:** Contraste elevado entre tipografia e superfície (aderente às normas WCAG AA), essencial para leitura de relatórios contabilísticos e balancetes PGC-NIRF.
3. **Modularidade por Tokens:** Proibido o uso de valores literais soltos (*magic numbers*). Todas as propriedades de cor, raio, margem, padding e tipografia consomem as variáveis padronizadas.
4. **Respeito às Regras Mandatórias de Negócio:**
   * Vermelho restrito (`#B42318` com `#FDE7E4`) exclusivamente para botões de eliminação/cancelamento crítico e alertas de divergência contábil.
   * Formatação monetária estrita: `232.000,00 MZN`.
   * Cards e KPIs totalmente não-clicáveis (exibição de métricas sem salto de página).

---

## 2. Tokens de Design (CSS Variables)

```css
:root {
  /* ==========================================================================
     Backgrounds & Superfícies (Adaptadas à Identidade Oficial LECASU)
     ========================================================================== */
  --bg-app: #f4f6f9;              /* Fundo geral da aplicação */
  --bg-surface-1: #ffffff;        /* Cards, tabelas, containers e painéis */
  --bg-surface-2: #f8fafc;        /* Inputs, subcards, painéis secundários */
  --bg-surface-hover: #f1f5f9;    /* Estados de hover em tabelas e listas */

  /* Aliases para compatibilidade total */
  --bg: var(--bg-app);
  --cd: var(--bg-surface-1);

  /* ==========================================================================
     Bordas & Linhas Divisórias
     ========================================================================== */
  --border-subtle: #e2e8f0;       /* Divisórias padrão e tabelas */
  --border-medium: #cbd5e1;       /* Bordas de maior contraste em controlos */
  --border-glow: rgba(254, 129, 0, 0.35); /* Borda de destaque / foco laranja */
  --bd: var(--border-subtle);

  /* ==========================================================================
     Tipografia & Contraste
     ========================================================================== */
  --text-primary: #18202f;        /* Preto Grafite de alto contraste */
  --text-secondary: #475569;      /* Textos complementares e rótulos */
  --text-muted: #64748b;          /* Textos atenuados, legendas e notas */
  --text-inverse: #ffffff;        /* Texto branco sobre botões/cabeçalhos */
  --tx: var(--text-primary);
  --mu: var(--text-muted);

  /* ==========================================================================
     Cores de Marca & Acentos Oficiais LECASU
     ========================================================================== */
  --accent-primary: #fe8100;        /* Laranja Oficial LECASU */
  --accent-primary-hover: #e57400;  /* Laranja escuro para hover/clique */
  --accent-glow: #fe8100;
  --accent-gradient: linear-gradient(135deg, #fe8100 0%, #ff9f38 100%);
  --accent-subtle: #fff3e6;         /* Laranja suave para fundos e seleções */
  --accent-subtle-border: #fed7aa;  /* Borda laranja suave */
  --ac: var(--accent-primary);
  --ach: var(--accent-primary-hover);
  --ab: var(--accent-subtle);
  --abb: var(--accent-subtle-border);

  /* ==========================================================================
     Feedback & Status
     ========================================================================== */
  --feedback-success: #12b76a;
  --feedback-success-bg: #ecfdf3;
  --feedback-warning: #f79009;
  --feedback-warning-bg: #fffaeb;
  --feedback-danger: #b42318;       /* Vermelho Restrito LECASU */
  --feedback-danger-bg: #fde7e4;
  --feedback-info: #0ba5ec;
  --feedback-info-bg: #f0f9ff;
  --ok: var(--accent-primary);
  --okb: var(--accent-subtle);
  --wa: var(--feedback-warning);
  --wab: #ffedd5;
  --er: var(--feedback-danger);
  --erb: var(--feedback-danger-bg);
  --in: #334155;
  --inb: #f1f5f9;

  /* ==========================================================================
     Espaçamento & Grid (Escala Base 4px / 8px)
     ========================================================================== */
  --space-1: 0.25rem;   /* 4px  - Micro espaçamento, tags */
  --space-2: 0.5rem;    /* 8px  - Gaps internos de botões e ícones */
  --space-3: 0.75rem;   /* 12px - Padding de inputs e badges */
  --space-4: 1rem;      /* 16px - Padding de cartões compactos e KPIs */
  --space-5: 1.25rem;   /* 20px - Gaps médios e padding de containers */
  --space-6: 1.5rem;    /* 24px - Padding de containers e modais */
  --space-8: 2rem;      /* 32px - Gaps entre grupos de blocos e páginas */
  --space-10: 2.5rem;   /* 40px - Separação vertical moderada */
  --space-12: 3rem;     /* 48px - Margem entre seções secundárias */
  --space-16: 4rem;     /* 64px - Margem entre seções principais */

  /* ==========================================================================
     Raios de Borda (Border Radius)
     ========================================================================== */
  --radius-xs: 4px;     /* Tags diminutas, tooltips */
  --radius-sm: 6px;     /* Badges, caixas de seleção, botões pequenos */
  --radius-md: 10px;    /* Inputs, dropdowns, botões regulares */
  --radius-lg: 16px;    /* Cards padrão, tabelas, containers */
  --radius-xl: 24px;    /* Modais, cards hero, caixas de diálogo */
  --radius-full: 9999px;/* Pílulas, chips e botões arredondados */

  /* ==========================================================================
     Sombras & Iluminação (Elevation & Glow para Sistema Administrativo)
     ========================================================================== */
  --shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.05);
  --shadow-md: 0 4px 14px rgba(15, 23, 42, 0.08);
  --shadow-lg: 0 12px 32px rgba(15, 23, 42, 0.14);
  --glow-button: 0 2px 10px rgba(254, 129, 0, 0.28);
  --glow-card: 0 4px 20px rgba(254, 129, 0, 0.08);
  --glow-ambient: 0 8px 30px rgba(254, 129, 0, 0.05);

  /* ==========================================================================
     Tipografia (Font Families & Sizes para Sistema Administrativo)
     ========================================================================== */
  --font-family-base: "Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-family-mono: "JetBrains Mono", "Fira Code", monospace;

  --text-display: 2.25rem;  /* 36px - Valores numéricos de destaque do topo */
  --text-h1: 1.75rem;       /* 28px - Título de página ou módulo mestre */
  --text-h2: 1.35rem;       /* 22px - Cabeçalho de seções e subdivisões */
  --text-h3: 1.15rem;       /* 18px - Títulos de cartões, modais e agrupamentos */
  --text-body: 0.9375rem;   /* 15px - Texto corrido, notas e parágrafos */
  --text-body-sm: 0.84375rem; /* 13.5px - Tabelas, inputs, formulários, navegação */
  --text-caption: 0.75rem;  /* 12px - Badges, tags de estado, legendas */

  --leading-tight: 1.15;
  --leading-snug: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;

  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;
  --weight-extrabold: 800;
}
```

---

## 3. Matriz Tipográfica para Sistema Administrativo

| Identificador | Tamanho | Entrelinha | Peso | Aplicação Primária no ERP |
| :--- | :--- | :--- | :--- | :--- |
| `display` | `2.25rem` (36px) | `1.15` | `800` | KPIs de impacto no topo do Dashboard, saldo disponível consolidado |
| `h1` | `1.75rem` (28px) | `1.2` | `700` | Título do módulo ativo no cabeçalho fixo (`.header-info h1`) |
| `h2` | `1.35rem` (22px) | `1.25` | `700` | Cabeçalho de seções (ex.: Gráficos, Balanço, Reconciliação) |
| `h3` | `1.15rem` (18px) | `1.3` | `600` | Títulos de cartões internos, cabeçalhos de modais e diálogos |
| `body` | `0.9375rem` (15px) | `1.5` | `400` | Textos descritivos, notas informativas, resumos executivos |
| `body-sm` | `0.84375rem` (13.5px) | `1.5` | `400` / `500` / `600` | Células de tabela, inputs, selects, itens do menu lateral |
| `caption` | `0.75rem` (12px) | `1.4` | `600` / `700` | Badges de status (`.b`), cabeçalhos de colunas (`th`), relógio |

---

## 4. Padrões de Componentes de Interface do ERP

### 4.1 Botões (Action Elements)

#### Botão Primário (CTA Principal / `button.p` / `.btn-primary`)
```css
.btn-primary,
button.p {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--accent-gradient);
  color: var(--text-inverse);
  font-family: var(--font-family-base);
  font-size: var(--text-body-sm);
  font-weight: var(--weight-bold);
  border: 1px solid var(--accent-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--glow-button);
  cursor: pointer;
  transition: filter 0.15s ease, background-color 0.15s ease;
}

.btn-primary:hover,
button.p:hover {
  filter: brightness(1.05);
}

.btn-primary:active,
button.p:active {
  filter: brightness(0.95);
}
```

#### Botão Secundário / Contorno (`.btn-sec` / `button:not(.p)`)
```css
.btn-secondary,
.btn-sec,
button:not(.p) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--bg-surface-1);
  color: var(--text-primary);
  font-family: var(--font-family-base);
  font-size: var(--text-body-sm);
  font-weight: var(--weight-semibold);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.btn-secondary:hover,
.btn-sec:hover,
button:not(.p):hover {
  background: var(--bg-surface-hover);
  border-color: var(--border-medium);
}
```

#### Botão de Eliminar / Ação Destrutiva (`.del` / `.btn-danger`)
```css
.btn-danger,
.btn-sm.del,
button.del {
  background: var(--feedback-danger-bg) !important;
  color: var(--feedback-danger) !important;
  border: 1px solid #fecdd3 !important;
  font-weight: var(--weight-bold) !important;
  border-radius: var(--radius-sm);
}

.btn-danger:hover,
.btn-sm.del:hover,
button.del:hover {
  background: var(--feedback-danger) !important;
  color: var(--text-inverse) !important;
  border-color: #991b1b !important;
}
```

### 4.2 Cartões & Superfícies (Cards, KPIs & Tabelas)

```css
.card,
.cd,
.k,
.sc {
  background: var(--bg-surface-1);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.k {
  padding: var(--space-4);
  border-top: 3px solid var(--accent-primary);
}

.cd {
  padding: var(--space-5) var(--space-6);
}

.card-highlight {
  background: var(--bg-surface-1);
  border: 1px solid var(--border-glow);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--glow-card);
}
```

### 4.3 Campos de Entrada (Form Inputs & Filtros)

```css
.input-field,
input,
select,
textarea {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  background: var(--bg-surface-1);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  font-family: var(--font-family-base);
  font-size: var(--text-body-sm);
  color: var(--text-primary);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

input::placeholder,
textarea::placeholder {
  color: var(--text-muted);
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(254, 129, 0, 0.18);
}
```

### 4.4 Badges & Etiquetas de Estado

```css
.badge,
.b {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--text-caption);
  font-weight: var(--weight-bold);
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.badge.ok, .b.ok { background: var(--accent-subtle); color: var(--accent-primary); border: 1px solid var(--accent-subtle-border); }
.badge.wa, .b.wa { background: #ffedd5; color: var(--feedback-warning); border: 1px solid #fed7aa; }
.badge.er, .b.er { background: var(--feedback-danger-bg); color: var(--feedback-danger); border: 1px solid #fecdd3; }
.badge.in, .b.in { background: var(--bg-surface-2); color: #334155; border: 1px solid var(--border-subtle); }
```

### 4.5 Modais & Diálogos Nativos (`dialog`)

```css
dialog {
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  background: var(--bg-surface-1);
  color: var(--text-primary);
  width: min(640px, 94vw);
  padding: var(--space-6);
  box-shadow: var(--shadow-lg);
}

dialog::backdrop {
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(2px);
}
```

---

## 5. Regras de Ouro de Execução

1. **Uso Exclusivo de Tokens:** Nunca declare medidas absolutas em pixels arbitrariamente. Use sempre as variáveis padronizadas do sistema (`var(--space-4)`, `var(--radius-md)`, `var(--accent-primary)`).
2. **Consistência de Raios de Borda:** Elementos menores (badges, botões de ação na tabela) usam `var(--radius-sm)`. Inputs, selects e botões principais usam `var(--radius-md)`. Cards, tabelas e contêineres usam `var(--radius-lg)`. Modais usam `var(--radius-xl)`. Pílulas e abas arredondadas usam `var(--radius-full)`.
3. **Escalonamento Responsivo:** Todos os tamanhos baseados em `rem` mantêm integridade com o zoom e preferências de acessibilidade.
4. **Respeito aos Níveis de Superfície do ERP:**
   * Fundo geral do ERP: `--bg-app` (`#F4F6F9`)
   * Superfície nível 1 (cards, tabelas, barra lateral, cabeçalho fixo): `--bg-surface-1` (`#FFFFFF`)
   * Superfície nível 2 (inputs, subcards, caixas de filtro): `--bg-surface-2` (`#F8FAFC`)
   * Estados de interação: `--bg-surface-hover` (`#F1F5F9`)
