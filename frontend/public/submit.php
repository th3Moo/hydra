<?php
// public/submit.php - record submission WITHOUT storing passwords
require __DIR__ . '/../server/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit('Method not allowed'); }
if (!csrf_check($_POST['csrf'] ?? '')) { http_response_code(400); exit('Bad CSRF'); }

$pdo = db();
$token = $_POST['t'] ?? '';
$email = strtolower(trim($_POST['email'] ?? ''));
$passLen = isset($_POST['password']) ? strlen((string)$_POST['password']) : 0;

// Lookup target by token
$stmt = $pdo->prepare('SELECT id FROM targets WHERE token=?');
$stmt->execute([$token]);
$target = $stmt->fetch();

if ($target) {
  $meta = json_encode(['email'=>$email, 'password_length'=>$passLen], JSON_UNESCAPED_SLASHES);
  $pdo->prepare('INSERT INTO events(target_id, event_type, meta) VALUES(?, "submit", ?)')->execute([$target['id'], $meta]);
}

header('Location: /success.php?t=' . urlencode($token));
