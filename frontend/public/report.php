<?php
// public/report.php - simple report by campaign
require __DIR__ . '/../server/config.php';
$pdo = db();

$campaign = $_GET['campaign'] ?? null;
if ($campaign) {
  $stmt = $pdo->prepare('SELECT id, name, slug FROM campaigns WHERE slug=?');
  $stmt->execute([$campaign]);
  $camp = $stmt->fetch();
  if (!$camp) { http_response_code(404); exit('Campaign not found'); }

  $rows = $pdo->prepare('
    SELECT targets.email, 
      SUM(CASE WHEN events.event_type="open" THEN 1 ELSE 0 END) AS opened,
      SUM(CASE WHEN events.event_type="submit" THEN 1 ELSE 0 END) AS submitted
    FROM targets
    LEFT JOIN events ON events.target_id = targets.id
    WHERE targets.campaign_id = ?
    GROUP BY targets.id
    ORDER BY submitted DESC, opened DESC, targets.email ASC
  ');
  $rows->execute([$camp['id']]);
  $data = $rows->fetchAll();
} else {
  // list campaigns
  $data = [];
  $q = $pdo->query('SELECT slug, name, created_at FROM campaigns ORDER BY created_at DESC');
  $list = $q->fetchAll();
}
?>
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Simulation Report</title>
<style>
  body{font-family:system-ui,Arial,sans-serif;background:#0b1224;color:#eee;margin:0;padding:2rem}
  h1{color:#0ff}
  table{width:100%;border-collapse:collapse;margin-top:1rem}
  th,td{padding:.6rem;border-bottom:1px solid #223;text-align:left}
  tr:hover{background:#121b36}
  a{color:#0ff;text-decoration:none}
  .card{background:#111a33;padding:1rem 1.2rem;border-radius:12px}
</style>
</head>
<body>
<?php if ($campaign): ?>
  <h1>Report — <?= h($camp['name']) ?> (<?= h($camp['slug']) ?>)</h1>
  <div class="card">
    <table>
      <thead><tr><th>Email</th><th>Opened</th><th>Submitted</th></tr></thead>
      <tbody>
      <?php foreach ($data as $r): ?>
        <tr>
          <td><?= h($r['email']) ?></td>
          <td><?= (int)$r['opened'] ?></td>
          <td><?= (int)$r['submitted'] ?></td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  </div>
  <p><a href="/report.php">← All campaigns</a></p>
<?php else: ?>
  <h1>Campaigns</h1>
  <div class="card">
    <ul>
      <?php foreach ($list as $c): ?>
        <li><a href="/report.php?campaign=<?= h($c['slug']) ?>"><?= h($c['name']) ?></a> — <small><?= h($c['created_at']) ?></small></li>
      <?php endforeach; ?>
    </ul>
  </div>
  <p><a href="/admin/links.php">Create campaign & links</a></p>
<?php endif; ?>
</body>
</html>
