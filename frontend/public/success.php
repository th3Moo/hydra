<?php
// public/success.php - debrief page
require __DIR__ . '/../server/config.php';
$token = $_GET['t'] ?? '';
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Security Training</title>
<style>
  body{font-family:system-ui,Arial,sans-serif;background:#0a0f1f;color:#eee;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0}
  .card{background:#111a33;padding:2rem;border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.3);width:560px;text-align:center}
  h1{color:#06d6a0;margin:0 0 1rem}
  p{color:#ddd}
  a.button{display:inline-block;margin-top:1rem;padding:.7rem 1.1rem;background:#0ff;color:#001;border-radius:10px;text-decoration:none;font-weight:700}
</style>
</head>
<body>
  <div class="card">
    <h1>This was a training simulation ✔</h1>
    <p>No passwords were captured. We only recorded that you visited and clicked submit.</p>
    <p>Tips to spot phishing:</p>
    <ul style="text-align:left;line-height:1.5">
      <li>Always check the domain before entering credentials.</li>
      <li>Beware of urgent language and unexpected login prompts.</li>
      <li>Use a password manager and multi-factor authentication.</li>
    </ul>
    <a class="button" href="/report.php">Team Report</a>
  </div>
</body>
</html>
