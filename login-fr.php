<?php
// Activer le rapport d'erreurs pour le débogage
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Augmenter la limite de mémoire et le temps d'exécution
ini_set('memory_limit', '512M');
ini_set('max_execution_time', 60);

// Forcer HTTPS
if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === 'off') {
    error_log("Forçage de la redirection HTTPS dans login-fr.php");
    header('Location: https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
    exit();
}

// Démarrer la session en toute sécurité
if (session_status() === PHP_SESSION_NONE) {
    error_log("Démarrage de la session dans login-fr.php");
    session_start();
}

// Connexion à la base de données avec mysqli
$host = '';
$dbname = '';
$username = '';
$password = '';
$port = ;

$conn = new mysqli($host, $username, $password, $dbname, $port);

if ($conn->connect_error) {
    die("Échec de la connexion à la base de données : " . $conn->connect_error);
}

// Inclure PHPMailer
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/PHPMailer/src/Exception.php';
require 'vendor/PHPMailer/src/PHPMailer.php';
require 'vendor/PHPMailer/src/SMTP.php';

// Initialiser les messages d'erreur et de succès
$errors = [];
$forgotErrors = [];
$forgotSuccess = '';

// Gestion de la réinitialisation du mot de passe
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['forgot_submit'])) {
    error_log("Traitement de la demande de réinitialisation du mot de passe");
    $forgotEmail = trim($_POST['forgot_email'] ?? '');

    if (empty($forgotEmail)) {
        $forgotErrors[] = "L'adresse e-mail est requise.";
    } elseif (!filter_var($forgotEmail, FILTER_VALIDATE_EMAIL)) {
        $forgotErrors[] = "Format d'adresse e-mail invalide.";
    } else {
        $stmt = $conn->prepare("SELECT Username FROM users WHERE Email = ?");
        $stmt->bind_param("s", $forgotEmail);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            $resetToken = bin2hex(random_bytes(32));
            $expires = date('Y-m-d H:i:s', time() + 3600);

            $stmt = $conn->prepare("UPDATE users SET reset_token = ?, reset_expires = ? WHERE Email = ?");
            $stmt->bind_param("sss", $resetToken, $expires, $forgotEmail);
            if ($stmt->execute()) {
                $mail = new PHPMailer(true);
                try {
                    $mail->isSMTP();
                    $mail->Host = 'smtp.gmail.com';
                    $mail->SMTPAuth = true;
                    $mail->Username = 'contact.thundramusic@gmail.com';
                    $mail->Password = 'thundra#$25';
                    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
                    $mail->Port = 587;
                    $mail->SMTPDebug = 2;
                    $mail->Debugoutput = function($str, $level) {
                        error_log("PHPMailer Débogage [Niveau $level]: $str");
                    };

                    $mail->setFrom('contact.thundramusic@gmail.com', 'Thundra Music');
                    $mail->addAddress($forgotEmail);

                    $resetLink = "https://thundramusic.infinityfreeapp.com/reset_password-fr.php?token=" . $resetToken;
                    $logoUrl = "https://thundramusic.infinityfreeapp.com/THUNDRA MUSIC.png";
                    $mail->isHTML(true);
                    $mail->Subject = 'Réinitialisation de votre mot de passe Thundra Music';
                    $mail->Body = "
                        <html>
                        <head>
                            <style>
                                body {
                                    font-family: Arial, sans-serif;
                                    background-color: #f4f4f4;
                                    color: #333;
                                    margin: 0;
                                    padding: 0;
                                }
                                .container {
                                    max-width: 600px;
                                    margin: 20px auto;
                                    background-color: #fff;
                                    border-radius: 8px;
                                    overflow: hidden;
                                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                                }
                                .header {
                                    background-color: #e02424;
                                    text-align: center;
                                    padding: 20px;
                                }
                                .header img {
                                    max-width: 150px;
                                    height: auto;
                                }
                                .content {
                                    padding: 20px;
                                    text-align: center;
                                }
                                .content h2 {
                                    color: #e02424;
                                    font-size: 24px;
                                    margin-bottom: 10px;
                                }
                                .content p {
                                    font-size: 16px;
                                    line-height: 1.5;
                                    margin-bottom: 20px;
                                }
                                .button {
                                    display: inline-block;
                                    padding: 10px 20px;
                                    background-color: #e02424;
                                    color: #fff;
                                    text-decoration: none;
                                    border-radius: 5px;
                                    font-size: 16px;
                                }
                                .button:hover {
                                    background-color: #d32f2f;
                                }
                                .footer {
                                    text-align: center;
                                    padding: 10px;
                                    background-color: #f4f4f4;
                                    font-size: 12px;
                                    color: #666;
                                }
                                @media (max-width: 600px) {
                                    .container {
                                        margin: 10px;
                                    }
                                    .header img {
                                        max-width: 100px;
                                    }
                                    .content h2 {
                                        font-size: 20px;
                                    }
                                    .content p {
                                        font-size: 14px;
                                    }
                                }
                            </style>
                        </head>
                        <body>
                            <div class='container'>
                                <div class='header'>
                                    <img src='$logoUrl' alt='Logo Thundra Music'>
                                </div>
                                <div class='content'>
                                    <h2>Demande de réinitialisation de mot de passe</h2>
                                    <p>Bonjour,</p>
                                    <p>Nous avons reçu une demande de réinitialisation de votre mot de passe pour votre compte Thundra Music. Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe en toute sécurité.</p>
                                    <a href='$resetLink' class='button'>Réinitialiser le mot de passe</a>
                                    <p>Ce lien expirera dans 1 heure pour votre sécurité. Si vous n'avez pas fait cette demande, veuillez ignorer cet e-mail ou contacter notre support.</p>
                                    <p>Merci d'avoir choisi Thundra Music !</p>
                                </div>
                                <div class='footer'>
                                    <p>© 2025 Thundra Music. Tous droits réservés.<br>
                                    <a href='https://thundramusic.infinityfreeapp.com' style='color: #e02424;'>Visitez notre site</a> | <a href='mailto:contact.thundramusic@gmail.com' style='color: #e02424;'>Contacter le support</a></p>
                                </div>
                            </div>
                        </body>
                        </html>
                    ";
                    $mail->AltBody = "Cliquez sur le lien pour réinitialiser votre mot de passe : $resetLink\nCe lien expire dans 1 heure. Si vous n'avez pas fait cette demande, contactez contact.thundramusic@gmail.com.";

                    error_log("Tentative d'envoi de l'e-mail de réinitialisation à $forgotEmail");
                    $mail->send();
                    $forgotSuccess = "Un lien de réinitialisation du mot de passe a été envoyé à votre adresse e-mail.";
                } catch (Exception $e) {
                    $forgotErrors[] = "Échec de l'envoi de l'e-mail de réinitialisation. Veuillez réessayer ultérieurement.";
                    error_log("Erreur PHPMailer : " . $mail->ErrorInfo);
                }
            } else {
                $forgotErrors[] = "Erreur lors du traitement de votre demande. Veuillez réessayer.";
            }
            $stmt->close();
        } else {
            $forgotErrors[] = "Aucun compte trouvé avec cette adresse e-mail.";
        }
    }
}

// Gestion du formulaire de connexion
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['login_submit'])) {
    error_log("Traitement de la demande de connexion");
    $formUsername = trim($_POST['username'] ?? '');
    $formPassword = trim($_POST['password'] ?? '');
    $rememberMe = isset($_POST['remember_me']);

    error_log("Nom d'utilisateur saisi : '$formUsername'");
    error_log("Mot de passe saisi : [Masqué pour des raisons de sécurité]");

    $formUsernameLower = strtolower($formUsername);

    if (empty($formUsername)) {
        $errors[] = "Le nom d'utilisateur est requis.";
    }
    if (empty($formPassword)) {
        $errors[] = "Le mot de passe est requis.";
    }

    if (empty($errors)) {
        $stmt = $conn->prepare("SELECT Password, Tier, Subscription FROM users WHERE LOWER(Username) = ?");
        if (!$stmt) {
            error_log("Échec de la préparation de la requête : " . $conn->error);
            die("Erreur serveur : Échec de la préparation de la requête.");
        }
        $stmt->bind_param("s", $formUsernameLower);
        if (!$stmt->execute()) {
            error_log("Échec de l'exécution de la requête : " . $stmt->error);
            die("Erreur serveur : Échec de l'exécution de la requête.");
        }
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        $stmt->close();

        if (!$user) {
            error_log("Utilisateur non trouvé pour le nom d'utilisateur : $formUsernameLower");
            $errors[] = "Nom d'utilisateur ou mot de passe incorrect.";
        } else {
            error_log("Niveau de l'utilisateur : " . ($user['Tier'] ?? 'Non défini'));
            error_log("Abonnement de l'utilisateur : " . ($user['Subscription'] ?? 'Non défini'));

            $isHashed = preg_match('/^\$2y\$/', $user['Password']);
            $passwordMatch = false;
            if ($isHashed) {
                $passwordMatch = password_verify($formPassword, $user['Password']);
                error_log("Vérification avec password_verify. Correspondance : " . ($passwordMatch ? "Oui" : "Non"));
            } else {
                $passwordMatch = ($formPassword === $user['Password']);
                error_log("Comparaison directe du mot de passe. Correspondance : " . ($passwordMatch ? "Oui" : "Non"));
            }

            if ($passwordMatch) {
                $_SESSION['username'] = $formUsernameLower;
                $_SESSION['authToken'] = bin2hex(random_bytes(16));
                error_log("Connexion réussie pour $formUsernameLower. Session définie : " . json_encode($_SESSION));

                if ($rememberMe) {
                    $token = bin2hex(random_bytes(32));
                    $expires = time() + (7 * 24 * 60 * 60);
                    setcookie('remember_token', $token, $expires, "/", "", false, true);
                    setcookie('remember_user', $formUsernameLower, $expires, "/", "", false, true);

                    $stmt = $conn->prepare("UPDATE users SET remember_token = ? WHERE LOWER(Username) = ?");
                    $stmt->bind_param("ss", $token, $formUsernameLower);
                    $stmt->execute();
                    $stmt->close();
                }

                $tier = $user['Tier'] ?? 'Free';
                $subscription = $user['Subscription'] ?? 'Free';

                error_log("Redirection basée sur Tier : $tier, Subscription : $subscription");

                switch ($tier) {
                    case 'Admin':
                        error_log("Redirection vers admin_dashboard.php");
                        header("Location: https://thundramusic.infinityfreeapp.com/admin_dashboard.php");
                        break;
                    case 'Moderator':
                        error_log("Redirection vers moderator_dashboard.php");
                        header("Location: https://thundramusic.infinityfreeapp.com/moderator_dashboard.php");
                        break;
                    case 'Artist':
                        error_log("Redirection vers artist_dashboard.php");
                        header("Location: https://thundramusic.infinityfreeapp.com/artist_dashboard.php");
                        break;
                    case 'Staff':
                        error_log("Redirection vers staff_dashboard.php");
                        header("Location: https://thundramusic.infinityfreeapp.com/staff_dashboard.php");
                        break;
                    default:
                        if ($subscription === 'VIP') {
                            error_log("Redirection vers vip_dashboard.php");
                            header("Location: https://thundramusic.infinityfreeapp.com/vip_dashboard.php");
                        } elseif ($subscription === 'Subscription') {
                            error_log("Redirection vers premium_dashboard.php");
                            header("Location: https://thundramusic.infinityfreeapp.com/premium_dashboard.php");
                        } else {
                            error_log("Redirection vers dashboard-fr.php");
                            header("Location: https://thundramusic.infinityfreeapp.com/dashboard-fr.php");
                        }
                        break;
                }
                exit();
            } else {
                $errors[] = "Nom d'utilisateur ou mot de passe incorrect.";
                error_log("Échec de la vérification du mot de passe pour $formUsernameLower");
            }
        }
    }
}

$conn->close();
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thundra Music - Connexion</title>
    <link rel="icon" type="image/x-icon" href="THUNDRA MUSIC.png">
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
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
        @media (max-width: 768px) {
            h1 {
                font-size: 1.5rem;
            }
            .max-w-md {
                max-width: 100%;
                padding-left: 1rem;
                padding-right: 1rem;
            }
            input, button {
                font-size: 0.875rem;
                padding-top: 0.5rem;
                padding-bottom: 0.5rem;
            }
        }
        @media (max-width: 480px) {
            h1 {
                font-size: 1.25rem;
            }
            .text-sm {
                font-size: 0.75rem;
            }
            .space-x-4 > * + * {
                margin-left: 0.5rem;
            }
        }
        .error {
            color: #e02424;
            font-size: 0.875rem;
            margin-top: 0.25rem;
        }
        .success {
            color: #16a34a;
            font-size: 0.875rem;
            margin-top: 0.25rem;
        }
        .password-toggle {
            position: relative;
        }
        .password-toggle input[type="password"],
        .password-toggle input[type="text"] {
            padding-right: 2.5rem;
        }
        .password-toggle .toggle-icon {
            position: absolute;
            right: 0.75rem;
            top: 50%;
            transform: translateY(-50%);
            cursor: pointer;
            color: #4a4a4a;
        }
        .back-button {
            position: absolute;
            top: 1rem;
            left: 1rem;
            color: #e02424;
            font-size: 1.5rem;
            z-index: 10;
        }
        .forgot-password {
            display: none;
            margin-top: 1rem;
        }
        .forgot-password.active {
            display: block;
        }
        .social-login-container {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 1rem;
        }
        .social-login-container a {
            font-size: 2rem;
            line-height: 1;
        }
        .dark #background-canvas {
            filter: brightness(0.3);
        }
    </style>
</head>
<body class="bg-white dark:bg-black text-black dark:text-white min-h-screen">
    <!-- Bouton de retour -->
    <a href="https://thundramusic.infinityfreeapp.com/welcome.html" class="back-button"><i class="fas fa-arrow-left"></i></a>

    <!-- Toile de fond animée -->
    <canvas id="background-canvas"></canvas>

    <!-- Contenu principal -->
    <div class="pt-4 px-4">
        <h1 class="text-3xl font-bold text-red-600 text-center">Connexion</h1>
        <div class="max-w-md mx-auto mt-4 bg-gray-200 dark:bg-gray-800 p-6 rounded">
            <!-- Afficher les erreurs de connexion -->
            <?php if (!empty($errors)): ?>
                <div class="mb-4">
                    <?php foreach ($errors as $error): ?>
                        <p class="error"><?php echo htmlspecialchars($error); ?></p>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>

            <!-- Formulaire de connexion -->
            <form method="POST" action="https://thundramusic.infinityfreeapp.com/login-fr.php">
                <input type="hidden" name="login_submit" value="1">
                <div class="mb-4">
                    <label class="block text-sm font-medium">Nom d'utilisateur</label>
                    <input type="text" name="username" value="<?php echo isset($formUsername) ? htmlspecialchars($formUsername) : ''; ?>" class="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-red-600 focus:border-red-600" placeholder="Entrez votre nom d'utilisateur">
                </div>
                <div class="mb-4 password-toggle">
                    <label class="block text-sm font-medium">Mot de passe</label>
                    <input type="password" name="password" id="password" class="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-red-600 focus:border-red-600" placeholder="Entrez votre mot de passe">
                    <span class="toggle-icon" onclick="togglePassword()">
                        <i id="password-icon" class="fas fa-eye"></i>
                    </span>
                </div>
                <div class="mb-4">
                    <label class="flex items-center">
                        <input type="checkbox" name="remember_me" class="mr-2">
                        <span class="text-sm">Se souvenir de moi</span>
                    </label>
                </div>
                <button type="submit" class="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"><i class="fas fa-sign-in-alt mr-2"></i> Se connecter</button>
            </form>

            <!-- Lien Mot de passe oublié -->
            <div class="text-center mt-2">
                <a href="#" id="forgot-password-link" class="text-red-600 hover:underline">Mot de passe oublié ?</a>
            </div>

            <!-- Formulaire de réinitialisation du mot de passe -->
            <div id="forgot-password-form" class="forgot-password">
                <?php if (!empty($forgotErrors)): ?>
                    <div class="mb-4">
                        <?php foreach ($forgotErrors as $error): ?>
                            <p class="error"><?php echo htmlspecialchars($error); ?></p>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
                <?php if ($forgotSuccess): ?>
                    <p class="success"><?php echo htmlspecialchars($forgotSuccess); ?></p>
                <?php endif; ?>
                <form method="POST" action="https://thundramusic.infinityfreeapp.com/login-fr.php">
                    <input type="hidden" name="forgot_submit" value="1">
                    <div class="mb-4">
                        <label class="block text-sm font-medium">Adresse e-mail</label>
                        <input type="email" name="forgot_email" class="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-red-600 focus:border-red-600" placeholder="Entrez votre adresse e-mail">
                    </div>
                    <button type="submit" class="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Envoyer le lien de réinitialisation</button>
                </form>
                <div class="text-center mt-2">
                    <a href="#" id="back-to-login-link" class="text-red-600 hover:underline">Retour à la connexion</a>
                </div>
            </div>

            <!-- Séparateur OU -->
            <div class="text-center my-4">
                <span class="text-sm font-semibold text-gray-500 dark:text-gray-400">OU</span>
            </div>

            <!-- Options de connexion sociale -->
            <div class="mt-4 social-login-container">
                <a href="https://thundramusic.infinityfreeapp.com/signup-fr.php" class="text-red-600 hover:opacity-80" title="Google">
                    <i class="fab fa-google"></i>
                </a>
                <a href="https://thundramusic.infinityfreeapp.com/signup-fr.php" class="text-red-600 hover:opacity-80" title="Apple">
                    <i class="fab fa-apple"></i>
                </a>
                <a href="https://thundramusic.infinityfreeapp.com/signup-fr.php" class="text-red-600 hover:opacity-80" title="X">
                    <i class="fab fa-x-twitter"></i>
                </a>
                <a href="https://thundramusic.infinityfreeapp.com/signup-fr.php" class="text-red-600 hover:opacity-80" title="Facebook">
                    <i class="fab fa-facebook-f"></i>
                </a>
                <a href="https://thundramusic.infinityfreeapp.com/signup-fr.php" class="text-red-600 hover:opacity-80" title="Wallet Connect">
                    <i class="fas fa-wallet"></i>
                </a>
            </div>
        </div>
        <div class="text-center mt-4">
            <p>Pas encore de compte ? <a href="https://thundramusic.infinityfreeapp.com/signup-fr.php" class="text-red-600 hover:underline">S'inscrire</a></p>
        </div>

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
        // Basculer la visibilité du mot de passe
        function togglePassword() {
            const passwordInput = document.getElementById('password');
            const passwordIcon = document.getElementById('password-icon');
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
            document.getElementById('theme-icon').classList.replace('fa-moon', 'fa-sun');
        }

        // Basculer le thème
        const themeToggle = document.getElementById('theme-toggle');
        const themeIcon = document.getElementById('theme-icon');
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark');
            if (document.body.classList.contains('dark')) {
                themeIcon.classList.replace('fa-moon', 'fa-sun');
                localStorage.setItem('theme', 'dark');
            } else {
                themeIcon.classList.replace('fa-sun', 'fa-moon');
                localStorage.setItem('theme', 'light');
            }
        });

        // Charger la préférence de thème enregistrée
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            if (savedTheme === 'dark') {
                document.body.classList.add('dark');
                themeIcon.classList.replace('fa-moon', 'fa-sun');
            } else {
                document.body.classList.remove('dark');
                themeIcon.classList.replace('fa-sun', 'fa-moon');
            }
        }

        // Animation de fond
        const canvas = document.getElementById('background-canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let particles = [];
        const particleCount = window.innerWidth < 768 ? 30 : 50;

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 20 + 10;
                this.speedX = (Math.random() * 2 - 1) * 0.5;
                this.speedY = (Math.random() * 2 - 1) * 0.5;
                this.directionY = Math.random() > 0.5 ? 1 : -1;
                this.text = '♪';
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY * this.directionY;

                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            }

            draw() {
                ctx.font = `${this.size}px Arial`;
                ctx.fillStyle = '#e02424';
                ctx.fillText(this.text, this.x, this.y);
            }
        }

        function initParticles() {
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            requestAnimationFrame(animate);
        }

        initParticles();
        animate();

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            particles.forEach(particle => {
                particle.x = Math.random() * canvas.width;
                particle.y = Math.random() * canvas.height;
            });
        });

        // Gestion du formulaire de mot de passe oublié
        const forgotLink = document.getElementById('forgot-password-link');
        const backLink = document.getElementById('back-to-login-link');
        const forgotForm = document.getElementById('forgot-password-form');

        forgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            forgotForm.classList.add('active');
        });

        backLink.addEventListener('click', (e) => {
            e.preventDefault();
            forgotForm.classList.remove('active');
        });

        // Stocker le jeton d'authentification
        <?php if (isset($_SESSION['authToken']) && isset($_SESSION['username'])): ?>
            localStorage.setItem('authToken', '<?php echo $_SESSION['authToken']; ?>');
            localStorage.setItem('username', '<?php echo $_SESSION['username']; ?>');
        <?php endif; ?>
    </script>
</body>

</html>
