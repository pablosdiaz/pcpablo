<?php
require_once 'db.php';

// Only allow execution from CLI
if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    die("Forbidden");
}

function fetch_rss($url) {
    $content = @file_get_contents($url);
    if ($content === false) {
        return false;
    }
    try {
        $rss = new SimpleXMLElement($content);
        return $rss;
    } catch (Exception $e) {
        return false;
    }
}

$sql = "SELECT id, url FROM sources";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $source_id = $row["id"];
        $url = $row["url"];

        $rss = fetch_rss($url);
        if ($rss) {
            foreach ($rss->channel->item as $item) {
                $title = $conn->real_escape_string((string)$item->title);
                $link = $conn->real_escape_string((string)$item->link);
                $description = $conn->real_escape_string((string)$item->description);
                $pub_date = date("Y-m-d H:i:s", strtotime((string)$item->pubDate));

                $image_url = "";
                // Try to get image from enclosure
                if (isset($item->enclosure)) {
                    foreach ($item->enclosure as $enclosure) {
                        if (strpos((string)$enclosure['type'], 'image') !== false) {
                            $image_url = (string)$enclosure['url'];
                            break;
                        }
                    }
                }

                // Try to get image from media:content
                if (empty($image_url) && isset($item->children('media', true)->content)) {
                    $media = $item->children('media', true)->content;
                    if (isset($media->attributes()->url)) {
                        $image_url = (string)$media->attributes()->url;
                    }
                }

                // Or fallback to an image tag in description if any (basic regex)
                if (empty($image_url) && preg_match('/<img[^>]+src=["\']([^"\']+)["\']/i', (string)$item->description, $match)) {
                     $image_url = $match[1];
                     $description = strip_tags($description);
                }

                $description = strip_tags($description); // Keep plain text

                $image_url = $conn->real_escape_string($image_url);

                $insert_sql = "INSERT INTO news (source_id, title, link, pub_date, image_url, description)
                               VALUES ('$source_id', '$title', '$link', '$pub_date', '$image_url', '$description')
                               ON DUPLICATE KEY UPDATE title=VALUES(title), image_url=VALUES(image_url)";
                $conn->query($insert_sql);
            }
        }
    }
}

echo "News fetched and updated.\n";
$conn->close();
?>
