<?php
$servername = "localhost";
$username = "news_user";
$password = "password";
$dbname = "news_tv";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
