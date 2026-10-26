<?php
header('Content-Type: application/json');
require_once 'db.php';

$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;

$sql = "SELECT n.id, n.title, n.link, n.pub_date, n.image_url, n.description, s.name as source_name
        FROM news n
        JOIN sources s ON n.source_id = s.id
        ORDER BY n.pub_date DESC
        LIMIT $limit";

$result = $conn->query($sql);
$news = [];

if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $news[] = $row;
    }
}

echo json_encode($news);
$conn->close();
?>
