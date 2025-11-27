<?php
header('Content-Type: application/json; charset=utf-8');

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data) || !isset($data['id']) || !isset($data['score'])) {
    echo json_encode(['status' => 'error', 'message' => 'bad payload']);
    exit;
}

$id = trim((string)$data['id']);
$name = isset($data['name']) ? trim((string)$data['name']) : '';
$score = (int)$data['score'];

$file = 'leaderboard.json';
$list = [];

if (file_exists($file)) {
    $json = file_get_contents($file);
    $tmp = json_decode($json, true);
    if (is_array($tmp)) {
        $list = $tmp;
    }
}

$found = false;

foreach ($list as $idx => $entry) {
    if (!isset($entry['id'])) {
        continue;
    }

    if ((string)$entry['id'] === $id) {
        // если ник пустой — удаляем запись (юзер больше не отображается)
        if ($name === '') {
            array_splice($list, $idx, 1);
        } else {
            $list[$idx]['name'] = $name;
            $oldScore = isset($entry['score']) ? (int)$entry['score'] : 0;
            if ($score > $oldScore) {
                $list[$idx]['score'] = $score;
            }
        }
        $found = true;
        break;
    }
}

// если не нашли запись по id и ник НЕ пустой — добавляем
if (!$found && $name !== '') {
    $list[] = [
        'id'    => $id,
        'name'  => $name,
        'score' => max(0, $score),
    ];
}

// сортировка по убыванию очков
usort($list, function ($a, $b) {
    $sa = isset($a['score']) ? (int)$a['score'] : 0;
    $sb = isset($b['score']) ? (int)$b['score'] : 0;
    return $sb <=> $sa;
});

// ограничим размер файла, например, топ 100
$list = array_slice($list, 0, 100);

file_put_contents(
    $file,
    json_encode($list, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)
);

echo json_encode(['status' => 'ok']);
