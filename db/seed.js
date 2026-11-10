/**
 * Sincroniza os dados iniciais do ERP com o banco Neon PostgreSQL
 */
const fs = require('fs');
const { pool, saveState } = require('./db');

async function seedInitialData() {
  const dataFile = fs.readFileSync('js/data.js', 'utf8');
  
  // Extrair objeto SEED
  const match = dataFile.match(/const SEED = (\{[\s\S]*?\n\};)/);
  if (!match) {
    console.error('SEED não encontrado em js/data.js');
    return;
  }

  const seedObj = eval('(' + match[1].replace(/;\s*$/, '') + ')');
  console.log('SEED carregado com sucesso. Gravando no Neon PostgreSQL...');
  
  await saveState(seedObj);
  console.log('✅ Dados iniciais sincronizados com sucesso no Neon PostgreSQL!');
  
  const res = await pool.query("SELECT COUNT(*) AS total_mov FROM tb_movimentos");
  console.log('📊 Total de movimentos gravados no banco Neon:', res.rows[0].total_mov);
  
  await pool.end();
}

seedInitialData().catch(err => {
  console.error('Erro ao semear banco:', err);
  process.exit(1);
});

