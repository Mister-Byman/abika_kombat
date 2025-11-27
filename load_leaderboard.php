<?php
header('Content-Type: application/json; charset=utf-8');

$file = 'leaderboard.json';

if (!file_exists($file)) {
    echo '[]';
    exit;
}

$content = file_get_contents($file);
if ($content === false || $content === '') {
    echo '[]';
    exit;
}

echo $content;
