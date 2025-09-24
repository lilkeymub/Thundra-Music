<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Start session
if (session_status() === PHP_SESSION_NONE) {
    error_log("Starting session in dashboard.php");
    session_start();
} else {
    error_log("Session already started in dashboard.php");
}

// Force HTTPS
if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === 'off') {
    error_log("Forcing HTTPS redirect in dashboard.php");
    header('Location: https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
    exit();
}

// Database connection
$host = 'sql209.infinityfree.com';
$dbname = 'if0_38852888_thundramusic';
$username = 'if0_38852888';
$password = 'Malinga7';
$port = 3306;

$conn = new mysqli($host, $username, $password, $dbname, $port);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Auto-login using "Remember Me" cookie
if (!isset($_SESSION['username']) && isset($_COOKIE['remember_token']) && isset($_COOKIE['remember_user'])) {
    error_log("Attempting auto-login with remember me cookie");
    $token = $_COOKIE['remember_token'];
    $user = $_COOKIE['remember_user'];

    $stmt = $conn->prepare("SELECT Username FROM users WHERE LOWER(Username) = ? AND remember_token = ?");
    $stmt->bind_param("ss", $user, $token);
    $stmt->execute();
    $result = $stmt->get_result();
    $userData = $result->fetch_assoc();
    $stmt->close();

    if ($userData) {
        error_log("Auto-login successful for user: $user");
        $_SESSION['username'] = $user;
        $_SESSION['authToken'] = bin2hex(random_bytes(16));
        $expires = time() + (7 * 24 * 60 * 60);
        setcookie('remember_token', $token, $expires, "/", "", false, true);
        setcookie('remember_user', $user, $expires, "/", "", false, true);
    } else {
        error_log("Auto-login failed, clearing cookies");
        setcookie('remember_token', '', time() - 3600, "/");
        setcookie('remember_user', '', time() - 3600, "/");
        header("Location: https://thundramusic.infinityfreeapp.com/login.php");
        exit();
    }
}

// Check if user is authenticated
if (!isset($_SESSION['username']) || !isset($_SESSION['authToken'])) {
    error_log("User not authenticated, redirecting to login.php. Session: " . json_encode($_SESSION));
    header("Location: https://thundramusic.infinityfreeapp.com/login.php");
    exit();
}

error_log("User authenticated: " . $_SESSION['username']);
$username = $_SESSION['username'];

// Create song_interactions table if not exists
$conn->query("
    CREATE TABLE IF NOT EXISTS song_interactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        song_id VARCHAR(50) NOT NULL,
        username VARCHAR(50) NOT NULL,
        interaction_type ENUM('like', 'comment', 'rating', 'reaction', 'comment_like') NOT NULL,
        interaction_value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
");

// Track play counts (daily limit of 5 for free users)
if (!isset($_SESSION['play_count'])) {
    $_SESSION['play_count'] = 0;
    $_SESSION['play_date'] = date('Y-m-d');
}

// Reset play count if it's a new day
if ($_SESSION['play_date'] !== date('Y-m-d')) {
    $_SESSION['play_count'] = 0;
    $_SESSION['play_date'] = date('Y-m-d');
}

// Handle user interactions (like, comment, rating, reaction)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['song_id']) && isset($_POST['interaction']) && isset($_POST['value'])) {
    $song_id = $conn->real_escape_string($_POST['song_id']);
    $interaction_type = $conn->real_escape_string($_POST['interaction']);
    $interaction_value = $conn->real_escape_string($_POST['value']);
    $username = $_SESSION['username'] ?? 'Guest';

    if ($interaction_type === 'comment') {
        $stmt = $conn->prepare("INSERT INTO song_interactions (song_id, username, interaction_type, interaction_value) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $song_id, $username, $interaction_type, $interaction_value);
    } elseif ($interaction_type === 'comment_like') {
        $comment_id = $interaction_value;
        $stmt = $conn->prepare("INSERT INTO song_interactions (song_id, username, interaction_type, interaction_value) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $song_id, $username, $interaction_type, $comment_id);
    } else {
        $stmt = $conn->prepare("INSERT INTO song_interactions (song_id, username, interaction_type, interaction_value) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $song_id, $username, $interaction_type, $interaction_value);
    }
    $stmt->execute();
    $stmt->close();

    // Return updated count
    $response = ['count' => getInteractionCount($conn, $song_id, $interaction_type)];
    if ($interaction_type === 'comment') {
        $comments = getComments($conn, $song_id);
        $response['comments'] = $comments;
    }
    echo json_encode($response);
    exit;
}

// Fetch comments for live update
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['song_id'])) {
    $song_id = $conn->real_escape_string($_GET['song_id']);
    $comments = getComments($conn, $song_id);
    echo json_encode($comments);
    exit;
}

// Fetch interaction counts
function getInteractionCount($conn, $song_id, $type) {
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM song_interactions WHERE song_id = ? AND interaction_type = ?");
    $stmt->bind_param("ss", $song_id, $type);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    return $result['count'];
}

function getComments($conn, $song_id) {
    $stmt = $conn->prepare("
        SELECT si.interaction_value as comment, si.username, 
               (SELECT COUNT(*) FROM song_interactions si2 WHERE si2.song_id = si.song_id AND si2.interaction_type = 'comment_like' AND si2.interaction_value = si.id) as likes
        FROM song_interactions si
        WHERE si.song_id = ? AND si.interaction_type = 'comment'
        ORDER BY likes DESC
    ");
    $stmt->bind_param("s", $song_id);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    return $result;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Thundra Music - <?php echo htmlspecialchars($username); ?> Dashboard</title>
<link rel="icon" type="image/x-icon" href="THUNDRA MUSIC.png">
<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
<link rel="stylesheet" href="dashboard.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
<style>
    html, body {
        position: relative;
        overflow-x: hidden;
        margin: 0;
        padding: 0;
        height: 100%;
    }
    #background-canvas {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        opacity: 0.05;
    }
    .container, section, footer, div {
        position: relative;
        z-index: 1;
    }
    #sidebar {
        position: fixed;
        top: 0;
        left: 0;
        height: 100%;
        transition: width 0.3s ease;
        z-index: 20;
    }
    #sidebar nav {
        max-height: calc(100vh - 12rem);
        overflow-y: hidden;
    }
    #sidebar nav:hover {
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: #ffcccc transparent;
    }
    #sidebar.dark nav:hover {
        scrollbar-color: #ffcccc transparent;
    }
    #sidebar nav::-webkit-scrollbar {
        width: 6px;
    }
    #sidebar nav::-webkit-scrollbar-track {
        background: transparent;
    }
    #sidebar nav::-webkit-scrollbar-thumb {
        background: transparent;
    }
    #sidebar nav:hover::-webkit-scrollbar-thumb {
        background: #ffcccc;
        border-radius: 3px;
    }
    #sidebar nav:hover::-webkit-scrollbar-thumb:hover {
        background: #ff9999;
    }
    .popup-content {
        max-height: 70vh;
        overflow-y: hidden;
    }
    .popup-content:hover {
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: #ffcccc transparent;
    }
    .dark .popup-content:hover {
        scrollbar-color: #ffcccc transparent;
    }
    .popup-content::-webkit-scrollbar {
        width: 6px;
    }
    .popup-content::-webkit-scrollbar-track {
        background: transparent;
    }
    .popup-content::-webkit-scrollbar-thumb {
        background: transparent;
    }
    .popup-content:hover::-webkit-scrollbar-thumb {
        background: #ffcccc;
        border-radius: 3px;
    }
    .popup-content:hover::-webkit-scrollbar-thumb:hover {
        background: #ff9999;
    }
    @media (max-width: 768px) {
        #sidebar {
            width: 4rem;
            background-color: #f3f4f6;
        }
        #sidebar.dark {
            background-color: #1f2937;
        }
        #sidebar.expanded {
            width: 16rem;
            background-color: #f3f4f6;
        }
        #sidebar.dark.expanded {
            background-color: #1f2937;
        }
        #main-content {
            margin-left: 4rem;
        }
        #main-content.expanded {
            margin-left: 0;
        }
        #footer {
            left: 4rem;
        }
        #footer.expanded {
            left: 0;
        }
        #sidebar-title {
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 0.9rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        #sidebar.expanded #sidebar-title {
            justify-content: flex-start;
            font-size: 1.5rem;
        }
        .sidebar-text {
            display: none;
        }
        #sidebar.expanded .sidebar-text {
            display: block;
            font-size: 1rem;
            white-space: normal;
        }
        .sidebar-link {
            justify-content: center;
            padding-left: 0;
            padding-right: 0;
        }
        #sidebar.expanded .sidebar-link {
            justify-content: flex-start;
            padding: 0.5rem 1rem;
        }
        #toggle-icon {
            transform: rotate(0deg);
        }
        .grid-cols-3 {
            grid-template-columns: 1fr;
        }
        h1 {
            font-size: 1.5rem;
        }
        h2 {
            font-size: 1.25rem;
        }
        .text-sm {
            font-size: 0.75rem;
        }
        #search-bar-container {
            justify-content: center;
            padding: 0.5rem;
        }
        #search-bar-container input {
            display: none;
        }
        #sidebar.expanded #search-bar-container {
            justify-content: flex-start;
            padding: 0.5rem 1rem;
        }
        #sidebar.expanded #search-bar-container input {
            display: block;
            font-size: 0.9rem;
            text-align: left;
        }
        #music-player {
            flex-direction: column;
            padding: 0.5rem;
            height: auto;
        }
        #music-player .flex.items-center {
            margin-bottom: 0.5rem;
        }
        #player-artwork {
            width: 40px;
            height: 40px;
        }
        #player-title, #player-artist {
            font-size: 0.8rem;
        }
        #progress-bar, #volume-bar {
            width: 100%;
            margin: 0.5rem 0;
        }
        #current-time, #duration {
            font-size: 0.7rem;
        }
        #music-player .space-x-4 {
            justify-content: space-between;
            width: 100%;
        }
        #music-player button i {
            font-size: 1rem;
        }
        #queue-btn {
            margin-left: 0.5rem;
        }
    }
    @media (min-width: 769px) {
        #sidebar {
            width: 4rem;
        }
        #sidebar.expanded {
            width: 16rem;
        }
        #main-content {
            margin-left: 4rem;
        }
        #main-content.expanded {
            margin-left: 16rem;
        }
        #footer {
            left: 4rem;
        }
        #footer.expanded {
            left: 16rem;
        }
        #sidebar-title {
            display: none;
        }
        #sidebar.expanded #sidebar-title {
            display: flex;
        }
        .sidebar-text {
            display: none;
        }
        #sidebar.expanded .sidebar-text {
            display: block;
        }
        .sidebar-link {
            justify-content: center;
            padding-left: 0;
            padding-right: 0;
        }
        #sidebar.expanded .sidebar-link {
            justify-content: flex-start;
            padding: 0.5rem 1rem;
        }
    }
    #sidebar:not(.expanded) #toggle-sidebar {
        display: flex;
        justify-content: center;
        padding-left: 0;
        padding-right: 0;
    }
    #sidebar:not(.expanded) .sidebar-link {
        display: flex;
    }
    .sidebar-link.active {
        background-color: #e02424;
        color: white;
    }
    .sidebar-link.active i {
        color: white;
    }
    #search-bar-container {
        display: flex;
        align-items: center;
        py-2 px-4;
        background-color: #f9fafb;
        dark:bg-gray-800;
        border-radius: 0.25rem;
        margin-bottom: 1rem;
    }
    .dark #search-bar-container {
        background-color: #1f2937;
    }
    #search-bar-container i {
        color: #e02424;
        width: 1.5rem;
        text-align: center;
        flex-shrink: 0;
    }
    @media (min-width: 769px) {
        #search-bar-container {
            padding: 0.5rem;
            justify-content: center;
        }
        #sidebar.expanded #search-bar-container {
            justify-content: flex-start;
            padding: 0.5rem 1rem;
        }
    }
    #search-bar-container input {
        flex: 1;
        background-color: transparent;
        border: none;
        color: #1f2937;
        dark:color-white;
        outline: none;
        font-size: 0.9rem;
    }
    .dark #search-bar-container input {
        color: white;
    }
    #search-bar-container input::placeholder {
        color: #6b7280;
        dark:color-gray-400;
    }
    #music-player {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        background-color: #ffffff;
        dark:bg-gray-900;
        border-top: 1px solid #e02424;
        z-index: 10;
        display: none;
        padding: 1rem;
    }
    .dark #music-player {
        background-color: #1f2937;
    }
    #music-player.fullscreen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 100;
        background-color: rgba(0, 0, 0, 0.9);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    #music-player.fullscreen #player-artwork {
        width: 50%;
        height: auto;
        max-height: 50%;
        margin-bottom: 1rem;
        transition: opacity 0.3s ease;
    }
    #music-player.fullscreen #player-artwork.lyrics-active {
        opacity: 0.3;
    }
    #music-player.fullscreen .player-controls {
        width: 100%;
        max-width: 500px;
    }
    #music-player.fullscreen #lyrics-overlay {
        position: absolute;
        top: 20%;
        width: 80%;
        max-width: 500px;
        text-align: center;
        color: white;
        font-size: 1.2rem;
        display: none;
    }
    #music-player.fullscreen #lyrics-overlay.active {
        display: block;
    }
    #progress-bar {
        width: 100%;
        height: 4px;
        background-color: #e5e7eb;
        border-radius: 2px;
        cursor: pointer;
    }
    #progress {
        height: 100%;
        background-color: #e02424;
        width: 0%;
        border-radius: 2px;
    }
    #volume-bar {
        width: 100px;
        height: 4px;
        background-color: #e5e7eb;
        border-radius: 2px;
        cursor: pointer;
    }
    #volume {
        height: 100%;
        background-color: #e02424;
        width: 100%;
        border-radius: 2px;
    }
    #close-player, #hide-player, #fullscreen-btn {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background-color: rgba(229, 62, 62, 0.5);
        color: white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }
    #hide-player {
        right: 2.5rem;
        background-color: rgba(229, 62, 62, 0.3);
    }
    #fullscreen-btn {
        right: 4.5rem;
        background-color: rgba(229, 62, 62, 0.3);
    }
    #close-player:hover, #hide-player:hover, #fullscreen-btn:hover {
        background-color: rgba(229, 62, 62, 0.8);
    }
    #lyrics-btn {
        position: absolute;
        top: 0.5rem;
        right: 6.5rem;
        background-color: rgba(229, 62, 62, 0.3);
        color: white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: none;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }
    #lyrics-btn:hover {
        background-color: rgba(229, 62, 62, 0.8);
    }
    #music-player.fullscreen #lyrics-btn {
        display: flex;
    }
    #player-toggle {
        position: fixed;
        bottom: 1rem;
        right: 1rem;
        background-color: #e02424;
        color: white;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: none;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }
    #main-content {
        padding-bottom: 5rem;
    }
    .song-card {
        position: relative;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        border-radius: 0.75rem;
        overflow: hidden;
        background-color: #ffffff;
        dark:bg-gray-900;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }
    .dark .song-card {
        background-color: #1a202c;
    }
    .song-card:hover {
        transform: scale(1.03);
        box-shadow: 0 8px 20px rgba(229, 62, 62, 0.15);
    }
    .song-card img {
        border-radius: 0.75rem 0.75rem 0 0;
        position: relative;
        width: 100%;
        height: 150px;
        object-fit: cover;
    }
    .song-card::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 150px;
        background: linear-gradient(to bottom, rgba(229, 62, 62, 0.15), transparent);
        pointer-events: none;
    }
    .song-card-content {
        padding: 0.75rem;
    }
    .song-card p.song-title {
        font-size: 1rem;
        font-weight: 600;
        color: #1f2937;
        dark:color-white;
        margin-bottom: 0.25rem;
    }
    .song-card p.song-meta {
        font-size: 0.8rem;
        color: #6b7280;
        dark:color-gray-400;
    }
    .song-options {
        position: absolute;
        top: 0.5rem;
        left: 0.5rem;
        cursor: pointer;
        z-index: 10;
        background-color: rgba(255, 255, 255, 0.8);
        dark:bg-gray-800;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .dark .song-options {
        background-color: rgba(31, 41, 55, 0.8);
    }
    .song-options-menu {
        position: absolute;
        top: 2.5rem;
        left: 0.5rem;
        background-color: #ffffff;
        dark:bg-gray-800;
        border: 1px solid #e02424;
        border-radius: 0.5rem;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        z-index: 20;
        display: none;
        animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .dark .song-options-menu {
        background-color: #1f2937;
    }
    .song-options-menu a {
        display: block;
        padding: 0.5rem 1rem;
        color: #e02424;
        text-decoration: none;
        font-size: 0.85rem;
        transition: background-color 0.2s ease;
    }
    .song-options-menu a:hover {
        background-color: #e02424;
        color: white;
    }
    .play-btn {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(229, 62, 62, 0.7);
        color: white;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    .song-card:hover .play-btn {
        opacity: 1;
    }
    .play-btn:hover {
        cursor: pointer;
    }
    .popup {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 100;
        align-items: center;
        justify-content: center;
    }
    .popup-content {
        background-color: #ffffff;
        dark:bg-gray-900;
        border: 2px solid #e02424;
        border-radius: 1rem;
        padding: 1.5rem;
        width: 90%;
        max-width: 500px;
        position: relative;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }
    .dark .popup-content {
        background-color: #1f2937;
    }
    .popup-close {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background-color: rgba(229, 62, 62, 0.5);
        color: white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }
    .popup-close:hover {
        background-color: rgba(229, 62, 62, 0.8);
    }
    .popup-content h3 {
        color: #e02424;
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 1rem;
    }
    .popup-content p {
        color: #1f2937;
        dark:color-white;
        font-size: 0.95rem;
        margin-bottom: 0.5rem;
    }
    .dark .popup-content p {
        color: white;
    }
    .popup-content img {
        width: 100%;
        height: 150px;
        object-fit: cover;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
    }
    .download-btn {
        background-color: #e02424;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        text-align: center;
        display: inline-block;
        margin-top: 1rem;
        transition: background-color 0.3s ease;
    }
    .download-btn:hover {
        background-color: #b91c1c;
    }
    .lyrics-line.current {
        color: #e02424;
        font-weight: 600;
    }
    .song-interactions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem;
        font-size: 0.75rem;
        color: #6b7280;
        dark:color-gray-400;
    }
    .song-interactions i {
        margin-right: 0.25rem;
    }
    .song-interactions span {
        cursor: pointer;
        transition: color 0.3s ease;
    }
    .song-interactions span:hover {
        color: #e02424;
    }
    .song-interactions .liked {
        color: #e02424;
    }
    .comment-preview {
        font-size: 0.7rem;
        color: #6b7280;
        dark:color-gray-400;
        padding: 0 0.75rem 0.5rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .share-option {
        display: flex;
        align-items: center;
        padding: 0.5rem;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }
    .share-option:hover {
        background-color: #f3f4f6;
        dark:bg-gray-700;
    }
    .share-option i {
        margin-right: 0.5rem;
        color: #e02424;
    }
    .premium-btn {
        position: relative;
        overflow: hidden;
        background: linear-gradient(90deg, #e02424, #b91c1c, #e02424);
        background-size: 200%;
        animation: premiumGlow 3s infinite;
        display: none;
    }
    #sidebar.expanded .premium-btn {
        display: flex;
    }
    @keyframes premiumGlow {
        0% { background-position: 0%; }
        50% { background-position: 200%; }
        100% { background-position: 0%; }
    }
    .premium-btn::before {
        content: '✨ Free Session - Upgrade Now! ✨';
        position: absolute;
        top: -2rem;
        left: 0;
        right: 0;
        text-align: center;
        color: white;
        font-size: 0.75rem;
        font-weight: bold;
        background: rgba(229, 62, 62, 0.8);
        padding: 0.25rem;
        animation: slideDown 5s infinite;
    }
    @keyframes slideDown {
        0% { transform: translateY(-100%); opacity: 0; }
        20% { transform: translateY(0); opacity: 1; }
        80% { transform: translateY(0); opacity: 1; }
        100% { transform: translateY(100%); opacity: 0; }
    }
    .queue-item {
        display: flex;
        align-items: center;
        padding: 0.5rem;
        border-bottom: 1px solid #e5e7eb;
        dark:border-gray-700;
    }
    .queue-item img {
        width: 40px;
        height: 40px;
        object-fit: cover;
        margin-right: 0.5rem;
        border-radius: 0.25rem;
    }
    .queue-item p {
        flex: 1;
    }
    .queue-item button {
        background-color: #e02424;
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.75rem;
    }
    .rating-stars i {
        color: #e5e7eb;
        dark:color-gray-600;
        cursor: pointer;
    }
    .rating-stars i.rated {
        color: #e02424;
    }
    .engage-btn {
        background-color: #e02424;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        text-align: center;
        display: block;
        margin-top: 1rem;
        transition: background-color 0.3s ease;
    }
    .engage-btn:hover {
        background-color: #b91c1c;
    }
    #logout-btn {
        background-color: #e02424;
        color: white;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: 0.5rem;
    }
    #logout-btn:hover {
        background-color: #b91c1c;
    }
    .comment-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
        border-bottom: 1px solid #e5e7eb;
        dark:border-gray-700;
    }
    .comment-item .like-btn {
        display: flex;
        align-items: center;
    }
    #ai-music-maker {
        background-color: #e02424;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-size: 1rem;
        transition: background-color 0.3s ease;
    }
    #ai-music-maker:hover {
        background-color: #b91c1c;
    }
    #ai-music-maker i {
        margin-right: 0.5rem;
    }
    .dark #background-canvas {
        filter: brightness(0.3);
    }
</style>
</head>
<body class="bg-white dark:bg-black text-black dark:text-white min-h-screen page-transition">
<!-- Background Canvas -->
<canvas id="background-canvas"></canvas>

c

    <!-- Main Content -->
    <main id="main-content" class="p-8 w-full transition-all duration-300">
        <div class="flex justify-between items-center mb-6">
            <h1 id="welcome-user" class="text-3xl font-bold text-red-600">Welcome, <?php echo htmlspecialchars($username); ?>!</h1>
            <div class="flex items-center">
                <button id="theme-toggle" class="text-red-600 hover:text-red-700 focus:outline-none mr-2">
                    <i id="theme-icon" class="fas fa-moon text-2xl"></i>
                </button>
                <button id="logout-btn" title="Logout" class="bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center">
                    <i class="fas fa-sign-out-alt text-lg"></i>
                </button>
            </div>
        </div>

        <!-- Music Section -->
        <section id="music" class="content-section">
            <h2 class="text-2xl font-semibold">Music Catalogue</h2>
            <p class="text-sm">You have <span id="play-count"><?php echo 5 - $_SESSION['play_count']; ?></span> songs available today. Upgrade to premium for unlimited access!</p>

            <!-- Afrobeat/AfroCongo -->
            <div class="mt-6">
                <h3 class="text-xl font-semibold">Afrobeat/AfroCongo</h3>
                <div class="mt-2">
                    <h4 class="text-lg font-medium">Latest AfroCongo</h4>
                    <div class="grid grid-cols-3 gap-4 mt-2">
                        <div class="song-card relative" 
                             data-song="music3" 
                             data-title="Dance avec moi" 
                             data-artist="Benyewe" 
                             data-type="AfroCongo" 
                             data-story="Music title: Dance avec moi, Singer: Benyewe, Type: AfroCongo" 
                             data-info="Genre: AfroCongo | Duration: Unknown" 
                             data-performance="Streams: 0 | Likes: 0" 
                             data-lyrics='[]'
                             data-url="https://thundramusic.infinityfreeapp.com/music/3.mp3"
                             data-biography="Music title: Dance avec moi, Singer: Benyewe">
                            <div class="song-options">
                                <i class="fas fa-ellipsis-v text-red-600"></i>
                                <div class="song-options-menu">
                                    <a href="#" class="song-biography">Biography</a>
                                    <a href="#" class="song-queue">Add to Queue</a>
                                    <a href="#" class="song-lyrics">Lyrics</a>
                                    <a href="#" class="song-download">Download</a>
                                </div>
                            </div>
                            <button class="play-btn" style="cursor: pointer;"><i class="fas fa-play text-white text-2xl"></i></button>
                            <img src="https://thundramusic.infinityfreeapp.com/images/3.png" alt="Dance avec moi" class="w-full h-32 object-cover">
                            <div class="song-card-content">
                                <p class="song-title">Dance avec moi - Benyewe</p>
                                <p class="song-meta">AfroCongo | Unknown</p>
                                <div class="song-interactions">
                                    <span class="like-btn"><i class="fas fa-heart"></i> <span id="like-count-music3"><?php echo getInteractionCount($conn, 'music3', 'like'); ?></span></span>
                                    <span class="rating-stars">
                                        <i class="fas fa-star rate" data-song="music3" data-star="1"></i>
                                        <i class="fas fa-star rate" data-song="music3" data-star="2"></i>
                                        <i class="fas fa-star rate" data-song="music3" data-star="3"></i>
                                        <i class="fas fa-star rate" data-song="music3" data-star="4"></i>
                                        <i class="fas fa-star rate" data-song="music3" data-star="5"></i>
                                    </span>
                                    <span class="share-btn"><i class="fas fa-share"></i> Share</span>
                                    <span class="comment-btn"><i class="fas fa-comment"></i> <span id="comment-count-music3"><?php echo getInteractionCount($conn, 'music3', 'comment'); ?></span></span>
                                    <span class="reaction-btn"><i class="fas fa-smile"></i> <span id="reaction-count-music3"><?php echo getInteractionCount($conn, 'music3', 'reaction'); ?></span></span>
                                </div>
                                <div class="comment-preview" id="comment-preview-music3">
                                    <?php
                                    $comments = getComments($conn, 'music3');
                                    echo !empty($comments) ? "Top Comment: \"{$comments[0]['comment']}\" - {$comments[0]['username']} (Likes: {$comments[0]['likes']})" : "No comments yet";
                                    ?>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Rumba -->
            <div class="mt-6">
                <h3 class="text-xl font-semibold">Rumba</h3>
                <div class="mt-2">
                    <h4 class="text-lg font-medium">Latest Rumba</h4>
                    <div class="grid grid-cols-3 gap-4 mt-2">
                        <div class="song-card relative" 
                             data-song="music6" 
                             data-title="Bolingo Eza Poison" 
                             data-artist="Madidi" 
                             data-type="Rumba" 
                             data-story="Music title: Bolingo Eza Poison, Singer: Madidi, Album: Bolingo, Type: Rumba" 
                             data-info="Genre: Rumba | Duration: Unknown" 
                             data-performance="Streams: 0 | Likes: 0" 
                             data-lyrics='[]'
                             data-url="https://thundramusic.infinityfreeapp.com/music/8.mp3"
                             data-biography="Music title: Bolingo Eza Poison, Singer: Madidi, Album: Bolingo">
                            <div class="song-options">
                                <i class="fas fa-ellipsis-v text-red-600"></i>
                                <div class="song-options-menu">
                                    <a href="#" class="song-biography">Biography</a>
                                    <a href="#" class="song-queue">Add to Queue</a>
                                    <a href="#" class="song-lyrics">Lyrics</a>
                                    <a href="#" class="song-download">Download</a>
                                </div>
                            </div>
                            <button class="play-btn" style="cursor: pointer;"><i class="fas fa-play text-white text-2xl"></i></button>
                            <img src="https://thundramusic.infinityfreeapp.com/images/8.png" alt="Bolingo Eza Poison" class="w-full h-32 object-cover">
                            <div class="song-card-content">
                                <p class="song-title">Bolingo Eza Poison - Madidi</p>
                                <p class="song-meta">Rumba | Unknown</p>
                                <div class="song-interactions">
                                    <span class="like-btn"><i class="fas fa-heart"></i> <span id="like-count-music6"><?php echo getInteractionCount($conn, 'music6', 'like'); ?></span></span>
                                    <span class="rating-stars">
                                        <i class="fas fa-star rate" data-song="music6" data-star="1"></i>
                                        <i class="fas fa-star rate" data-song="music6" data-star="2"></i>
                                        <i class="fas fa-star rate" data-song="music6" data-star="3"></i>
                                        <i class="fas fa-star rate" data-song="music6" data-star="4"></i>
                                        <i class="fas fa-star rate" data-song="music6" data-star="5"></i>
                                    </span>
                                    <span class="share-btn"><i class="fas fa-share"></i> Share</span>
                                    <span class="comment-btn"><i class="fas fa-comment"></i> <span id="comment-count-music6"><?php echo getInteractionCount($conn, 'music6', 'comment'); ?></span></span>
                                    <span class="reaction-btn"><i class="fas fa-smile"></i> <span id="reaction-count-music6"><?php echo getInteractionCount($conn, 'music6', 'reaction'); ?></span></span>
                                </div>
                                <div class="comment-preview" id="comment-preview-music6">
                                    <?php
                                    $comments = getComments($conn, 'music6');
                                    echo !empty($comments) ? "Top Comment: \"{$comments[0]['comment']}\" - {$comments[0]['username']} (Likes: {$comments[0]['likes']})" : "No comments yet";
                                    ?>
                                </div>
                            </div>
                        </div>
                        <div class="song-card relative" 
                             data-song="music7" 
                             data-title="Nzela ya Bolingo" 
                             data-artist="Madidi" 
                             data-type="Rumba" 
                             data-story="Music title: Nzela ya Bolingo, Singer: Madidi, Album: Bolingo, Type: Rumba" 
                             data-info="Genre: Rumba | Duration: Unknown" 
                             data-performance="Streams: 0 | Likes: 0" 
                             data-lyrics='[]'
                             data-url="https://thundramusic.infinityfreeapp.com/music/11.mp3"
                             data-biography="Music title: Nzela ya Bolingo, Singer: Madidi, Album: Bolingo">
                            <div class="song-options">
                                <i class="fas fa-ellipsis-v text-red-600"></i>
                                <div class="song-options-menu">
                                    <a href="#" class="song-biography">Biography</a>
                                    <a href="#" class="song-queue">Add to Queue</a>
                                    <a href="#" class="song-lyrics">Lyrics</a>
                                    <a href="#" class="song-download">Download</a>
                                </div>
                            </div>
                            <button class="play-btn" style="cursor: pointer;"><i class="fas fa-play text-white text-2xl"></i></button>
                            <img src="https://thundramusic.infinityfreeapp.com/images/11.png" alt="Nzela ya Bolingo" class="w-full h-32 object-cover">
                            <div class="song-card-content">
                                <p class="song-title">Nzela ya Bolingo - Madidi</p>
                                <p class="song-meta">Rumba | Unknown</p>
                                <div class="song-interactions">
                                    <span class="like-btn"><i class="fas fa-heart"></i> <span id="like-count-music7"><?php echo getInteractionCount($conn, 'music7', 'like'); ?></span></span>
                                    <span class="rating-stars">
                                        <i class="fas fa-star rate" data-song="music7" data-star="1"></i>
                                        <i class="fas fa-star rate" data-song="music7" data-star="2"></i>
                                        <i class="fas fa-star rate" data-song="music7" data-star="3"></i>
                                        <i class="fas fa-star rate" data-song="music7" data-star="4"></i>
                                        <i class="fas fa-star rate" data-song="music7" data-star="5"></i>
                                    </span>
                                    <span class="share-btn"><i class="fas fa-share"></i> Share</span>
                                    <span class="comment-btn"><i class="fas fa-comment"></i> <span id="comment-count-music7"><?php echo getInteractionCount($conn, 'music7', 'comment'); ?></span></span>
                                    <span class="reaction-btn"><i class="fas fa-smile"></i> <span id="reaction-count-music7"><?php echo getInteractionCount($conn, 'music7', 'reaction'); ?></span></span>
                                </div>
                                <div class="comment-preview" id="comment-preview-music7">
                                    <?php
                                    $comments = getComments($conn, 'music7');
                                    echo !empty($comments) ? "Top Comment: \"{$comments[0]['comment']}\" - {$comments[0]['username']} (Likes: {$comments[0]['likes']})" : "No comments yet";
                                    ?>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Latina + French Rap -->
            <div class="mt-6">
                <h3 class="text-xl font-semibold">Latina + French Rap</h3>
                <div class="mt-2">
                    <h4 class="text-lg font-medium">Latest Latina + French Rap</h4>
                    <div class="grid grid-cols-3 gap-4 mt-2">
                        <div class="song-card relative" 
                             data-song="music1" 
                             data-title="Bouge Bouge" 
                             data-artist="White Latina" 
                             data-type="Latina + French Rap" 
                             data-story="Music title: Bouge Bouge, Singer: White Latina, Album: Off Vamos!, Type: Latina + French Rap" 
                             data-info="Genre: Latina + French Rap | Duration: Unknown" 
                             data-performance="Streams: 0 | Likes: 0" 
                             data-lyrics='[]'
                             data-url="https://thundramusic.infinityfreeapp.com/music/1.mp3"
                             data-biography="Music title: Bouge Bouge, Singer: White Latina, Album: Off Vamos!, Type: Latina + French Rap">
                            <div class="song-options">
                                <i class="fas fa-ellipsis-v text-red-600"></i>
                                <div class="song-options-menu">
                                    <a href="#" class="song-biography">Biography</a>
                                    <a href="#" class="song-queue">Add to Queue</a>
                                    <a href="#" class="song-lyrics">Lyrics</a>
                                    <a href="#" class="song-download">Download</a>
                                </div>
                            </div>
                            <button class="play-btn" style="cursor: pointer;"><i class="fas fa-play text-white text-2xl"></i></button>
                            <img src="https://thundramusic.infinityfreeapp.com/images/1.png" alt="Bouge Bouge" class="w-full h-32 object-cover">
                            <div class="song-card-content">
                                <p class="song-title">Bouge Bouge - White Latina</p>
                                <p class="song-meta">Latina + French Rap | Unknown</p>
                                <div class="song-interactions">
                                    <span class="like-btn"><i class="fas fa-heart"></i> <span id="like-count-music1"><?php echo getInteractionCount($conn, 'music1', 'like'); ?></span></span>
                                    <span class="rating-stars">
                                        <i class="fas fa-star rate" data-song="music1" data-star="1"></i>
                                        <i class="fas fa-star rate" data-song="music1" data-star="2"></i>
                                        <i class="fas fa-star rate" data-song="music1" data-star="3"></i>
                                        <i class="fas fa-star rate" data-song="music1" data-star="4"></i>
                                        <i class="fas fa-star rate" data-song="music1" data-star="5"></i>
                                    </span>
                                    <span class="share-btn"><i class="fas fa-share"></i> Share</span>
                                    <span class="comment-btn"><i class="fas fa-comment"></i> <span id="comment-count-music1"><?php echo getInteractionCount($conn, 'music1', 'comment'); ?></span></span>
                                    <span class="reaction-btn"><i class="fas fa-smile"></i> <span id="reaction-count-music1"><?php echo getInteractionCount($conn, 'music1', 'reaction'); ?></span></span>
                                </div>
                                <div class="comment-preview" id="comment-preview-music1">
                                    <?php
                                    $comments = getComments($conn, 'music1');
                                    echo !empty($comments) ? "Top Comment: \"{$comments[0]['comment']}\" - {$comments[0]['username']} (Likes: {$comments[0]['likes']})" : "No comments yet";
                                    ?>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Library Section -->
        <section id="library" class="content-section hidden">
            <h2 class="text-2xl font-semibold">Your Library</h2>
            <p class="text-sm mt-2">Your saved songs, playlists, and more.</p>
            <div class="mt-6">
                <h3 class="text-xl font-semibold">Recently Played</h3>
                <div class="grid grid-cols-3 gap-4 mt-2" id="recently-played">
                    <!-- Content dynamically added via JS -->
                </div>
            </div>
        </section>

        <!-- Favorites Section -->
        <section id="favorites" class="content-section hidden">
            <h2 class="text-2xl font-semibold">Favorites</h2>
            <p class="text-sm mt-2">Your favorite songs and artists.</p>
            <div class="mt-6">
                <h3 class="text-xl font-semibold">Favorite Songs</h3>
                <div class="grid grid-cols-3 gap-4 mt-2" id="favorite-songs">
                    <!-- Content dynamically added via JS -->
                </div>
            </div>
        </section>

        <!-- Thundra AI Bar Section -->
        <section id="thundra-ai-bar" class="content-section hidden">
            <h2 class="text-2xl font-semibold">Thundra AI Bar</h2>
            <p class="text-sm mt-2">Create music with AI assistance.</p>
            <div class="mt-6">
                <button id="ai-music-maker" class="flex items-center">
                    <i class="fas fa-robot"></i> Generate AI Music
                </button>
            </div>
        </section>

        <!-- Thundra Ads Section -->
        <section id="ads" class="content-section hidden">
            <h2 class="text-2xl font-semibold">Thundra Ads</h2>
            <p class="text-sm mt-2">Promote your music or brand.</p>
            <div class="mt-6">
                <p>Coming soon! Stay tuned for advertising opportunities.</p>
            </div>
        </section>

        <!-- Thundra Market Section -->
        <section id="market" class="content-section hidden">
            <h2 class="text-2xl font-semibold">Thundra Market</h2>
            <p class="text-sm mt-2">Buy and sell music-related items.</p>
            <div class="mt-6">
                <p>Coming soon! Explore the marketplace.</p>
            </div>
        </section>

        <!-- Wallet & Rewards Section -->
        <section id="wallet" class="content-section hidden">
            <h2 class="text-2xl font-semibold">Wallet & Rewards</h2>
            <p class="text-sm mt-2">Manage your earnings and rewards.</p>
            <div class="mt-6">
                <p>Coming soon! Check your wallet and rewards.</p>
            </div>
        </section>

        <!-- Chat & Groups Section -->
        <section id="chat" class="content-section hidden">
            <h2 class="text-2xl font-semibold">Chat & Groups</h2>
            <p class="text-sm mt-2">Connect with other music lovers.</p>
            <div class="mt-6">
                <p>Coming soon! Join the conversation.</p>
            </div>
        </section>

        <!-- Thundra Learning Section -->
        <section id="learning" class="content-section hidden">
            <h2 class="text-2xl font-semibold">Thundra Learning</h2>
            <p class="text-sm mt-2">Learn music production and more.</p>
            <div class="mt-6">
                <p>Coming soon! Start learning today.</p>
            </div>
        </section>

        <!-- Support Section -->
        <section id="support" class="content-section hidden">
            <h2 class="text-2xl font-semibold">Support</h2>
            <p class="text-sm mt-2">Need help? We're here for you.</p>
            <div class="mt-6">
                <p>Contact us at <a href="mailto:support@thundramusic.com" class="text-red-600 hover:underline">support@thundramusic.com</a>.</p>
            </div>
        </section>

        <!-- Privacy Policy Section -->
        <section id="privacy" class="content-section hidden">
            <h2 class="text-2xl font-semibold">Privacy Policy</h2>
            <p class="text-sm mt-2">Your privacy matters to us.</p>
            <div class="mt-6">
                <p>Read our full privacy policy <a href="https://thundramusic.infinityfreeapp.com/privacy.html" class="text-red-600 hover:underline">here</a>.</p>
            </div>
        </section>

        <!-- Community Code of Conduct Section -->
        <section id="conduct" class="content-section hidden">
            <h2 class="text-2xl font-semibold">Community Code of Conduct</h2>
            <p class="text-sm mt-2">Our guidelines for a safe community.</p>
            <div class="mt-6">
                <p>Read our community guidelines <a href="https://thundramusic.infinityfreeapp.com/conduct.html" class="text-red-600 hover:underline">here</a>.</p>
            </div>
        </section>

        <!-- Profile Section -->
        <section id="profile" class="content-section hidden">
            <h2 class="text-2xl font-semibold">Profile</h2>
            <p class="text-sm mt-2">Manage your account details.</p>
            <div class="mt-6">
                <p>Username: <?php echo htmlspecialchars($username); ?></p>
                <p>Email: [Your email]</p>
                <button class="bg-red-600 text-white py-2 px-4 rounded mt-4 hover:bg-red-700">Edit Profile</button>
            </div>
        </section>
    </main>
</div>

<!-- Music Player -->
<div id="music-player" class="flex items-center justify-between p-4">
    <div class="flex items-center">
        <img id="player-artwork" src="" alt="Artwork" class="w-12 h-12 object-cover mr-4 rounded">
        <div>
            <p id="player-title" class="font-semibold"></p>
            <p id="player-artist" class="text-sm text-gray-600 dark:text-gray-400"></p>
        </div>
    </div>
    <div class="flex flex-col items-center w-1/2 player-controls">
        <div class="flex items-center space-x-4">
            <button id="prev-btn"><i class="fas fa-step-backward text-red-600 text-xl"></i></button>
            <button id="play-pause-btn"><i class="fas fa-play text-red-600 text-xl"></i></button>
            <button id="next-btn"><i class="fas fa-step-forward text-red-600 text-xl"></i></button>
            <button id="queue-btn" class="ml-4"><i class="fas fa-list text-red-600 text-xl"></i></button>
        </div>
        <div class="flex items-center w-full mt-2">
            <span id="current-time" class="text-sm mr-2">0:00</span>
            <div id="progress-bar" class="flex-1"><div id="progress"></div></div>
            <span id="duration" class="text-sm ml-2">0:00</span>
        </div>
    </div>
    <div class="flex items-center">
        <i id="volume-icon" class="fas fa-volume-up text-red-600 mr-2"></i>
        <div id="volume-bar"><div id="volume"></div></div>
    </div>
    <button id="lyrics-btn"><i class="fas fa-align-left text-white text-sm"></i></button>
    <button id="fullscreen-btn"><i class="fas fa-expand text-white text-sm"></i></button>
    <button id="hide-player"><i class="fas fa-chevron-down text-white text-sm"></i></button>
    <button id="close-player"><i class="fas fa-times text-white text-sm"></i></button>
    <div id="lyrics-overlay"></div>
</div>

<!-- Player Toggle Button -->
<button id="player-toggle"><i class="fas fa-music text-white text-xl"></i></button>

<!-- Popups -->
<div id="song-popup" class="popup">
    <div class="popup-content">
        <button class="popup-close"><i class="fas fa-times text-white text-sm"></i></button>
        <h3 id="popup-title"></h3>
        <img id="popup-artwork" src="" alt="Artwork">
        <p id="popup-story"></p>
        <p id="popup-info"></p>
        <p id="popup-performance"></p>
        <a id="popup-download" href="#" class="download-btn">Download</a>
    </div>
</div>

<div id="lyrics-popup" class="popup">
    <div class="popup-content">
        <button class="popup-close"><i class="fas fa-times text-white text-sm"></i></button>
        <h3 id="lyrics-title"></h3>
        <div id="lyrics-content"></div>
    </div>
</div>

<div id="share-popup" class="popup">
    <div class="popup-content">
        <button class="popup-close"><i class="fas fa-times text-white text-sm"></i></button>
        <h3>Share this Song</h3>
        <div class="share-option" data-share="facebook">
            <i class="fab fa-facebook"></i> Share on Facebook
        </div>
        <div class="share-option" data-share="twitter">
            <i class="fab fa-twitter"></i> Share on Twitter
        </div>
        <div class="share-option" data-share="whatsapp">
            <i class="fab fa-whatsapp"></i> Share on WhatsApp
        </div>
        <div class="share-option" data-share="copy">
            <i class="fas fa-link"></i> Copy Link
        </div>
    </div>
</div>

<div id="queue-popup" class="popup">
    <div class="popup-content">
        <button class="popup-close"><i class="fas fa-times text-white text-sm"></i></button>
        <h3>Queue</h3>
        <div id="queue-list"></div>
    </div>
</div>

<div id="comment-popup" class="popup">
    <div class="popup-content">
        <button class="popup-close"><i class="fas fa-times text-white text-sm"></i></button>
        <h3 id="comment-title">Comments</h3>
        <div class="flex items-center mb-4">
            <input type="text" id="comment-input" placeholder="Add a comment..." class="flex-1 p-2 border border-gray-300 dark:border-gray-700 rounded">
            <button id="comment-submit" class="bg-red-600 text-white p-2 rounded ml-2">Post</button>
        </div>
        <div id="comment-list"></div>
    </div>
</div>

<div id="reaction-popup" class="popup">
    <div class="popup-content">
        <button class="popup-close"><i class="fas fa-times text-white text-sm"></i></button>
        <h3>React to this Song</h3>
        <div class="flex space-x-4">
            <span class="reaction-option" data-reaction="like"><i class="fas fa-thumbs-up text-2xl"></i></span>
            <span class="reaction-option" data-reaction="love"><i class="fas fa-heart text-2xl"></i></span>
            <span class="reaction-option" data-reaction="wow"><i class="fas fa-surprise text-2xl"></i></span>
        </div>
    </div>
</div>

<!-- Footer -->
<footer id="footer" class="text-center py-4 text-gray-600 dark:text-gray-400 fixed bottom-0 w-full transition-all duration-300">
    <p>&copy; 2025 Thundra Music. All rights reserved.</p>
</footer>

</body>
<script>
// Utility Functions
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function updateComments(songId) {
    fetch(`?song_id=${songId}`, { method: 'GET' })
        .then(response => response.json())
        .then(comments => {
            const commentList = document.getElementById('comment-list');
            commentList.innerHTML = '';
            comments.forEach((comment, index) => {
                const commentItem = document.createElement('div');
                commentItem.className = 'comment-item';
                commentItem.innerHTML = `
                    <p>${comment.username}: ${comment.comment}</p>
                    <span class="like-btn" data-comment-id="${index}">
                        <i class="fas fa-heart ${comment.liked ? 'liked' : ''}"></i> ${comment.likes}
                    </span>`;
                commentList.appendChild(commentItem);
            });

            const commentPreview = document.getElementById(`comment-preview-${songId}`);
            if (comments.length > 0) {
                commentPreview.textContent = `Top Comment: "${comments[0].comment}" - ${comments[0].username} (Likes: ${comments[0].likes})`;
            } else {
                commentPreview.textContent = 'No comments yet';
            }
        });
}

// Background Canvas Animation
const canvas = document.getElementById('background-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particlesArray = [];
const numberOfParticles = 50;

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 5 + 1;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.size > 0.2) this.size -= 0.1;

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }

    draw() {
        ctx.fillStyle = document.body.classList.contains('dark') ? 'rgba(229, 62, 62, 0.3)' : 'rgba(229, 62, 62, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();

        if (particlesArray[i].size <= 0.2) {
            particlesArray.splice(i, 1);
            i--;
            particlesArray.push(new Particle());
        }
    }
    requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Sidebar Toggle
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('main-content');
const footer = document.getElementById('footer');
const toggleSidebar = document.getElementById('toggle-sidebar');
const toggleIcon = document.getElementById('toggle-icon');
const premiumBtn = document.querySelector('.premium-btn');

toggleSidebar.addEventListener('click', () => {
    sidebar.classList.toggle('expanded');
    mainContent.classList.toggle('expanded');
    footer.classList.toggle('expanded');
    toggleIcon.classList.toggle('fa-times');
    toggleIcon.classList.toggle('fa-bars');
    premiumBtn.style.display = sidebar.classList.contains('expanded') ? 'flex' : 'none';
});

// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    if (document.body.classList.contains('dark')) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        localStorage.setItem('theme', 'dark');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        localStorage.setItem('theme', 'light');
    }
});

// Load Theme Preference
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
}

// Music Player
const audio = new Audio();
const musicPlayer = document.getElementById('music-player');
const playerArtwork = document.getElementById('player-artwork');
const playerTitle = document.getElementById('player-title');
const playerArtist = document.getElementById('player-artist');
const playPauseBtn = document.getElementById('play-pause-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const queueBtn = document.getElementById('queue-btn');
const progressBar = document.getElementById('progress-bar');
const progress = document.getElementById('progress');
const currentTime = document.getElementById('current-time');
const duration = document.getElementById('duration');
const volumeBar = document.getElementById('volume-bar');
const volume = document.getElementById('volume');
const volumeIcon = document.getElementById('volume-icon');
const closePlayer = document.getElementById('close-player');
const hidePlayer = document.getElementById('hide-player');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const lyricsBtn = document.getElementById('lyrics-btn');
const lyricsOverlay = document.getElementById('lyrics-overlay');
const playerToggle = document.getElementById('player-toggle');
const premiumPopup = document.getElementById('premium-popup');
const upgradeBtn = document.getElementById('upgrade-btn');
const singlePlayBtn = document.getElementById('single-play-btn');

let currentSong = null;
let queue = [];
let currentIndex = 0;
let isPlaying = false;
let songToPlay = null;

function loadSong(songCard, bypassLimit = false) {
    const playCount = parseInt(document.getElementById('play-count').textContent);
    if (!bypassLimit && playCount <= 0) {
        songToPlay = songCard;
        premiumPopup.style.display = 'flex';
        return;
    }

    const songId = songCard.dataset.song;
    const title = songCard.dataset.title;
    const artist = songCard.dataset.artist;
    const url = songCard.dataset.url;
    const artwork = songCard.querySelector('img').src;
    const lyrics = JSON.parse(songCard.dataset.lyrics || '[]');

    currentSong = { songId, title, artist, url, artwork, lyrics };
    playerArtwork.src = artwork;
    playerTitle.textContent = title;
    playerArtist.textContent = artist;
    audio.src = url;

    musicPlayer.style.display = 'flex';
    playerToggle.style.display = 'flex';

    audio.play();
    isPlaying = true;
    playPauseBtn.innerHTML = '<i class="fas fa-pause text-red-600 text-xl"></i>';

    if (!bypassLimit) {
        document.getElementById('play-count').textContent = playCount - 1;
    }

    // Update Recently Played
    const recentlyPlayed = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');
    recentlyPlayed.unshift({ songId, title, artist, url, artwork });
    localStorage.setItem('recentlyPlayed', JSON.stringify(recentlyPlayed.slice(0, 3)));

    updateRecentlyPlayed();
}

audio.addEventListener('timeupdate', () => {
    const current = audio.currentTime;
    const dur = audio.duration || 0;
    progress.style.width = `${(current / dur) * 100}%`;
    currentTime.textContent = formatTime(current);
    duration.textContent = formatTime(dur);

    if (currentSong.lyrics && currentSong.lyrics.length > 0) {
        const currentLyric = currentSong.lyrics.find(lyric => current >= lyric.time && current < (currentSong.lyrics[currentSong.lyrics.indexOf(lyric) + 1]?.time || Infinity));
        if (currentLyric) {
            lyricsOverlay.innerHTML = `<p class="lyrics-line current">${currentLyric.text}</p>`;
        }
    }
});

audio.addEventListener('ended', () => {
    nextSong();
});

progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pos * audio.duration;
});

volumeBar.addEventListener('click', (e) => {
    const rect = volumeBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    audio.volume = pos;
    volume.style.width = `${pos * 100}%`;
    volumeIcon.className = pos === 0 ? 'fas fa-volume-mute text-red-600 mr-2' : 'fas fa-volume-up text-red-600 mr-2';
});

playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
        audio.pause();
        playPauseBtn.innerHTML = '<i class="fas fa-play text-red-600 text-xl"></i>';
    } else {
        audio.play();
        playPauseBtn.innerHTML = '<i class="fas fa-pause text-red-600 text-xl"></i>';
    }
    isPlaying = !isPlaying;
});

prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        loadSong(queue[currentIndex]);
    }
});

nextBtn.addEventListener('click', nextSong);

function nextSong() {
    if (currentIndex < queue.length - 1) {
        currentIndex++;
        loadSong(queue[currentIndex]);
    } else {
        audio.pause();
        isPlaying = false;
        playPauseBtn.innerHTML = '<i class="fas fa-play text-red-600 text-xl"></i>';
    }
}

closePlayer.addEventListener('click', () => {
    audio.pause();
    musicPlayer.style.display = 'none';
    playerToggle.style.display = 'none';
    isPlaying = false;
});

hidePlayer.addEventListener('click', () => {
    musicPlayer.style.display = 'none';
    playerToggle.style.display = 'flex';
});

playerToggle.addEventListener('click', () => {
    musicPlayer.style.display = 'flex';
    playerToggle.style.display = 'none';
});

fullscreenBtn.addEventListener('click', () => {
    musicPlayer.classList.toggle('fullscreen');
    fullscreenBtn.innerHTML = musicPlayer.classList.contains('fullscreen') ? '<i class="fas fa-compress text-white text-sm"></i>' : '<i class="fas fa-expand text-white text-sm"></i>';
});

lyricsBtn.addEventListener('click', () => {
    lyricsOverlay.classList.toggle('active');
    playerArtwork.classList.toggle('lyrics-active');
});

// Premium Popup Handling
upgradeBtn.addEventListener('click', () => {
    window.location.href = 'https://thundramusic.infinityfreeapp.com/upgrade.php';
});

singlePlayBtn.addEventListener('click', () => {
    premiumPopup.style.display = 'none';
    loadSong(songToPlay, true);
    songToPlay = null;
});

// Song Interactions
document.querySelectorAll('.play-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const songCard = btn.closest('.song-card');
        queue = Array.from(document.querySelectorAll('.song-card'));
        currentIndex = queue.indexOf(songCard);
        loadSong(songCard);
    });
});

document.querySelectorAll('.song-options').forEach(option => {
    option.addEventListener('click', (e) => {
        e.stopPropagation();
        const menu = option.querySelector('.song-options-menu');
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    });
});

document.querySelectorAll('.song-biography').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const songCard = link.closest('.song-card');
        const popup = document.getElementById('song-popup');
        document.getElementById('popup-title').textContent = songCard.dataset.title;
        document.getElementById('popup-artwork').src = songCard.querySelector('img').src;
        document.getElementById('popup-story').textContent = songCard.dataset.story;
        document.getElementById('popup-info').textContent = songCard.dataset.info;
        document.getElementById('popup-performance').textContent = songCard.dataset.performance;
        document.getElementById('popup-download').href = songCard.dataset.url;
        popup.style.display = 'flex';
    });
});

document.querySelectorAll('.song-lyrics').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const songCard = link.closest('.song-card');
        const popup = document.getElementById('lyrics-popup');
        document.getElementById('lyrics-title').textContent = songCard.dataset.title;
        const lyricsContent = document.getElementById('lyrics-content');
        const lyrics = JSON.parse(songCard.dataset.lyrics || '[]');
        lyricsContent.innerHTML = lyrics.length > 0 ? lyrics.map(l => `<p class="lyrics-line">${l.text}</p>`).join('') : '<p>No lyrics available</p>';
        popup.style.display = 'flex';
    });
});

document.querySelectorAll('.song-queue').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const songCard = link.closest('.song-card');
        queue.push(songCard);
        updateQueue();
    });
});

document.querySelectorAll('.song-download').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const songCard = link.closest('.song-card');
        window.location.href = songCard.dataset.url;
    });
});

document.querySelectorAll('.popup-close').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.closest('.popup').style.display = 'none';
    });
});

document.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const songCard = btn.closest('.song-card');
        const popup = document.getElementById('share-popup');
        popup.style.display = 'flex';

        const shareOptions = popup.querySelectorAll('.share-option');
        shareOptions.forEach(option => {
            option.addEventListener('click', () => {
                const type = option.dataset.share;
                const url = songCard.dataset.url;
                const title = songCard.dataset.title;
                if (type === 'facebook') {
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
                } else if (type === 'twitter') {
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`);
                } else if (type === 'whatsapp') {
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`);
                } else if (type === 'copy') {
                    navigator.clipboard.writeText(url).then(() => alert('Link copied to clipboard!'));
                }
                popup.style.display = 'none';
            });
        });
    });
});

queueBtn.addEventListener('click', () => {
    const popup = document.getElementById('queue-popup');
    popup.style.display = 'flex';
});

function updateQueue() {
    const queueList = document.getElementById('queue-list');
    queueList.innerHTML = '';
    queue.forEach((song, index) => {
        const item = document.createElement('div');
        item.className = 'queue-item';
        item.innerHTML = `
            <img src="${song.querySelector('img').src}" alt="Artwork">
            <p>${song.dataset.title} - ${song.dataset.artist}</p>
            <button onclick="queue.splice(${index}, 1); updateQueue();">Remove</button>`;
        queueList.appendChild(item);
    });
}

document.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const songCard = btn.closest('.song-card');
        const songId = songCard.dataset.song;
        const countSpan = btn.querySelector('span');
        fetch('', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `song_id=${songId}&interaction=like&value=1`
        })
        .then(response => response.json())
        .then(data => {
            countSpan.textContent = data.count;
            btn.classList.toggle('liked');
        });
    });
});

document.querySelectorAll('.comment-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const songCard = btn.closest('.song-card');
        const songId = songCard.dataset.song;
        const popup = document.getElementById('comment-popup');
        document.getElementById('comment-title').textContent = `Comments on ${songCard.dataset.title}`;
        popup.style.display = 'flex';

        updateComments(songId);

        const commentSubmit = document.getElementById('comment-submit');
        const commentInput = document.getElementById('comment-input');
        commentSubmit.onclick = () => {
            const comment = commentInput.value.trim();
            if (comment) {
                fetch('', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `song_id=${songId}&interaction=comment&value=${encodeURIComponent(comment)}`
                })
                .then(response => response.json())
                .then(data => {
                    document.getElementById(`comment-count-${songId}`).textContent = data.count;
                    updateComments(songId);
                    commentInput.value = '';
                });
            }
        };
    });
});

document.querySelectorAll('.reaction-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const songCard = btn.closest('.song-card');
        const songId = songCard.dataset.song;
        const popup = document.getElementById('reaction-popup');
        popup.style.display = 'flex';

        const reactionOptions = popup.querySelectorAll('.reaction-option');
        reactionOptions.forEach(option => {
            option.addEventListener('click', () => {
                const reaction = option.dataset.reaction;
                fetch('', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `song_id=${songId}&interaction=reaction&value=${reaction}`
                })
                .then(response => response.json())
                .then(data => {
                    document.getElementById(`reaction-count-${songId}`).textContent = data.count;
                    popup.style.display = 'none';
                });
            });
        });
    });
});

document.querySelectorAll('.rating-stars i').forEach(star => {
    star.addEventListener('click', () => {
        const songId = star.dataset.song;
        const rating = star.dataset.star;
        fetch('', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `song_id=${songId}&interaction=rating&value=${rating}`
        })
        .then(() => {
            const stars = star.parentElement.querySelectorAll('i');
            stars.forEach(s => s.classList.remove('rated'));
            for (let i = 0; i < rating; i++) {
                stars[i].classList.add('rated');
            }
        });
    });
});

// Recently Played
function updateRecentlyPlayed() {
    const recentlyPlayed = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');
    const container = document.getElementById('recently-played');
    container.innerHTML = '';
    recentlyPlayed.forEach(song => {
        const card = document.createElement('div');
        card.className = 'song-card relative';
        card.dataset.song = song.songId;
        card.dataset.title = song.title;
        card.dataset.artist = song.artist;
        card.dataset.url = song.url;
        card.innerHTML = `
            <div class="song-options">
                <i class="fas fa-ellipsis-v text-red-600"></i>
                <div class="song-options-menu">
                    <a href="#" class="song-biography">Biography</a>
                    <a href="#" class="song-queue">Add to Queue</a>
                    <a href="#" class="song-lyrics">Lyrics</a>
                    <a href="#" class="song-download">Download</a>
                </div>
            </div>
            <button class="play-btn" style="cursor: pointer;"><i class="fas fa-play text-white text-2xl"></i></button>
            <img src="${song.artwork}" alt="${song.title}" class="w-full h-32 object-cover">
            <div class="song-card-content">
                <p class="song-title">${song.title} - ${song.artist}</p>
                <p class="song-meta">Recently Played</p>
            </div>`;
        container.appendChild(card);
    });
}

updateRecentlyPlayed();

// Navigation
document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.getAttribute('href').substring(1);
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.add('hidden');
        });
        document.getElementById(sectionId).classList.remove('hidden');
        document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});

// Search Functionality
document.getElementById('search-bar').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const songCards = document.querySelectorAll('.song-card');
    songCards.forEach(card => {
        const title = card.dataset.title.toLowerCase();
        const artist = card.dataset.artist.toLowerCase();
        if (title.includes(query) || artist.includes(query)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
});

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    fetch('logout.php', { method: 'POST' })
        .then(() => {
            // Clear cookies
            document.cookie.split(";").forEach(cookie => {
                const eqPos = cookie.indexOf("=");
                const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
            });
            // Clear localStorage and sessionStorage
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = 'https://thundramusic.infinityfreeapp.com/login.php';
        });
});

// AI Music Maker Button
document.getElementById('ai-music-maker').addEventListener('click', () => {
    alert('AI Music Maker feature coming soon! Stay tuned.');
});
</script>
</body>
</html>