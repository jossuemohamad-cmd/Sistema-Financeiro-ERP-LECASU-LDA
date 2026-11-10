/**
 * LECASU, LDA. - Sistema Financeiro ERP
 * Servidor de Aplicação & API PostgreSQL Neon (server.js)
 */

const fs = require('fs');
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase, getState, saveState, pool, authenticateUser, verifyToken, resetDatabase } = require('./db/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname)));

// Endpoint de verificação de integridade e conexão com a Base de Dados
app.get('/api/health', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT current_database(), current_user, version()');
    client.release();
    res.json({
      status: 'online',
      provider: 'Neon PostgreSQL',
      database: result.rows[0].current_database,
      user: result.rows[0].current_user,
      version: result.rows[0].version
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Endpoint para obter o estado atualizado da base de dados Neon
app.get('/api/state', async (req, res) => {
  try {
    const data = await getState();
    if (data && data.state) {
      res.json({ success: true, state: data.state, updated_at: data.updated_at });
    } else {
      res.json({ success: false, message: 'Nenhum estado inicial gravado no banco ainda.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint para salvar/sincronizar o estado no Neon PostgreSQL
app.post('/api/state', async (req, res) => {
  try {
    const { state } = req.body;
    if (!state || typeof state !== 'object') {
      return res.status(400).json({ success: false, error: 'Objeto de estado inválido.' });
    }
    const result = await saveState(state);
    res.json({ success: true, timestamp: result.timestamp });
  } catch (err) {
    console.error('Erro ao salvar no PostgreSQL:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint de Autenticação Real (Login)
app.post('/api/auth/login', async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password || req.body.senha;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email e senha são obrigatórios.' });
    }
    const authResult = await authenticateUser(email, password);
    res.json({
      success: true,
      token: authResult.token,
      user: authResult.user
    });
  } catch (err) {
    res.status(401).json({ success: false, message: err.message || 'Falha na autenticação.' });
  }
});

// Endpoint de Verificação de Sessão
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token não fornecido.' });
  }
  const token = authHeader.split(' ')[1];
  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Sessão expirada ou inválida.' });
  }
  res.json({ success: true, user });
});

// Endpoint de Reposição e ZERAMENTO REAL do Sistema no Neon PostgreSQL
app.post('/api/reset', async (req, res) => {
  try {
    const dataFile = fs.readFileSync(path.join(__dirname, 'js', 'data.js'), 'utf8');
    const match = dataFile.match(/const SEED = (\{[\s\S]*?\n\};)/);
    let pcTemplate = [];
    let cfgTemplate = null;
    if (match) {
      const seedObj = eval('(' + match[1].replace(/;\s*$/, '') + ')');
      pcTemplate = seedObj.pc || [];
      cfgTemplate = seedObj.config || null;
    }

    const zeroState = {
      ini: 0,
      ext: 0,
      ref: "",
      mov: [],
      ar: [],
      ap: [],
      ter: [],
      materia: [],
      rh: [],
      ativos: [],
      book: [],
      ex: [],
      bank: [
        { id: "b1", nome: "Millennium BIM - Conta Principal", num: "0001.2345.6789.01", saldo: 0, moeda: "MZN" },
        { id: "b2", nome: "Standard Bank - Conta Operações", num: "0002.9876.5432.10", saldo: 0, moeda: "MZN" },
        { id: "b3", nome: "BCI - Caixa e Tesouraria", num: "0003.5555.4444.22", saldo: 0, moeda: "MZN" }
      ],
      pc: pcTemplate.map(p => ({ ...p, saldo: 0 })),
      config: cfgTemplate || {
        empresa: "LECASU, LDA.",
        nuit: "400123456",
        actividade: "Energia e Engenharia",
        morada: "Av. 24 de Julho, Maputo",
        contacto: "+258 84 123 4567",
        email: "info@lecasu.co.mz",
        moeda: "MZN",
        taxa_iva: 16,
        exercicio: 2026,
        banco_padrao: "Millennium BIM",
        contabilista: "Gabinete Contas Certas (OCAM)"
      }
    };

    // Zera o Neon PostgreSQL de verdade
    await resetDatabase(zeroState);

    res.json({
      success: true,
      message: 'Base de dados e sistema repostos a ZERO com sucesso. Pronto para uso em 2026.',
      state: zeroState,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Erro na reposição do sistema:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Inicialização do servidor e migração da base de dados
async function startServer() {
  try {
    console.log('🔄 Conectando ao Neon PostgreSQL e inicializando tabelas...');
    await initDatabase();
    const server = app.listen(PORT, () => {
      console.log(`🚀 Sistema Financeiro ERP LECASU online em: http://localhost:${PORT}`);
      console.log(`🔗 Conectado à base de dados Neon PostgreSQL.`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`\n⚠️ A porta ${PORT} já está em uso por outro processo do servidor.`);
        console.log(`👉 O ERP já se encontra ativo e acessível em: http://localhost:${PORT}\n`);
      } else {
        console.error('❌ Erro no servidor:', err);
      }
    });
  } catch (err) {
    console.error('❌ Falha ao iniciar servidor ou conectar ao banco:', err);
    process.exit(1);
  }
}

startServer();

