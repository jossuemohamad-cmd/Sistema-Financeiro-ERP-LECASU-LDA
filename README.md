# Sistema Financeiro ERP – LECASU, LDA.
**Energy & Engineering Solutions**

ERP de Gestão Financeira, Contabilística e Patrimonial Integrado, desenvolvido para a empresa **LECASU, LDA.** com base no normativo contabilístico moçambicano **PGC-NIRF** (Decreto n.º 70/2009).

---

## 🚀 Principais Módulos do Sistema

1. **Dashboard Executivo:** Visão geral da tesouraria, fluxo de caixa em tempo real, saldo bancário consolidado, gráficos de linha e pizza interativos via Chart.js, e balanço patrimonial.
2. **Financeiro & Tesouraria:**
   * **Reconciliação Bancária:** Confronto entre o livro razão e os extratos bancários com cálculo automático de desvios.
   * **Contas a Receber (AR):** Gestão de faturas de clientes, cálculo de IVA (16%), liquidações e antiguidade de saldos.
   * **Contas a Pagar (AP):** Gestão de faturas de fornecedores, controle de prazos e pagamentos.
   * **Terceiros:** Cadastro e controle de clientes, fornecedores, Estado e sócios.
   * **Plano de Contas:** Estrutura PGC-NIRF completa com partidas dobradas obrigatórias.
3. **Material e Produtos:** Gestão de armazém e estoque de equipamentos de energia solar, inversores, painéis fotovoltaicos, cabos e baterias.
4. **Recursos Humanos (RH):** Cadastro de colaboradores, folhas de salários, processamento de INSS (3% trabalhador, 4% patronal) e retenção na fonte.
5. **Ativos e Inventários:** Cadastro patrimonial e imobilizado corporativo, localização, responsabilidade e estado de conservação.
6. **Relatórios Contabilísticos:** Balancete de Verificação PGC-NIRF, Demonstração de Resultados do Exercício (DRE), Mapa de IVA (16%) e Fluxo de Caixa.
7. **Configurações & Parâmetros:** Parâmetros fiscais, dados corporativos, exportação/importação de cópias de segurança e reposição do sistema a zero para início de exercício.

---

## 🛠️ Stack Tecnológica

* **Frontend:** Single Page Application (SPA) ultra-rápida, navegação fluida sem cintilações, suporte a PWA (Progressive Web App) para instalação como aplicação de desktop autônoma.
* **Backend:** Node.js + Express.js com API REST para sincronização de estado e tabelas relacionais.
* **Base de Dados:** PostgreSQL na nuvem (**Neon Cloud AWS**) com conexão segura SSL e suporte offline-first via `localStorage` com `BroadcastChannel` multi-aba.
* **Segurança:** Autenticação corporativa com JWT (JSON Web Tokens) e criptografia de senhas com `bcrypt` (10 rounds).
* **Interoperabilidade:** Importação e atualização inteligente de dados via folhas de cálculo Excel (`.xlsx`, `.xls`, `.csv`) com suporte a *Upsert* em todos os módulos.
* **Fuso Horário & Moeda:** Moçambique (GMT+2 / CAT: `Africa/Maputo`), formato monetário estrito `232.000,00 MZN`.

---

## 💻 Instalação e Execução

### Pré-requisitos
* Node.js v20 ou superior instalado.
* Conexão à Internet (para conexão com a base de dados Neon PostgreSQL).

### Passos

1. Clonar o repositório:
```bash
git clone https://github.com/jossuemohamad-cmd/Sistema-Financeiro-ERP-LECASU-LDA.git
cd Sistema-Financeiro-ERP-LECASU-LDA
```

2. Instalar as dependências:
```bash
npm install
```

3. Iniciar o servidor:
```bash
npm start
```

4. Aceder à aplicação no navegador:
```
http://localhost:3000
```

---

## 👤 Credenciais de Administrador Padrão

* **Nome:** Josue Mahomad Esmael
* **Email:** `jossuemohamad@gmail.com`
* **Senha Inicial:** `Lecasu@2026,`
* **Perfil:** Director Geral & Administrador

---

## 🧪 Testes Automatizados

O sistema conta com suítes de testes unitários e de integração E2E:
```bash
node test_e2e_mvp.js
node test_excel_import.js
```

---

## 📄 Licença e Propriedade

Desenvolvido para **LECASU, LDA.** — Todos os direitos reservados © 2026.
