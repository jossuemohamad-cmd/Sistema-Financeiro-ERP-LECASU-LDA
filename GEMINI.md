# ANTIGRAVITY AGENT INSTRUCTIONS (GEMINI.md)
**Sistema Financeiro ERP – LECASU, LDA.**

> ⚠️ **MANDATÓRIO PARA O AGENTE IA:**  
> Ao iniciar qualquer interação neste workspace, você **DEVE** seguir integralmente as diretrizes registradas em:
> 1. [MEMORY.md](file:///c:/Users/LECASU/Desktop/LECASU%20LDA%202026/Sistemas/Sistema%20Financeiro%20ERP/MEMORY.md) (Memória persistente, histórico de aprendizados e preferências do utilizador)
> 2. [agentes.md](file:///c:/Users/LECASU/Desktop/LECASU%20LDA%202026/Sistemas/Sistema%20Financeiro%20ERP/agentes.md) (Especificação técnica de layout, PGC-NIRF e checklist de integridade)

---

## Regras Críticas de Operação e Comportamento

1. **Memória de Longo Prazo Ativa:**
   * Sempre consulte o [MEMORY.md](file:///c:/Users/LECASU/Desktop/LECASU%20LDA%202026/Sistemas/Sistema%20Financeiro%20ERP/MEMORY.md) para verificar o histórico de preferências do utilizador antes de propor alterações.
   * Quando o utilizador corrigir o seu comportamento ou solicitar que guarde uma nova regra, atualize o `MEMORY.md` cirurgicamente.

2. **Cores Oficiais da Marca LECASU:**
   * **Cor Primária:** Laranja Oficial LECASU `#FE8100` (`--ac`), botões principais, links ativos, abas ativas e destaques.
   * **Fundo Suave:** `#FFF3E6` (`--ab`).
   * **Preto Grafite:** `#18202F` para tipografia de alto contraste.
   * **Vermelho Restrito:** A cor vermelha (`#B42318` com `#FDE7E4`) é reservada **estritamente para botões de deletar/eliminar**, confirmações de exclusão e alertas críticos de divergência contábil.
   * Cores antigas (verde petróleo `#0f766e`, azul `#245fa8`, verde `#157347` e mostarda `#d9a21b`) foram banidas do sistema.

3. **Formatação Monetária Inegociável:**
   * Toda quantia monetária deve ser exibida rigorosamente no formato:
     $$\text{232.000,00 MZN}$$
     (Milhares com ponto `.`, decimais com vírgula `,`, 2 casas decimais e sufixo ` MZN`).

4. **Cards e KPIs Totalmente Não-Clicáveis:**
   * Nenhum card (`.cd`), KPI (`.k`) ou linha de tabela (`tr`) pode ser clicável ou disparar redirecionamento automático de página (`data-href`, `.k-link`, `.cd-link`, `tr.row-link` são proibidos). Apenas botões explícitos e notificações navegam.

5. **Barra Lateral Sem Flicker / Sem Movimento Fantasma:**
   * A classe de transição de largura em `aside` é restrita exclusivamente a `aside.animating`. Na navegação entre páginas, o sidebar abre instantaneamente sem animação de encolher ou desencolher, mantido pelo micro-script inline síncrono.

6. **Edição Cirúrgica e Respeito a Remoções Anteriores:**
   * Nunca reescreva arquivos inteiros. Faça edições pontuais.
   * **Regra de Ouro:** Se o utilizador pediu para remover um texto, bloco ou cartão em turns anteriores, **NUNCA mais reintroduza esse elemento** em alterações futuras.

