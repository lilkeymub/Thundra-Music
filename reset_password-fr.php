<?php
// Activer le rapport d'erreurs pour le débogage
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Forcer HTTPS
if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === 'off') {
    error_log("Forçage de la redirection HTTPS dans reset_password-fr.php");
    header('Location: https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
    exit();
}

// Démarrer la session en toute sécurité
if (session_status() === PHP_SESSION_NONE) {
    error_log("Démarrage de la session dans reset_password-fr.php");
    session_start();
}

// Connexion à la base de données avec mysqli
$host = 'sql209.infinityfree.com';
$dbname = 'if0_38852888_thundramusic';
$username = 'if0_38852888';
$password = 'Malinga7';
$port = 3306;

$conn = new mysqli($host, $username, $password, $dbname, $port);

if ($conn->connect_error) {
    die("Échec de la connexion à la base de données : " . $conn->connect_error);
}

$errors = [];
$success = '';

if ($_SERVER["REQUEST_METHOD"] == "GET" && isset($_GET['token'])) {
    error_log("Traitement de la demande de réinitialisation du mot de passe avec le jeton : " . $_GET['token']);
    $token = $_GET['token'];

    // Vérifier le jeton
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
                $errors[] = "Le nouveau mot de passe est requis.";
            } elseif (strlen($newPassword) < 6) {
                $errors[] = "Le mot de passe doit comporter au moins 6 caractères.";
            }
            if ($newPassword !== $confirmPassword) {
                $errors[] = "Les mots de passe ne correspondent pas.";
            }

            if (empty($errors)) {
                // Remplacer l'ancien mot de passe par le nouveau mot de passe haché pour l'utilisateur spécifique
                $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);
                error_log("Mise à jour du mot de passe pour le nom d'utilisateur : " . $user['Username'] . " avec le nouveau mot de passe haché");
                $stmt = $conn->prepare("UPDATE users SET Password = ?, reset_token = NULL, reset_expires = NULL WHERE reset_token = ?");
                $stmt->bind_param("ss", $hashedPassword, $token);
                if ($stmt->execute()) {
                    error_log("Mot de passe mis à jour avec succès pour le nom d'utilisateur : " . $user['Username']);
                    $success = "Mot de passe mis à jour avec succès. Vous pouvez maintenant <a href='https://thundramusic.infinityfreeapp.com/login-fr.php' class='text-red-600 hover:underline'>vous connecter</a>.";
                } else {
                    $errors[] = "Erreur lors de la mise à jour du mot de passe. Veuillez réessayer.";
                    error_log("Échec de la mise à jour de la base de données pour le nom d'utilisateur " . $user['Username'] . " : " . $conn->error);
                }
                $stmt->close();
            }
        }
    } else {
        $errors[] = "Jeton de réinitialisation invalide ou expiré.";
        error_log("Jeton invalide ou expiré : " . $token);
    }
} else {
    header("Location: https://thundramusic.infinityfreeapp.com/login-fr.php");
    exit();
}

$conn->close();
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thundra Music - Réinitialisation du mot de passe</title>
    <link rel="icon" type="image/x-icon" href="THUNDRA MUSIC.png">
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <style>
        .error { color: #e02424; font-size: 0.875rem; margin-top: 0.25rem; }
        .success { color: #16a34a; font-size: 0.875rem; margin-top: 0.25rem; }
        .password-toggle { position: relative; }
        .password-toggle input { padding-right: 2.5rem; }
        .password-toggle .toggle-icon { position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); cursor: pointer; color: #4a4a4a; }
        body { position: relative; overflow-x: hidden; margin: 0; padding: 0; height: 100%; }
        .container, section, footer, div { position: relative; z-index: 1; }
        @media (max-width: 768px) {
            h1 { font-size: 1.5rem; }
            .max-w-md { max-width: 100%; padding-left: 1rem; padding-right: 1rem; }
            input, button { font-size: 0.875rem; padding-top: 0.5rem; padding-bottom: 0.5rem; }
        }
        @media (max-width: 480px) {
            h1 { font-size: 1.25rem; }
            .text-sm { font-size: 0.75rem; }
        }
    </style>
</head>
<body class="bg-white dark:bg-black text-black dark:text-white min-h-screen">
    <div class="pt-4 px-4">
        <h1 class="text-3xl font-bold text-red-600 text-center">Réinitialisation du mot de passe</h1>
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
                <form method="POST" action="https://thundramusic.infinityfreeapp.com/reset_password-fr.php?token=<?php echo htmlspecialchars($_GET['token']); ?>">
                    <div class="mb-4 password-toggle">
                        <label class="block text-sm font-medium">Nouveau mot de passe</label>
                        <input type="password" name="new_password" id="new_password" class="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-red-600 focus:border-red-600" placeholder="Entrez le nouveau mot de passe">
                        <span class="toggle-icon" onclick="togglePassword('new_password')"><i id="new-password-icon" class="fas fa-eye"></i></span>
                    </div>
                    <div class="mb-4 password-toggle">
                        <label class="block text-sm font-medium">Confirmer le mot de passe</label>
                        <input type="password" name="confirm_password" id="confirm_password" class="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-red-600 focus:border-red-600" placeholder="Confirmez le nouveau mot de passe">
                        <span class="toggle-icon" onclick="togglePassword('confirm_password')"><i id="confirm-password-icon" class="fas fa-eye"></i></span>
                    </div>
                    <button type="submit" class="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Réinitialiser le mot de passe</button>
                </form>
            <?php endif; ?>
        </div>
        <br>
        <!-- Pied de page -->
        <footer class="text-center text-sm py-4">
            <div>
                <a href="https://thundramusic.infinityfreeapp.com/privacy-fr.php" class="text-red-600 hover:underline mx-2">Politique de Confidentialité</a>
                <a href="https://thundramusic.infinityfreeapp.com/conduct-fr.php" class="text-red-600 hover:underline mx-2">Code de Conduite de la Communauté</a>
                <a href="https://thundramusic.infinityfreeapp.com/conditions-fr.php" class="text-red-600 hover:underline mx-2">Conditions Générales d'Utilisation</a>
                <a href="https://thundramusic.infinityfreeapp.com/legal-fr.php" class="text-red-600 hover:underline mx-2">Lois et Directives</a>
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

        // Détecter automatiquement le mode sombre
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark');
        }

        // Charger la préférence de thème enregistrée
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            if (savedTheme === 'dark') {
                document.body.classList.add('dark');
            } else {
                document.body.classList.remove('dark');
            }
        }
    </script>
</body>
</html>