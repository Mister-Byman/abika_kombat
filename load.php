<?php
if (!file_exists("data.json")) {
    echo json_encode(["coins" => 0, "power" => 1]);
    exit;
}

echo file_get_contents("data.json");
?>
