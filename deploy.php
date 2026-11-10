<?php
/**
 * LECASU, LDA. - Webhook de Deploy Automático para cPanel
 * Atualiza o repositório git e sincroniza para a pasta pública
 */

// Chave secreta de autenticação
$secretToken = 'LecasuDeploy2026';

$tokenReceived = $_GET['token'] ?? $_POST['token'] ?? '';
$headers = getallheaders();
$headerToken = $headers['X-Deploy-Token'] ?? $headers['x-deploy-token'] ?? '';

if ($tokenReceived !== $secretToken && $headerToken !== $secretToken) {
    http_response_code(403);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'message' => 'Acesso negado: Token de autenticação inválido.'
    ]);
    exit;
}

$repoPath = '/home/mwxntafa/repositories/Sistema-Financeiro-ERP-LECASU-LDA';
$deployPath = '/home/mwxntafa/public_html/erp.lecasu.co.mz';

$output = [];
$status = 0;

// 1. Atualizar repositório Git local
exec("cd {$repoPath} && git fetch origin main 2>&1 && git reset --hard origin/main 2>&1", $output, $status);

// 2. Cópia direta garantida para a pasta do subdomínio erp.lecasu.co.mz
exec("/bin/mkdir -p {$deployPath} 2>&1", $output);
exec("/bin/cp -R {$repoPath}/assets {$deployPath}/ 2>&1", $output);
exec("/bin/cp -R {$repoPath}/css {$deployPath}/ 2>&1", $output);
exec("/bin/cp -R {$repoPath}/js {$deployPath}/ 2>&1", $output);
exec("/bin/cp -R {$repoPath}/db {$deployPath}/ 2>&1", $output);
exec("/bin/cp {$repoPath}/*.html {$deployPath}/ 2>&1", $output);
exec("/bin/cp {$repoPath}/*.js {$deployPath}/ 2>&1", $output);
exec("/bin/cp {$repoPath}/package.json {$deployPath}/ 2>&1", $output);
exec("/bin/cp {$repoPath}/manifest.webmanifest {$deployPath}/ 2>&1", $output);
exec("/bin/cp {$repoPath}/sw.js {$deployPath}/ 2>&1", $output);
exec("/bin/cp {$repoPath}/.htaccess {$deployPath}/ 2>&1", $output);
exec("/bin/cp {$repoPath}/*.php {$deployPath}/ 2>&1", $output);

// Captura commit atual
$currentCommit = exec("cd {$repoPath} && git rev-parse --short HEAD 2>&1");

header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'success' => true,
    'message' => 'LECASU ERP implementado com sucesso no cPanel!',
    'commit' => $currentCommit,
    'timestamp' => date('Y-m-d H:i:s'),
    'log' => $output
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

