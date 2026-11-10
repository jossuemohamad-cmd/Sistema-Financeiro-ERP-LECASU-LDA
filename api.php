<?php
/**
 * LECASU, LDA. - Sistema Financeiro ERP
 * API REST de Integração com Neon PostgreSQL (cPanel / PHP)
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Configuração da Base de Dados Neon PostgreSQL
define('NEON_CONN', 'postgresql://neondb_owner:npg_VOIEzcBv8ms9@ep-nameless-cake-bdoybgwr-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require');
define('NEON_ENDPOINT', 'https://ep-nameless-cake-bdoybgwr-pooler.c-8.us-east-2.aws.neon.tech/sql');

/**
 * Executa uma consulta SQL no Neon PostgreSQL via HTTPS SQL API
 */
function neonQuery($sql, $params = []) {
    $payload = json_encode([
        'query' => $sql,
        'params' => $params
    ], JSON_UNESCAPED_UNICODE);

    $ch = curl_init(NEON_ENDPOINT);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Neon-Connection-String: ' . NEON_CONN,
        'Content-Type: application/json',
        'Content-Length: ' . strlen($payload)
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 20);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr = curl_error($ch);
    curl_close($ch);

    if ($response === false) {
        throw new Exception('Erro de conexão com o banco Neon: ' . $curlErr);
    }

    $json = json_decode($response, true);
    if ($httpCode >= 400 || (isset($json['message']) && !isset($json['rows']))) {
        throw new Exception($json['message'] ?? 'Erro no PostgreSQL Neon');
    }

    return $json;
}

// Determinar a rota solicitada
$route = $_GET['route'] ?? '';
if (empty($route)) {
    $uri = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
    if (preg_match('#(?:api\.php/|/api/)(.+)#', $uri, $m)) {
        $route = $m[1];
    }
}
$route = trim($route, '/');
$method = $_SERVER['REQUEST_METHOD'];

try {
    // 1. Health Check
    if ($route === 'health' || empty($route)) {
        $res = neonQuery('SELECT current_database(), current_user, version()');
        $row = $res['rows'][0] ?? [];
        echo json_encode([
            'status' => 'online',
            'provider' => 'Neon PostgreSQL',
            'database' => $row['current_database'] ?? 'neondb',
            'user' => $row['current_user'] ?? 'neondb_owner',
            'version' => $row['version'] ?? ''
        ]);
        exit;
    }

    // 2. State (GET & POST)
    if ($route === 'state') {
        if ($method === 'GET') {
            $res = neonQuery("SELECT state, updated_at FROM tb_lecasu_state WHERE key = 'lecasu-recon-v1'");
            if (!empty($res['rows'])) {
                $row = $res['rows'][0];
                $state = is_string($row['state']) ? json_decode($row['state'], true) : $row['state'];
                echo json_encode([
                    'success' => true,
                    'state' => $state,
                    'updated_at' => $row['updated_at']
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Nenhum estado gravado ainda.'
                ]);
            }
            exit;
        }

        if ($method === 'POST') {
            $raw = file_get_contents('php://input');
            $data = json_decode($raw, true);
            $state = $data['state'] ?? null;
            if (!$state || !is_array($state)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Objeto de estado inválido.']);
                exit;
            }

            $stateJson = json_encode($state, JSON_UNESCAPED_UNICODE);
            neonQuery(
                "INSERT INTO tb_lecasu_state (key, state, updated_at) VALUES ('lecasu-recon-v1', $1::jsonb, NOW())
                 ON CONFLICT (key) DO UPDATE SET state = EXCLUDED.state, updated_at = NOW()",
                [$stateJson]
            );

            // Sincronizar tabelas relacionais no Neon PostgreSQL
            // Movimentos
            neonQuery("DELETE FROM tb_movimentos");
            if (!empty($state['mov']) && is_array($state['mov'])) {
                foreach ($state['mov'] as $mv) {
                    neonQuery(
                        "INSERT INTO tb_movimentos (id, date, \"desc\", cat, \"in\", \"out\", ref, tipo, conta, terc, doc, ext, estado)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)",
                        [
                            $mv['id'] ?? uniqid('m_'),
                            $mv['date'] ?? null,
                            $mv['desc'] ?? '',
                            $mv['cat'] ?? '',
                            (float)($mv['in'] ?? 0),
                            (float)($mv['out'] ?? 0),
                            $mv['ref'] ?? '',
                            $mv['tipo'] ?? '',
                            $mv['conta'] ?? '',
                            $mv['terc'] ?? '',
                            $mv['doc'] ?? '',
                            $mv['ext'] ?? null,
                            $mv['estado'] ?? 'Reconciliado'
                        ]
                    );
                }
            }

            // Facturas AR
            neonQuery("DELETE FROM tb_faturas_ar");
            if (!empty($state['ar']) && is_array($state['ar'])) {
                foreach ($state['ar'] as $ar) {
                    $base = (float)($ar['base'] ?? 0);
                    $rate = (float)($ar['rate'] ?? 0.16);
                    $tot = (float)($ar['tot'] ?? ($base * (1 + $rate)));
                    $pay = (float)($ar['pay'] ?? 0);
                    $sal = (float)($ar['sal'] ?? ($tot - $pay));
                    $st = $ar['st'] ?? ($sal <= 0.01 ? 'Liquidada' : ($pay > 0 ? 'Parcial' : 'Em aberto'));
                    neonQuery(
                        "INSERT INTO tb_faturas_ar (id, no, terc, date, due, base, rate, tot, pay, sal, st)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
                        [
                            $ar['id'] ?? uniqid('ar_'),
                            $ar['no'] ?? ($ar['num'] ?? ''),
                            $ar['terc'] ?? '',
                            $ar['date'] ?? ($ar['emissao'] ?? null),
                            $ar['due'] ?? ($ar['venc'] ?? null),
                            $base,
                            $rate,
                            $tot,
                            $pay,
                            $sal,
                            $st
                        ]
                    );
                }
            }

            // Facturas AP
            neonQuery("DELETE FROM tb_faturas_ap");
            if (!empty($state['ap']) && is_array($state['ap'])) {
                foreach ($state['ap'] as $ap) {
                    $base = (float)($ap['base'] ?? 0);
                    $rate = (float)($ap['rate'] ?? 0.16);
                    $tot = (float)($ap['tot'] ?? ($base * (1 + $rate)));
                    $pay = (float)($ap['pay'] ?? 0);
                    $sal = (float)($ap['sal'] ?? ($tot - $pay));
                    $st = $ap['st'] ?? ($sal <= 0.01 ? 'Liquidada' : ($pay > 0 ? 'Parcial' : 'Em aberto'));
                    neonQuery(
                        "INSERT INTO tb_faturas_ap (id, no, terc, date, due, base, rate, tot, pay, sal, st)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
                        [
                            $ap['id'] ?? uniqid('ap_'),
                            $ap['no'] ?? ($ap['num'] ?? ''),
                            $ap['terc'] ?? '',
                            $ap['date'] ?? ($ap['emissao'] ?? null),
                            $ap['due'] ?? ($ap['venc'] ?? null),
                            $base,
                            $rate,
                            $tot,
                            $pay,
                            $sal,
                            $st
                        ]
                    );
                }
            }

            // Terceiros
            neonQuery("DELETE FROM tb_terceiros");
            if (!empty($state['ter']) && is_array($state['ter'])) {
                foreach ($state['ter'] as $tr) {
                    neonQuery(
                        "INSERT INTO tb_terceiros (id, cod, nome, tipo, nuit, tel, email, cidade, saldo)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
                        [
                            $tr['id'] ?? uniqid('t_'),
                            $tr['cod'] ?? ($tr['id'] ?? ''),
                            $tr['nome'] ?? '',
                            $tr['tipo'] ?? 'Cliente',
                            $tr['nuit'] ?? '',
                            $tr['tel'] ?? '',
                            $tr['email'] ?? '',
                            $tr['cidade'] ?? ($tr['endereco'] ?? ''),
                            (float)($tr['saldo'] ?? 0)
                        ]
                    );
                }
            }

            // Materiais em Stock
            neonQuery("DELETE FROM tb_material_produtos");
            if (!empty($state['materia']) && is_array($state['materia'])) {
                foreach ($state['materia'] as $mt) {
                    neonQuery(
                        "INSERT INTO tb_material_produtos (id, cod, nome, cat, unidade, qtd, custo, preco, min, forn)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
                        [
                            $mt['id'] ?? uniqid('mat_'),
                            $mt['cod'] ?? '',
                            $mt['nome'] ?? ($mt['descr'] ?? ''),
                            $mt['cat'] ?? '',
                            $mt['unidade'] ?? ($mt['un'] ?? 'un'),
                            (float)($mt['qtd'] ?? 0),
                            (float)($mt['custo'] ?? ($mt['prc'] ?? 0)),
                            (float)($mt['preco'] ?? ($mt['prc'] ?? 0)),
                            (float)($mt['min'] ?? 0),
                            $mt['forn'] ?? ''
                        ]
                    );
                }
            }

            // Colaboradores RH
            neonQuery("DELETE FROM tb_colaboradores");
            if (!empty($state['rh']) && is_array($state['rh'])) {
                foreach ($state['rh'] as $c) {
                    neonQuery(
                        "INSERT INTO tb_colaboradores (id, cod, nome, cargo, dept, sal, nuit, inss, sit)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
                        [
                            $c['id'] ?? uniqid('rh_'),
                            $c['cod'] ?? ($c['id'] ?? ''),
                            $c['nome'] ?? '',
                            $c['cargo'] ?? '',
                            $c['dept'] ?? '',
                            (float)($c['sal'] ?? 0),
                            $c['nuit'] ?? '',
                            $c['inss'] ?? '',
                            $c['sit'] ?? 'Ativo'
                        ]
                    );
                }
            }

            // Ativos e Inventário
            neonQuery("DELETE FROM tb_ativos_inventario");
            if (!empty($state['ativos']) && is_array($state['ativos'])) {
                foreach ($state['ativos'] as $at) {
                    neonQuery(
                        "INSERT INTO tb_ativos_inventario (id, cod, \"desc\", cat, aquis, val, vida, dep)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
                        [
                            $at['id'] ?? uniqid('at_'),
                            $at['cod'] ?? '',
                            $at['desc'] ?? ($at['descr'] ?? ''),
                            $at['cat'] ?? '',
                            $at['aquis'] ?? null,
                            (float)($at['val'] ?? 0),
                            (float)($at['vida'] ?? 5),
                            (float)($at['dep'] ?? 0)
                        ]
                    );
                }
            }

            echo json_encode([
                'success' => true,
                'timestamp' => date('c')
            ]);
            exit;
        }
    }

    // 3. Reset Real do Sistema (Zerar Tudo)
    if ($route === 'reset') {
        // Limpar todas as tabelas operacionais no PostgreSQL
        neonQuery("TRUNCATE TABLE tb_movimentos, tb_faturas_ar, tb_faturas_ap, tb_terceiros, tb_material_produtos, tb_colaboradores, tb_ativos_inventario");

        // Zera os saldos das contas do Plano de Contas
        neonQuery("UPDATE tb_plano_contas SET saldo = 0, updated_at = CURRENT_TIMESTAMP");

        // Obter contas PGC estruturadas
        $resPc = neonQuery("SELECT cod, nome, classe, tipo FROM tb_plano_contas ORDER BY cod ASC");
        $pcTemplate = [];
        if (!empty($resPc['rows'])) {
            foreach ($resPc['rows'] as $r) {
                $pcTemplate[] = [
                    'id' => $r['cod'],
                    'cod' => $r['cod'],
                    'des' => $r['nome'],
                    'cls' => $r['classe'],
                    'tipo' => $r['tipo'],
                    'saldo' => 0
                ];
            }
        }

        $curYear = date('Y');
        $curMonth = date('m');
        $curDate = date('Y-m-d');

        $zeroState = [
            'ini' => 0,
            'ext' => 0,
            'ref' => $curDate,
            'mov' => [],
            'ar' => [],
            'ap' => [],
            'ter' => [],
            'materia' => [],
            'rh' => [],
            'ativos' => [],
            'book' => [],
            'ex' => [],
            'bank' => [],
            'pc' => $pcTemplate,
            'config' => [
                'empresa' => 'LECASU, LDA.',
                'nuit' => '400999888',
                'actividade' => 'Energias Renováveis, Instalações Solares e Engenharia Elétrica',
                'morada' => 'Av. 24 de Julho, n.º 1250, 4.º Andar, Maputo, Moçambique',
                'contacto' => '+258 84 123 4567 / +258 21 300 400',
                'email' => 'financeiro@lecasu.co.mz',
                'moeda' => 'MZN',
                'taxa_iva' => 0.16,
                'exercicio' => $curYear,
                'mes' => $curMonth,
                'banco_padrao' => '12.1.1',
                'contabilista' => 'Gabinete Contas Certas (Certificado n.º 4412/OCAM)'
            ]
        ];

        $zeroJson = json_encode($zeroState, JSON_UNESCAPED_UNICODE);
        neonQuery(
            "INSERT INTO tb_lecasu_state (key, state, updated_at) VALUES ('lecasu-recon-v1', $1::jsonb, NOW())
             ON CONFLICT (key) DO UPDATE SET state = EXCLUDED.state, updated_at = NOW()",
            [$zeroJson]
        );

        echo json_encode([
            'success' => true,
            'message' => 'Base de dados Neon PostgreSQL reposta a ZERO com sucesso. Todos os registos fictícios foram apagados.',
            'state' => $zeroState,
            'timestamp' => date('c')
        ]);
        exit;
    }

    // 4. Autenticação (Login)
    if ($route === 'auth/login') {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);
        $email = strtolower(trim($data['email'] ?? ''));

        $user = [
            'id' => 'usr_admin_1',
            'nome' => 'Josue Mahomad Esmael',
            'email' => $email ?: 'jossuemohamad@gmail.com',
            'cargo' => 'Director Geral & Administrador',
            'perfil' => 'admin'
        ];
        $token = 'jwt_lecasu_' . bin2hex(random_bytes(16)) . '_' . time();

        echo json_encode([
            'success' => true,
            'token' => $token,
            'user' => $user
        ]);
        exit;
    }

    // Rota não encontrada
    http_response_code(404);
    echo json_encode(['error' => 'Rota da API não encontrada: ' . $route]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
