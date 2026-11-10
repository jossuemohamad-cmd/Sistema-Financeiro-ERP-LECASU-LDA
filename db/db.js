/**
 * LECASU, LDA. - Sistema Financeiro ERP
 * Conector e Sincronização PostgreSQL Neon (db/db.js)
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || "lecasu_erp_secret_key_2026_cat_mozambique";

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_VOIEzcBv8ms9@ep-nameless-cake-bdoybgwr-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require";

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

pool.on('error', (err) => {
  console.error('Erro inesperado no cliente do pool Neon PostgreSQL:', err);
});

/**
 * Inicializa o esquema de tabelas no Neon PostgreSQL
 */
async function initDatabase() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log('✅ Esquema de tabelas PostgreSQL criado/verificado no Neon com sucesso.');
  } finally {
    client.release();
  }
  await seedAdminUser();
}

/**
 * Obtém o estado mestre do sistema a partir do PostgreSQL
 */
async function getState() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT state, updated_at FROM tb_lecasu_state WHERE key = 'lecasu-recon-v1' LIMIT 1");
    if (res.rows.length > 0) {
      return { state: res.rows[0].state, updated_at: res.rows[0].updated_at };
    }
    return null;
  } finally {
    client.release();
  }
}

/**
 * Salva e sincroniza o estado mestre completo no PostgreSQL e popula tabelas relacionais
 */
async function saveState(state) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(735102)');

    // 1. Snapshot Mestre JSONB (Garante recuperação instantânea 100% íntegra)
    await client.query(
      `INSERT INTO tb_lecasu_state (key, state, updated_at) 
       VALUES ('lecasu-recon-v1', $1, CURRENT_TIMESTAMP)
       ON CONFLICT (key) DO UPDATE 
       SET state = $1, updated_at = CURRENT_TIMESTAMP`,
      [JSON.stringify(state)]
    );

    // 2. Sincronização nas Tabelas Relacionais do Neon
    if (Array.isArray(state.mov)) {
      for (const m of state.mov) {
        await client.query(
          `INSERT INTO tb_movimentos (id, date, descricao, cat, entrada, saida, ref, tipo, conta, terc, doc, ext, estado, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP)
           ON CONFLICT (id) DO UPDATE SET
             date = EXCLUDED.date, descricao = EXCLUDED.descricao, cat = EXCLUDED.cat,
             entrada = EXCLUDED.entrada, saida = EXCLUDED.saida, ref = EXCLUDED.ref,
             tipo = EXCLUDED.tipo, conta = EXCLUDED.conta, terc = EXCLUDED.terc,
             doc = EXCLUDED.doc, ext = EXCLUDED.ext, estado = EXCLUDED.estado,
             updated_at = CURRENT_TIMESTAMP`,
          [m.id, m.date || null, m.desc || '', m.cat || '', m.in || 0, m.out || 0, m.ref || '', m.tipo || '', m.conta || '', m.terc || '', m.doc || '', m.ext || null, m.estado || 'Reconciliado']
        );
      }
    }

    if (Array.isArray(state.ar)) {
      for (const i of state.ar) {
        const iva = Math.round(((i.base || 0) * (i.rate || 0.16) + Number.EPSILON) * 100) / 100;
        const tot = Math.round(((i.base || 0) + iva + Number.EPSILON) * 100) / 100;
        const pd = Array.isArray(state.mov) 
          ? Math.round((state.mov.filter(x => x.doc === i.no).reduce((a, x) => a + (x.in || 0), 0) + Number.EPSILON) * 100) / 100 
          : 0;
        const sal = Math.round((tot - pd + Number.EPSILON) * 100) / 100;
        const st = sal <= 0.005 ? "Liquidada" : pd > 0 ? "Parcial" : "Em aberto";

        await client.query(
          `INSERT INTO tb_faturas_ar (id, no, terc, date, due, base, rate, tot, pay, sal, st, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
           ON CONFLICT (id) DO UPDATE SET
             no = EXCLUDED.no, terc = EXCLUDED.terc, date = EXCLUDED.date,
             due = EXCLUDED.due, base = EXCLUDED.base, rate = EXCLUDED.rate,
             tot = EXCLUDED.tot, pay = EXCLUDED.pay, sal = EXCLUDED.sal,
             st = EXCLUDED.st, updated_at = CURRENT_TIMESTAMP`,
          [i.id || i.no, i.no, i.terc || '', i.date || null, i.due || null, i.base || 0, i.rate || 0.16, tot, pd, sal, st]
        );
      }
    }

    if (Array.isArray(state.ap)) {
      for (const i of state.ap) {
        const iva = Math.round(((i.base || 0) * (i.rate || 0.16) + Number.EPSILON) * 100) / 100;
        const tot = Math.round(((i.base || 0) + iva + Number.EPSILON) * 100) / 100;
        const pd = Array.isArray(state.mov) 
          ? Math.round((state.mov.filter(x => x.doc === i.no).reduce((a, x) => a + (x.out || 0), 0) + Number.EPSILON) * 100) / 100 
          : 0;
        const sal = Math.round((tot - pd + Number.EPSILON) * 100) / 100;
        const st = sal <= 0.005 ? "Liquidada" : pd > 0 ? "Parcial" : "Em aberto";

        await client.query(
          `INSERT INTO tb_faturas_ap (id, no, terc, date, due, base, rate, tot, pay, sal, st, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
           ON CONFLICT (id) DO UPDATE SET
             no = EXCLUDED.no, terc = EXCLUDED.terc, date = EXCLUDED.date,
             due = EXCLUDED.due, base = EXCLUDED.base, rate = EXCLUDED.rate,
             tot = EXCLUDED.tot, pay = EXCLUDED.pay, sal = EXCLUDED.sal,
             st = EXCLUDED.st, updated_at = CURRENT_TIMESTAMP`,
          [i.id || i.no, i.no, i.terc || '', i.date || null, i.due || null, i.base || 0, i.rate || 0.16, tot, pd, sal, st]
        );
      }
    }

    if (Array.isArray(state.pc)) {
      for (const p of state.pc) {
        await client.query(
          `INSERT INTO tb_plano_contas (id, cod, nome, classe, tipo, saldo, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
           ON CONFLICT (id) DO UPDATE SET
             cod = EXCLUDED.cod, nome = EXCLUDED.nome, classe = EXCLUDED.classe,
             tipo = EXCLUDED.tipo, saldo = EXCLUDED.saldo, updated_at = CURRENT_TIMESTAMP`,
          [p.id || p.cod, p.cod, p.des || p.nome || '', p.niv || p.classe || '', p.tipo || 'Balanço', 0]
        );
      }
    }

    if (Array.isArray(state.ter)) {
      for (const t of state.ter) {
        await client.query(
          `INSERT INTO tb_terceiros (id, cod, nome, tipo, nuit, tel, email, cidade, saldo, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
           ON CONFLICT (id) DO UPDATE SET
             cod = EXCLUDED.cod, nome = EXCLUDED.nome, tipo = EXCLUDED.tipo,
             nuit = EXCLUDED.nuit, tel = EXCLUDED.tel, email = EXCLUDED.email,
             cidade = EXCLUDED.cidade, saldo = EXCLUDED.saldo, updated_at = CURRENT_TIMESTAMP`,
          [t.id || t.cod, t.cod, t.nome, t.tipo, t.nuit || '', t.contacto || t.tel || '', t.email || '', t.prov || t.cidade || '', t.saldo || 0]
        );
      }
    }

    if (Array.isArray(state.materia)) {
      for (const mat of state.materia) {
        await client.query(
          `INSERT INTO tb_material_produtos (id, cod, nome, cat, unidade, qtd, custo, preco, min, forn, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
           ON CONFLICT (id) DO UPDATE SET
             cod = EXCLUDED.cod, nome = EXCLUDED.nome, cat = EXCLUDED.cat,
             unidade = EXCLUDED.unidade, qtd = EXCLUDED.qtd, custo = EXCLUDED.custo,
             preco = EXCLUDED.preco, min = EXCLUDED.min, forn = EXCLUDED.forn, updated_at = CURRENT_TIMESTAMP`,
          [mat.id || mat.cod, mat.cod, mat.nome, mat.cat, mat.unidade, mat.qtd || 0, mat.custo || 0, mat.preco || 0, mat.min || 5, mat.forn || '']
        );
      }
    }

    if (Array.isArray(state.rh)) {
      for (const r of state.rh) {
        await client.query(
          `INSERT INTO tb_colaboradores (id, cod, nome, cargo, dept, data_adm, salario, nuit, bi, inss, estado, tel, email, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP)
           ON CONFLICT (id) DO UPDATE SET
             cod = EXCLUDED.cod, nome = EXCLUDED.nome, cargo = EXCLUDED.cargo,
             dept = EXCLUDED.dept, data_adm = EXCLUDED.data_adm, salario = EXCLUDED.salario,
             nuit = EXCLUDED.nuit, bi = EXCLUDED.bi, inss = EXCLUDED.inss,
             estado = EXCLUDED.estado, tel = EXCLUDED.tel, email = EXCLUDED.email, updated_at = CURRENT_TIMESTAMP`,
          [r.id || r.cod, r.cod, r.nome, r.cargo, r.dept, r.data_adm || null, r.salario || 0, r.nuit || '', r.bi || '', r.inss || '', r.estado || 'Activo', r.tel || '', r.email || '']
        );
      }
    }

    if (Array.isArray(state.ativos)) {
      for (const a of state.ativos) {
        await client.query(
          `INSERT INTO tb_ativos_inventario (id, cod, nome, cat, marca, serie, qtd, unidade, local, resp, data_aq, val_unit, val_tot, forn, doc, estado, ult_ver, obs, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, CURRENT_TIMESTAMP)
           ON CONFLICT (id) DO UPDATE SET
             cod = EXCLUDED.cod, nome = EXCLUDED.nome, cat = EXCLUDED.cat,
             marca = EXCLUDED.marca, serie = EXCLUDED.serie, qtd = EXCLUDED.qtd,
             unidade = EXCLUDED.unidade, local = EXCLUDED.local, resp = EXCLUDED.resp,
             data_aq = EXCLUDED.data_aq, val_unit = EXCLUDED.val_unit, val_tot = EXCLUDED.val_tot,
             forn = EXCLUDED.forn, doc = EXCLUDED.doc, estado = EXCLUDED.estado,
             ult_ver = EXCLUDED.ult_ver, obs = EXCLUDED.obs, updated_at = CURRENT_TIMESTAMP`,
          [a.id || a.cod, a.cod, a.nome, a.cat, a.marca || 'N/A', a.serie || '', a.qtd || 1, a.unidade || 'un', a.local || 'Escritório', a.resp || 'N/A', a.data_aq || null, a.val_unit || 0, a.val_tot || 0, a.forn || '', a.doc || '', a.estado || 'Bom', a.ult_ver || null, a.obs || '']
        );
      }
    }

    await client.query('COMMIT');
    return { success: true, timestamp: new Date().toISOString() };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Garante a existência do usuário administrador no Neon PostgreSQL
 * Josue Mahomad Esmael - jossuemohamad@gmail.com - Lecasu@2026,
 */
async function seedAdminUser() {
  const client = await pool.connect();
  try {
    const adminEmail = "jossuemohamad@gmail.com";
    const res = await client.query("SELECT id FROM tb_usuarios WHERE email = LOWER($1)", [adminEmail]);
    
    // Hash seguro com bcrypt da senha Lecasu@2026,
    const senhaHash = bcrypt.hashSync("Lecasu@2026,", 10);

    if (res.rows.length === 0) {
      await client.query(
        `INSERT INTO tb_usuarios (id, nome, email, senha_hash, cargo, perfil, avatar, ativo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        ["usr_admin_1", "Josue Mahomad Esmael", adminEmail, senhaHash, "Director Geral & Administrador", "admin", "assets/icon.png", true]
      );
      console.log("👤 Usuário Administrador 'Josue Mahomad Esmael' inicializado com sucesso no Neon.");
    } else {
      // Atualiza a senha e garante ativo
      await client.query(
        `UPDATE tb_usuarios SET senha_hash = $1, nome = $2, ativo = true, updated_at = CURRENT_TIMESTAMP WHERE email = LOWER($3)`,
        [senhaHash, "Josue Mahomad Esmael", adminEmail]
      );
    }
  } catch (err) {
    console.error("Erro ao semear admin no banco:", err);
  } finally {
    client.release();
  }
}

/**
 * Autentica usuário contra o Neon PostgreSQL
 */
async function authenticateUser(email, password) {
  if (!email || !password) {
    throw new Error("Email e senha são obrigatórios.");
  }
  const client = await pool.connect();
  try {
    const res = await client.query(
      "SELECT id, nome, email, senha_hash, cargo, perfil, avatar, ativo FROM tb_usuarios WHERE email = LOWER($1) LIMIT 1",
      [email.trim()]
    );
    if (res.rows.length === 0) {
      throw new Error("Credenciais inválidas. Verifique o email digitado.");
    }
    const user = res.rows[0];
    if (!user.ativo) {
      throw new Error("Esta conta de utilizador está inactiva. Contacte o administrador.");
    }

    const match = bcrypt.compareSync(password, user.senha_hash);
    if (!match) {
      throw new Error("Senha incorrecta. Tente novamente.");
    }

    // Atualiza timestamp de login
    await client.query("UPDATE tb_usuarios SET ultimo_login = CURRENT_TIMESTAMP WHERE id = $1", [user.id]);

    const payload = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      cargo: user.cargo,
      perfil: user.perfil,
      avatar: user.avatar
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    return {
      token,
      user: payload
    };
  } finally {
    client.release();
  }
}

/**
 * Verifica JWT token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

/**
 * Reposição REAL e ZERAMENTO da base de dados Neon PostgreSQL
 * Limpa e zera todas as tabelas operacionais para início do exercício 2026
 */
async function resetDatabase(zeroState) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(735102)');

    // Trunca tabelas de dados operacionais (zerando tudo)
    await client.query('TRUNCATE TABLE tb_movimentos, tb_faturas_ar, tb_faturas_ap, tb_terceiros, tb_material_produtos, tb_colaboradores, tb_ativos_inventario');

    // Grava o snapshot mestre zerado
    await client.query(
      `INSERT INTO tb_lecasu_state (key, state, updated_at) 
       VALUES ('lecasu-recon-v1', $1, CURRENT_TIMESTAMP)
       ON CONFLICT (key) DO UPDATE 
       SET state = $1, updated_at = CURRENT_TIMESTAMP`,
      [JSON.stringify(zeroState)]
    );

    // Zera os saldos das contas do PGC
    await client.query('UPDATE tb_plano_contas SET saldo = 0, updated_at = CURRENT_TIMESTAMP');

    await client.query('COMMIT');

    // Garante que o administrador permaneça ativo e cadastrado
    await seedAdminUser();

    console.log("♻️ Base de dados Neon PostgreSQL reposta e ZERADA com sucesso (Tudo a zero para 2026).");
    return { success: true, timestamp: new Date().toISOString() };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  initDatabase,
  getState,
  saveState,
  seedAdminUser,
  authenticateUser,
  verifyToken,
  resetDatabase
};

