<?php
// public/index.php - landing page (fake login training)
require __DIR__ . '/../server/config.php';

$token = $_GET['t'] ?? '';
$pdo = db();
$target = null;
if ($token) {
  $stmt = $pdo->prepare('SELECT targets.id as tid, email, campaigns.slug as cslug FROM targets JOIN campaigns ON campaigns.id=targets.campaign_id WHERE token=?');
  $stmt->execute([$token]);
  $target = $stmt->fetch();
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>SecureMail Portal</title>
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; form-action 'self'; base-uri 'self'; frame-ancestors 'none'">
  <style>
    body{font-family:system-ui,Arial,sans-serif;background:#0a0f1f;color:#eee;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0}
    .card{background:#111a33;padding:2rem;border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.3);width:360px}
    h1{margin:0 0 1rem;color:#0ff}
    label{display:block;margin:.6rem 0 .2rem}
    input{width:100%;padding:.6rem;border-radius:8px;border:1px solid #223;background:#0e1630;color:#eee}
    button{margin-top:1rem;width:100%;padding:.7rem 1rem;border:0;border-radius:10px;background:#06d6a0;color:#001;cursor:pointer;font-weight:700}
    .fine{font-size:.8rem;color:#bbb;margin-top:.6rem}
  </style>
</head>
<body>
  <div class="card">
    <h1>SecureMail</h1>
    <form method="post" action="/submit.php">
      <input type="hidden" name="csrf" value="<?= h(csrf_token()) ?>">
      <input type="hidden" name="t" value="<?= h($token) ?>">
      <label for="email">Email</label>
      <input id="email" name="email" type="email" value="<?= $target ? h($target['email']) : '' ?>" required>
      <label for="password">Password</label>
      <input id="password" name="password" type="password" required>
      <button>Sign in</button>
      <div class="fine">Note: This portal uses enhanced security checks.</div>
    </form>
    <div class="fine" style="margin-top:.8rem;">By proceeding you consent to our security training simulation.</div>
  </div>
</body>
</html>
