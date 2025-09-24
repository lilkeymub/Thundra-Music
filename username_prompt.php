<?php
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');
error_reporting(E_ALL);

// Force HTTPS
if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === 'off') {
    header('Location: https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
    exit();
}

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Database connection
$host = 'sql209.infinityfree.com';
$dbname = 'if0_38852888_thundramusic';
$username = 'if0_38852888';
$password = 'Malinga7';
$port = 3306;

$conn = new mysqli($host, $username, $password, $dbname, $port);
if ($conn->connect_error) {
    error_log("Database connection failed: " . $conn->connect_error);
    header('Location: https://thundramusic.infinityfreeapp.com/login.php?error=Server error');
    exit();
}

// Check if temporary user data is set
if (!isset($_SESSION['temp_user'])) {
    header('Location: https://thundramusic.infinityfreeapp.com/login.php?error=Invalid session');
    exit();
}

$temp_user = $_SESSION['temp_user'];
$errors = [];

// Handle username submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $username_lower = strtolower($username);

    if (empty($username)) {
        $errors[] = 'Username is required.';
    } elseif (strlen($username) < 3) {
        $errors[] = 'Username must be at least 3 characters long.';
    } else {
        // Check if username exists (case-insensitive)
        $stmt = $conn->prepare('SELECT COUNT(*) FROM users WHERE LOWER(Username) = ?');
        $stmt->bind_param('s', $username_lower);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();

        if ($count > 0) {
            $errors[] = 'Username already taken. Please choose another.';
        }
    }

    if (empty($errors)) {
        // Update or insert user with username
        if (isset($temp_user['wallet_address'])) {
            $stmt = $conn->prepare('UPDATE users SET Username = ?, ion_status = ? WHERE wallet_address = ?');
            $stmt->bind_param('sss', $username_lower, $temp_user['ion_status'], $temp_user['wallet_address']);
        } elseif (isset($temp_user['google_id']) || isset($temp_user['x_id'])) {
            $stmt = $conn->prepare('UPDATE users SET Username = ?, fullname = ? WHERE Email = ?');
            $stmt->bind_param('sss', $username_lower, $temp_user['fullname'], $temp_user['email']);
        }

        if ($stmt->execute()) {
            $_SESSION['username'] = $username_lower;
            $_SESSION['authToken'] = bin2hex(random_bytes(16));
            $_SESSION['ion_status'] = $temp_user['ion_status'] ?? 'Non-ION';
            unset($_SESSION['temp_user']);

            // Redirect based on Tier and Subscription
            $tier = $temp_user['Tier'] ?? 'Free';
            $subscription = $temp_user['Subscription'] ?? 'Free';
            $stmt->close();
            $conn->close();

            switch ($tier) {
                case 'Admin':
                    header('Location: https://thundramusic.infinityfreeapp.com/admin_dashboard.php');
                    break;
                case 'Moderator':
                    header('Location: https://thundramusic.infinityfreeapp.com/moderator_dashboard.php');
                    break;
                case 'Artist':
                    header('Location: https://thundramusic.infinityfreeapp.com/artist_dashboard.php');
                    break;
                case 'Staff':
                    header('Location: https://thundramusic.infinityfreeapp.com/staff_dashboard.php');
                    break;
                default:
                    if ($subscription === 'VIP') {
                        header('Location: https://thundramusic.infinityfreeapp.com/vip_dashboard.php');
                    } elseif ($subscription === 'Subscription') {
                        header('Location: https://thundramusic.infinityfreeapp.com/premium_dashboard.php');
                    } else {
                        header('Location: https://thundramusic.infinityfreeapp.com/dashboard.php');
                    }
                    break;
            }
            exit();
        } else {
            $errors[] = 'Failed to save username. Please try again.';
        }
        $stmt->close();
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Choose Username - Thundra Music</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <style>
        .modal {
            display: block;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgba(0,0,0,0.5);
        }
        .modal-content {
            background-color: #fefefe;
            margin: 15% auto;
            padding: 20px;
            border: 1px solid #888;
            width: 80%;
            max-width: 400px;
            border-radius: 8px;
        }
        .error {
            color: #e02424;
            font-size: 0.875rem;
            margin-top: 0.25rem;
        }
    </style>
</head>
<body>
    <div class="modal">
        <div class="modal-content">
            <h2 class="text-xl font-bold text-red-600 mb-4">Choose Your Username</h2>
            <?php if (!empty($errors)): ?>
                <div class="mb-4">
                    <?php foreach ($errors as $error): ?>
                        <p class="error"><?php echo htmlspecialchars($error); ?></p>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
            <form method="POST" action="https://thundramusic.infinityfreeapp.com/username_prompt.php">
                <div class="mb-4">
                    <label class="block text-sm font-medium">Username</label>
                    <input type="text" name="username" class="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-red-600 focus:border-red-600" placeholder="Enter your username" required>
                </div>
                <button type="submit" class="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Submit</button>
            </form>
        </div>
    </div>
</body>
</html>
<?php $conn->close(); ?>