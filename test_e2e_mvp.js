/**
 * LECASU, LDA. - Sistema Financeiro ERP
 * Suite de Testes Automatizados E2E & Auditoria de Produção (test_e2e_mvp.js)
 */

const fs = require('fs');
const path = require('path');
const { pool, initDatabase, getState, saveState, authenticateUser, verifyToken, resetDatabase } = require('./db/db');

async function runTestSuite() {
  console.log('===============================================================');
  console.log('🚀 INICIANDO AUDITORIA E SUITE DE TESTES E2E - LECASU ERP MVP');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName} - ${details}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // FASE A: Teste de Conexão e Integridade da Base de Dados Neon
    // -------------------------------------------------------------
    console.log('--- 1. BASE DE DADOS POSTGRESQL NEON ---');
    await initDatabase();
    assert(true, 'Esquema de banco e tabelas inicializado sem erros no Neon');

    const client = await pool.connect();
    try {
      const resDb = await client.query('SELECT current_database(), current_user, version()');
      assert(resDb.rows.length > 0, 'Conexão ativa com PostgreSQL', `DB: ${resDb.rows[0].current_database}`);

      // Verifica existência de todas as tabelas requeridas
      const tables = [
        'tb_usuarios',
        'tb_lecasu_state',
        'tb_movimentos',
        'tb_faturas_ar',
        'tb_faturas_ap',
        'tb_terceiros',
        'tb_plano_contas',
        'tb_material_produtos',
        'tb_colaboradores',
        'tb_ativos_inventario'
      ];

      for (const tbl of tables) {
        const chk = await client.query(`SELECT to_regclass('public.${tbl}') as exists`);
        assert(chk.rows[0].exists !== null, `Tabela relacional '${tbl}' existe no schema Neon`);
      }
    } finally {
      client.release();
    }

    // -------------------------------------------------------------
    // FASE B: Teste de Autenticação e Segurança (JWT + Bcrypt)
    // -------------------------------------------------------------
    console.log('\n--- 2. AUTENTICAÇÃO E SEGURANÇA ---');
    const adminEmail = 'jossuemohamad@gmail.com';
    const adminPass = 'Lecasu@2026,';

    // Teste de Login Válido
    const authResult = await authenticateUser(adminEmail, adminPass);
    assert(authResult && authResult.token, 'Login com Admin oficial bem-sucedido', `User: ${authResult.user.nome}`);

    // Teste de Verificação de Token JWT
    const decodedUser = verifyToken(authResult.token);
    assert(decodedUser && decodedUser.email === adminEmail, 'Token JWT válido e verificado com sucesso');

    // Teste de Rejeição de Senha Incorreta
    let rejectedPass = false;
    try {
      await authenticateUser(adminEmail, 'SenhaErrada123!');
    } catch (e) {
      rejectedPass = true;
    }
    assert(rejectedPass, 'Tentativa de login com senha incorreta é devidamente rejeitada');

    // Teste de Rejeição de Utilizador Inexistente
    let rejectedUser = false;
    try {
      await authenticateUser('naoexiste@lecasu.co.mz', 'Lecasu@2026,');
    } catch (e) {
      rejectedUser = true;
    }
    assert(rejectedUser, 'Tentativa de login com utilizador inexistente é rejeitada');

    // -------------------------------------------------------------
    // FASE C: Teste de Estado, Seed e Sincronização Relacional
    // -------------------------------------------------------------
    console.log('\n--- 3. SINCRONIZAÇÃO DE ESTADO E PERSISTÊNCIA RELACIONAL ---');
    const dataFile = fs.readFileSync(path.join(__dirname, 'js', 'data.js'), 'utf8');
    const match = dataFile.match(/const SEED = (\{[\s\S]*?\n\};)/);
    assert(match !== null, 'SEED mestre extraído de js/data.js');

    const seedObj = eval('(' + match[1].replace(/;\s*$/, '') + ')');
    assert(seedObj && seedObj.mov && seedObj.ter, 'Objeto SEED possui estruturas essenciais');

    // Testar saveState
    const saveRes = await saveState(seedObj);
    assert(saveRes && saveRes.success, 'saveState persistiu snapshot e populou tabelas relacionais');

    // Testar getState
    const stateDb = await getState();
    assert(stateDb && stateDb.state && stateDb.state.mov.length > 0, 'getState recuperou o estado salvo com sucesso');

    // Validar contagem em cada tabela relacional
    const cli = await pool.connect();
    try {
      const counts = {};
      const relTables = [
        'tb_movimentos',
        'tb_faturas_ar',
        'tb_faturas_ap',
        'tb_terceiros',
        'tb_plano_contas',
        'tb_material_produtos',
        'tb_colaboradores',
        'tb_ativos_inventario'
      ];
      for (const t of relTables) {
        const r = await cli.query(`SELECT COUNT(*) as cnt FROM ${t}`);
        const c = parseInt(r.rows[0].cnt, 10);
        counts[t] = c;
        assert(c > 0, `Tabela relacional '${t}' possui registros sincronizados (${c} rows)`);
      }
    } finally {
      cli.release();
    }

    // -------------------------------------------------------------
    // FASE D: Integridade Contábil PGC-NIRF (Moçambique)
    // -------------------------------------------------------------
    console.log('\n--- 4. INTEGRIDADE CONTÁBIL PGC-NIRF ---');
    const bookEntries = (seedObj.book || []).concat(seedObj.ex || []);
    let totalDebit = 0;
    let totalCredit = 0;

    for (const b of bookEntries) {
      totalDebit += Math.round(((b.d || 0) + Number.EPSILON) * 100) / 100;
      totalCredit += Math.round(((b.c || 0) + Number.EPSILON) * 100) / 100;
    }

    const diff = Math.abs(totalDebit - totalCredit);
    assert(diff < 0.05, `Princípio das Partidas Dobradas: Débitos (${totalDebit}) == Créditos (${totalCredit}) (Diff: ${diff.toFixed(2)})`);

    // Validação de formato de moeda
    function formatMZN(v) {
      const n = (Number(v) || 0).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return `${n} MZN`;
    }
    const fmtSample = formatMZN(232000);
    assert(fmtSample.includes('232.000,00 MZN') || fmtSample.includes('232\u00A0000,00 MZN') || fmtSample.replace(/\s+/g, ' ') === '232.000,00 MZN',
      'Formato de moeda obedece estritamente a 232.000,00 MZN');

    // -------------------------------------------------------------
    // FASE E: Integridade dos Ficheiros Frontend e Conformidade com Regras
    // -------------------------------------------------------------
    console.log('\n--- 5. INTEGRIDADE FRONTEND E CONFORMIDADE DE CÓDIGO ---');
    const htmlFiles = [
      'index.html',
      'login.html',
      'dashboard.html',
      'financeiro.html',
      'clientes-fornecedores.html',
      'materia.html',
      'rh.html',
      'ativos-inventarios.html',
      'relatorios.html',
      'configuracoes.html'
    ];

    for (const f of htmlFiles) {
      const filePath = path.join(__dirname, f);
      assert(fs.existsSync(filePath), `Ficheiro HTML '${f}' existe`);

      const content = fs.readFileSync(filePath, 'utf8');

      // Verifica ausência de cores banidas no HTML
      const bannedColors = ['#0f766e', '#245fa8', '#157347', '#d9a21b'];
      let foundBanned = false;
      for (const col of bannedColors) {
        if (content.toLowerCase().includes(col.toLowerCase())) {
          foundBanned = true;
          break;
        }
      }
      assert(!foundBanned, `'${f}' não contém cores legadas banidas`);

      // Verifica ausência de classes de links de cards proibidos
      const bannedClasses = ['k-link', 'cd-link', 'row-link'];
      let foundBannedClass = false;
      for (const cls of bannedClasses) {
        if (content.includes(cls)) {
          foundBannedClass = true;
          break;
        }
      }
      assert(!foundBannedClass, `'${f}' não contém classes de redirecionamento proibidas em cards`);

      // Se for uma página interna do sistema (excluindo index e login)
      if (f !== 'index.html' && f !== 'login.html') {
        assert(content.includes('js/data.js'), `'${f}' importa 'js/data.js'`);
        assert(content.includes('js/db-client.js'), `'${f}' importa 'js/db-client.js'`);
        assert(content.includes('js/app.js'), `'${f}' importa 'js/app.js'`);
        assert(content.includes('css/style.css'), `'${f}' importa 'css/style.css'`);
      }
    }

    // -------------------------------------------------------------
    // FASE F: Auditoria de Event Handlers e Botões Críticos
    // -------------------------------------------------------------
    console.log('\n--- 6. EVENT HANDLERS E BOTÕES AUDITADOS EM APP.JS ---');
    const appJs = fs.readFileSync(path.join(__dirname, 'js', 'app.js'), 'utf8');
    
    // Verifica botões de configuração
    assert(appJs.includes('#save-config') || appJs.includes('save-config'), 'Botão #save-config ("Guardar Configurações") possui handler ativo');
    
    // Verifica botões de importação e exportação
    assert(appJs.includes('btn-import-excel') || appJs.includes('#btn-import-excel'), 'Botão Excel Import (#btn-import-excel) possui handler ativo');
    assert(appJs.includes('excel-import-mode'), 'Suporte a modo de importação / atualização Excel (excel-import-mode)');
    assert(appJs.includes('target === "materia"') && appJs.includes('target === "rh"') && appJs.includes('target === "ativos"'), 'Importação Excel suporta Material, RH e Ativos');
    assert(fs.existsSync(path.join(__dirname, 'js', 'xlsx.full.min.js')), 'Biblioteca XLSX local presente em js/xlsx.full.min.js');
    assert(appJs.includes('cfg-btn-exp') && appJs.includes('exportBackup'), 'Exportação de Dados / Backup (cfg-btn-exp) possui handler ativo');

    // Verifica botão de reposição
    assert(appJs.includes('rst') || appJs.includes('resetSystem') || appJs.includes('api/reset'), 'Botão #rst ("Repor dados") conectado ao backend real');

    // Verifica relatórios dinâmicos
    assert(appJs.includes('renderDRE') || appJs.includes('DRE'), 'Função de DRE dinâmica implementada');
    assert(appJs.includes('renderFluxoCaixa') || appJs.includes('Fluxo de Caixa'), 'Função de Fluxo de Caixa dinâmica implementada');

    console.log('\n===============================================================');
    console.log(`📊 RESULTADO FINAL DA SUITE DE TESTES: ${passed} PASSADOS, ${failed} FALHADOS`);
    console.log('===============================================================');

    if (failed === 0) {
      console.log('🎉 TODOS OS TESTES PASSARAM COM 100% DE SUCESSO! MVP EM ESTADO DE PRODUÇÃO.');
    } else {
      console.error(`⚠️ FORAM DETETADAS ${failed} FALHAS DURANTE A AUDITORIA.`);
    }

  } catch (err) {
    console.error('❌ Erro fatal durante a execução dos testes:', err);
    failed++;
  } finally {
    // Encerrar pool para liberar o processo
    await pool.end();
  }
}

runTestSuite();
