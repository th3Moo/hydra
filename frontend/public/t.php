<?php
// public/t.php - visit tracker and redirect to landing
require __DIR__ . '/../server/config.php';

$token = $_GET['t'] ?? '';
if (!$token) { http_response_code(400); exit('Missing token'); }

$pdo = db();
$stmt = $pdo->prepare('SELECT id, campaign_id FROM targets WHERE token=?');
$stmt->execute([$token]);
$target = $stmt->fetch();
if (!$target) { http_response_code(404); exit('Invalid token'); }

$pdo->prepare('INSERT INTO events(target_id, event_type, meta) VALUES(?, "open", NULL)')->execute([$target['id']]);

header('Location: /index.php?t=' . urlencode($token));
