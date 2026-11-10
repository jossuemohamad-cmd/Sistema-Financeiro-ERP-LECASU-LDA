const assert = require('assert');
const XLSX = require('xlsx');

console.log('===============================================================');
console.log('🧪 TESTE DE IMPORTAÇÃO E ATUALIZAÇÃO EXCEL (.XLSX / .CSV)');
console.log('===============================================================');

// 1. Criar uma planilha Excel em memória com dados para testar
const wb = XLSX.utils.book_new();

// Aba 1: Material e Produtos (com itens existentes a actualizar e novos a inserir)
const wsDataMateria = [
  ['Código', 'Nome do Artigo', 'Categoria', 'Qtd', 'Preço Custo', 'Preço Venda', 'Mínimo', 'Fornecedor'],
  ['MAT-001', 'Painel Solar 550W Monocristalino Tier-1 ATUALIZADO', 'Painéis Solares', 60, 7200, 9500, 15, 'FOR-001'], // Update
  ['MAT-999', 'Bateria Gel 200Ah 12V Ciclo Profundo NOVO', 'Baterias', 30, 12000, 16000, 5, 'FOR-002'] // Insert
];
const wsMateria = XLSX.utils.aoa_to_sheet(wsDataMateria);
XLSX.utils.book_append_sheet(wb, wsMateria, 'Materiais');

// Aba 2: Recursos Humanos
const wsDataRH = [
  ['Código', 'Nome do Colaborador', 'Cargo', 'Departamento', 'Salário Base', 'NUIT', 'BI', 'Estado'],
  ['COL-001', 'Eng. Mário Matsinhe (Director Técnico)', 'Director Técnico de Projectos', 'Engenharia & Obra', 75000, '104523190', '110100452934B', 'Activo'], // Update
  ['COL-999', 'Filomena Sitoe', 'Assistente Comercial', 'Comercial & Vendas', 28000, '109988771', '110900998871X', 'Activo'] // Insert
];
const wsRH = XLSX.utils.aoa_to_sheet(wsDataRH);
XLSX.utils.book_append_sheet(wb, wsRH, 'RH');

// Aba 3: Facturas a Receber (AR)
const wsDataAR = [
  ['Nº Factura', 'Cliente', 'Data Emissão', 'Vencimento', 'Valor s/ IVA', 'Taxa IVA', 'Descrição'],
  ['FT 2026/001', 'Moza Solar, Lda', '2026-09-02', '2026-09-30', 160000, 0.16, 'Fornecimento e instalação ampliada'], // Update
  ['FT 2026/999', 'Construções do Índico', '2026-10-15', '2026-11-15', 350000, 0.16, 'Projecto Solar 50kWp'] // Insert
];
const wsAR = XLSX.utils.aoa_to_sheet(wsDataAR);
XLSX.utils.book_append_sheet(wb, wsAR, 'Facturas_Clientes');

// Converter para buffer para simular leitura de ficheiro real
const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
console.log('✅ Planilha Excel de teste gerada em memória (' + buffer.length + ' bytes).');

// 2. Simular leitura da folha e conversão para JSON
const readWb = XLSX.read(buffer, { type: 'buffer', cellDates: true });
assert.strictEqual(readWb.SheetNames.length, 3, 'Deve conter 3 folhas');

const jsonMateria = XLSX.utils.sheet_to_json(readWb.Sheets['Materiais'], { defval: '' });
assert.strictEqual(jsonMateria.length, 2, 'Deve conter 2 linhas de dados em Materiais');

const jsonRH = XLSX.utils.sheet_to_json(readWb.Sheets['RH'], { defval: '' });
assert.strictEqual(jsonRH.length, 2, 'Deve conter 2 linhas de dados em RH');

const jsonAR = XLSX.utils.sheet_to_json(readWb.Sheets['Facturas_Clientes'], { defval: '' });
assert.strictEqual(jsonAR.length, 2, 'Deve conter 2 linhas de dados em Facturas');

console.log('✅ Leitura de todas as abas e conversão sheet_to_json concluída com sucesso.');

// 3. Simular lógica de UPSERT do app.js
const state = {
  materia: [
    { id: 'MAT-001', cod: 'MAT-001', nome: 'Painel Solar 550W Monocristalino Tier-1', cat: 'Painéis Solares', unidade: 'un', qtd: 45, custo: 7500, preco: 9800, min: 10, forn: 'FOR-001' }
  ],
  rh: [
    { id: 'COL-001', cod: 'COL-001', nome: 'Eng. Mário Matsinhe', cargo: 'Engenheiro Chefe', dept: 'Engenharia', salario: 65000, nuit: '104523190', bi: '110100452934B', estado: 'Activo' }
  ],
  ar: [
    { id: 'ar-1', no: 'FT 2026/001', terc: 'Moza Solar, Lda', date: '2026-09-02', due: '2026-09-30', desc: 'Instalação', base: 140000, rate: 0.16, conta: '41.1' }
  ]
};

// Funções auxiliares equivalentes às do app.js
const getCol = (row, names) => {
  for (const name of names) {
    for (const k of Object.keys(row)) {
      if (k.toLowerCase().trim() === name.toLowerCase().trim()) return row[k];
    }
  }
  for (const name of names) {
    for (const k of Object.keys(row)) {
      if (k.toLowerCase().includes(name.toLowerCase().trim())) return row[k];
    }
  }
  return '';
};

const normalizeNum = val => {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  let clean = String(val).replace(/MZN|MT|MTn|R\$|\$|\s/gi, '').trim();
  if (clean.includes(',') && clean.includes('.')) {
    if (clean.indexOf('.') < clean.indexOf(',')) {
      clean = clean.replace(/\./g, '').replace(',', '.');
    } else {
      clean = clean.replace(/,/g, '');
    }
  } else if (clean.includes(',')) {
    clean = clean.replace(',', '.');
  }
  const n = parseFloat(clean);
  return isNaN(n) ? 0 : n;
};

// Teste UPSERT Materiais
let insertedMat = 0;
let updatedMat = 0;
jsonMateria.forEach(r => {
  const nome = getCol(r, ['nome', 'designação', 'designacao', 'produto', 'material', 'artigo', 'nome do artigo']);
  const cod = getCol(r, ['código', 'codigo', 'cod', 'ref']);
  const cat = getCol(r, ['categoria', 'cat']) || 'Geral';
  const qtd = normalizeNum(getCol(r, ['quantidade', 'qtd', 'stock']));
  const custo = normalizeNum(getCol(r, ['preço de custo', 'preco custo', 'preço custo', 'custo']));
  const preco = normalizeNum(getCol(r, ['preço de venda', 'preco venda', 'preço venda', 'preco']));
  const min = normalizeNum(getCol(r, ['stock mínimo', 'stock minimo', 'mínimo', 'min']));
  const forn = getCol(r, ['fornecedor', 'forn']);

  const existing = state.materia.find(x => x.cod.toLowerCase() === cod.toLowerCase());
  if (existing) {
    existing.nome = nome;
    existing.cat = cat;
    existing.qtd = qtd;
    existing.custo = custo;
    existing.preco = preco;
    existing.min = min;
    existing.forn = forn;
    updatedMat++;
  } else {
    state.materia.push({ id: cod, cod, nome, cat, unidade: 'un', qtd, custo, preco, min, forn });
    insertedMat++;
  }
});

assert.strictEqual(updatedMat, 1, '1 material deve ter sido atualizado');
assert.strictEqual(insertedMat, 1, '1 material novo deve ter sido inserido');
assert.strictEqual(state.materia.length, 2, 'Total de materiais deve ser 2');
assert.strictEqual(state.materia[0].qtd, 60, 'Qtd do MAT-001 atualizada para 60');
assert.strictEqual(state.materia[0].nome, 'Painel Solar 550W Monocristalino Tier-1 ATUALIZADO');
assert.strictEqual(state.materia[1].cod, 'MAT-999', 'Novo material MAT-999 adicionado');

console.log('✅ UPSERT em Materiais: 1 atualizado, 1 inserido com sucesso.');

// Teste UPSERT RH
let insertedRH = 0;
let updatedRH = 0;
jsonRH.forEach(r => {
  const nome = getCol(r, ['nome', 'nome do colaborador', 'colaborador']);
  const cod = getCol(r, ['código', 'codigo', 'cod']);
  const cargo = getCol(r, ['cargo']);
  const dept = getCol(r, ['departamento', 'dept']);
  const salario = normalizeNum(getCol(r, ['salário', 'salario', 'salário base', 'salario base']));
  const nuit = getCol(r, ['nuit']);
  const bi = getCol(r, ['bi']);

  const existing = state.rh.find(x => x.cod.toLowerCase() === cod.toLowerCase());
  if (existing) {
    existing.nome = nome;
    existing.cargo = cargo;
    existing.dept = dept;
    existing.salario = salario;
    existing.nuit = nuit;
    existing.bi = bi;
    updatedRH++;
  } else {
    state.rh.push({ id: cod, cod, nome, cargo, dept, salario, nuit, bi, estado: 'Activo' });
    insertedRH++;
  }
});

assert.strictEqual(updatedRH, 1, '1 colaborador deve ter sido atualizado');
assert.strictEqual(insertedRH, 1, '1 colaborador novo deve ter sido inserido');
assert.strictEqual(state.rh.length, 2, 'Total de colaboradores deve ser 2');
assert.strictEqual(state.rh[0].salario, 75000, 'Salário do COL-001 atualizado para 75000');
assert.strictEqual(state.rh[0].cargo, 'Director Técnico de Projectos');
assert.strictEqual(state.rh[1].cod, 'COL-999', 'Novo colaborador COL-999 adicionado');

console.log('✅ UPSERT em Recursos Humanos: 1 atualizado, 1 inserido com sucesso.');

// Teste UPSERT Facturas (AR)
let insertedAR = 0;
let updatedAR = 0;
jsonAR.forEach(r => {
  const no = getCol(r, ['nº factura', 'factura', 'doc']);
  const terc = getCol(r, ['cliente', 'terceiro']);
  const base = normalizeNum(getCol(r, ['valor s/ iva', 'base']));
  const desc = getCol(r, ['descrição', 'descricao']);

  const existing = state.ar.find(x => x.no.toLowerCase() === no.toLowerCase());
  if (existing) {
    existing.terc = terc;
    existing.base = base;
    existing.desc = desc;
    updatedAR++;
  } else {
    state.ar.push({ id: no, no, terc, date: '2026-10-15', due: '2026-11-15', desc, base, rate: 0.16, conta: '41.1' });
    insertedAR++;
  }
});

assert.strictEqual(updatedAR, 1, '1 factura deve ter sido atualizada');
assert.strictEqual(insertedAR, 1, '1 factura nova deve ter sido inserida');
assert.strictEqual(state.ar.length, 2, 'Total de facturas AR deve ser 2');
assert.strictEqual(state.ar[0].base, 160000, 'Valor base da FT 2026/001 atualizado para 160000');
assert.strictEqual(state.ar[1].no, 'FT 2026/999', 'Nova factura FT 2026/999 adicionada');

console.log('✅ UPSERT em Facturas AR: 1 atualizada, 1 inserida com sucesso.');

console.log('\n===============================================================');
console.log('🎉 TODOS OS TESTES DE IMPORTAÇÃO E ATUALIZAÇÃO EXCEL PASSARAM COM SUCESSO!');
console.log('===============================================================');

