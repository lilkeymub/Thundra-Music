<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Force HTTPS
if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === 'off') {
    error_log("Forcing HTTPS redirect in reset_password.php");
    header('Location: https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
    exit();
}

// Start session safely
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Database connection using mysqli
$host = 'sql209.infinityfree.com';
$dbname = 'if0_38852888_thundramusic';
$username = 'if0_38852888';
$password = 'Malinga7';
$port = 3306;

$conn = new mysqli($host, $username, $password, $dbname, $port);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$errors = [];
$success = '';

if ($_SERVER["REQUEST_METHOD"] == "GET" && isset($_GET['token'])) {
    error_log("Processing reset password request with token: " . $_GET['token']);
    $token = $_GET['token'];

    // Verify token
    $stmt = $conn->prepare("SELECT Username, Password, reset_expires FROM users WHERE reset_token = ?");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $stmt->close();

    if ($user && (new DateTime($user['reset_expires']) > new DateTime())) {
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $newPassword = trim($_POST['new_password'] ?? '');
            $confirmPassword = trim($_POST['confirm_password'] ?? '');

            if (empty($newPassword)) {
                $errors[] = "New password is required.";
            } elseif (strlen($newPassword) < 6) {
                $errors[] = "Password must be at least 6 characters long.";
            }
            if ($newPassword !== $confirmPassword) {
                $errors[] = "Passwords do not match.";
            }

            if (empty($errors)) {
                // Overwrite the old password with the new hashed password for the specific user
                $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);
                error_log("Updating password for username: " . $user['Username'] . " with new hashed password");
                $stmt = $conn->prepare("UPDATE users SET Password = ?, reset_token = NULL, reset_expires = NULL WHERE reset_token = ?");
                $stmt->bind_param("ss", $hashedPassword, $token);
                if ($stmt->execute()) {
                    error_log("Password successfully updated for username: " . $user['Username']);
                    $success = "Password updated successfully. You can now <a href='https://thundramusic.infinityfreeapp.com/login.php' class='text-red-600 hover:underline'>login</a>.";
                } else {
                    $errors[] = "Error updating password. Please try again.";
                    error_log("Database update failed for username " . $user['Username'] . ": " . $conn->error);
                }
                $stmt->close();
            }
        }
    } else {
        $errors[] = "Invalid or expired reset token.";
        error_log("Invalid or expired token: " . $token);
    }
} else {
    header("Location: https://thundramusic.infinityfreeapp.com/login.php");
    exit();
}

$conn->close();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thundra Music - Reset Password</title>
    <link rel="icon" type="image/x-icon" href="THUNDRA MUSIC.png">
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <style>
        .error { color: #e02424; font-size: 0.875rem; margin-top: 0.25rem; }
        .success { color: #34c759; font-size: 0.875rem; margin-top: 0.25rem; }
        .password-toggle { position: relative; }
        .password-toggle input { padding-right: 2.5rem; }
        .password-toggle .toggle-icon { position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); cursor: pointer; color: #4a4a4a; }
    </style>
</head>
<body class="bg-white dark:bg-black text-black dark:text-white min-h-screen page-transition">
    <div class="pt-4 px-4">
        <h1 class="text-3xl font-bold text-red-600 text-center">Reset Password</h1>
        <div class="max-w-md mx-auto mt-4 bg-gray-200 dark:bg-gray-800 p-6 rounded">
            <?php if (!empty($errors)): ?>
                <div class="mb-4">
                    <?php foreach ($errors as $error): ?>
                        <p class="error"><?php echo htmlspecialchars($error); ?></p>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
            <?php if ($success): ?>
                <div class="mb-4">
                    <p class="success"><?php echo $success; ?></p>
                </div>
            <?php else: ?>
                <form method="POST" action="https://thundramusic.infinityfreeapp.com/reset_password.php?token=<?php echo htmlspecialchars($_GET['token']); ?>">
                    <div class="mb-4 password-toggle">
                        <label class="block text-sm font-medium">New Password</label>
                        <input type="password" name="new_password" id="new_password" class="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-red-600 focus:border-red-600" placeholder="Enter new password">
                        <span class="toggle-icon" onclick="togglePassword('new_password')"><i id="new-password-icon" class="fas fa-eye"></i></span>
                    </div>
                    <div class="mb-4 password-toggle">
                        <label class="block text-sm font-medium">Confirm Password</label>
                        <input type="password" name="confirm_password" id="confirm_password" class="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-red-600 focus:border-red-600" placeholder="Confirm new password">
                        <span class="toggle-icon" onclick="togglePassword('confirm_password')"><i id="confirm-password-icon" class="fas fa-eye"></i></span>
                    </div>
                    <button type="submit" class="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 electric-hover">Reset Password</button>
                </form>
            <?php endif; ?>
            <br>
        </div>
        <footer class="text-center text-sm py-4">
            <div>
                <a href="https://thundramusic.infinityfreeapp.com/privacy.html" class="text-red-600 hover:underline mx-2">Privacy Policy</a>
                <a href="https://thundramusic.infinityfreeapp.com/conduct.html" class="text-red-600 hover:underline mx-2">Community Code of Conduct</a>
                <a href="https://thundramusic.infinityfreeapp.com/conditions.html" class="text-red-600 hover:underline mx-2">General User Terms & Conditions</a>
                <a href="https://thundramusic.infinityfreeapp.com/legal.html" class="text-red-600 hover:underline mx-2">Legal & Guidelines</a>
            </div>
            <div class="mt-4">
                <button id="theme-toggle" class="text-red-600 hover:text-red-700 focus:outline-none">
                    <i id="theme-icon" class="fas fa-moon text-2xl"></i>
                </button>
            </div>
        </footer>
    </div>

    <script>
        function togglePassword(fieldId) {
            const passwordInput = document.getElementById(fieldId);
            const passwordIcon = document.getElementById(`${fieldId}-icon`);
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                passwordIcon.classList.remove('fa-eye');
                passwordIcon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                passwordIcon.classList.remove('fa-eye-slash');
                passwordIcon.classList.add('fa-eye');
            }
        }
    </script>
</body>
</html>