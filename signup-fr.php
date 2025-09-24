<?php
// Activer la gestion des erreurs pour le débogage
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Augmenter la limite de mémoire et le temps d'exécution
ini_set('memory_limit', '256M');
ini_set('max_execution_time', 60);

session_start();

// Connexion à la base de données avec mysqli
$host = 'sql209.infinityfree.com';
$dbname = 'if0_38852888_thundramusic';
$username = 'if0_38852888';
$password = 'Malinga7';
$port = 3306;

$conn = new mysqli($host, $username, $password, $dbname, $port);

if ($conn->connect_error) {
    die("La connexion a échoué : " . $conn->connect_error);
}

// Initialiser les messages d'erreur et de succès
$errors = [];
$success = "";

// Liste des noms d'utilisateurs réservés pour les administrateurs (insensible à la casse)
$adminUsernames = ['isaackan', 'lilkey\'s', 'suspect44', 'jedida', 'loic', 'loïc'];

// Gestion du formulaire
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $formUsername = trim($_POST['username']);
    $email = trim($_POST['email']);
    $formPassword = trim($_POST['password']);
    $requestedRole = $_POST['role'] ?? '';
    $consent = isset($_POST['consent']) ? true : false;

    // Convertir le nom d'utilisateur en minuscules pour une cohérence
    $formUsernameLower = strtolower($formUsername);

    // Validation : Vérifier les champs vides
    if (empty($formUsername)) {
        $errors[] = "Le nom d'utilisateur est requis.";
    }
    if (empty($email)) {
        $errors[] = "L'email est requis.";
    }
    if (empty($formPassword)) {
        $errors[] = "Le mot de passe est requis.";
    }
    if (!$consent) {
        $errors[] = "Vous devez accepter la Politique de Confidentialité, le Code de Conduite Communautaire et les Conditions Générales d'Utilisation pour continuer.";
    }

    // Validation : Vérifier si le nom d'utilisateur est réservé pour les administrateurs
    if (empty($errors) && in_array($formUsernameLower, $adminUsernames)) {
        $errors[] = "Ce nom d'utilisateur est réservé. Veuillez en choisir un autre.";
    }

    // Validation : Vérifier si le nom d'utilisateur est unique (insensible à la casse)
    if (empty($errors)) {
        $stmt = $conn->prepare("SELECT COUNT(*) FROM users WHERE LOWER(Username) = ?");
        $stmt->bind_param("s", $formUsernameLower);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();

        if ($count > 0) {
            $errors[] = "Ce nom d'utilisateur existe déjà. Veuillez en choisir un autre.";
        }
    }

    // Si aucune erreur, procéder à l'inscription
    if (empty($errors)) {
        // Hacher le mot de passe
        $hashedPassword = password_hash($formPassword, PASSWORD_DEFAULT);

        // Insérer l'utilisateur dans la base de données (nom d'utilisateur en minuscules)
        $stmt = $conn->prepare("INSERT INTO users (Username, Email, Password, Subscription, Tier) VALUES (?, ?, ?, 'Free', 'Free')");
        $stmt->bind_param("sss", $formUsernameLower, $email, $hashedPassword);
        if ($stmt->execute()) {
            // Si un rôle a été demandé, l'insérer dans la table role_requests
            if (!empty($requestedRole) && ($requestedRole === 'artist' || $requestedRole === 'moderator')) {
                $roleToRequest = ucfirst($requestedRole); // Mettre en majuscule (Artist ou Moderator)
                $stmt = $conn->prepare("INSERT INTO role_requests (username, requested_role, status) VALUES (?, ?, 'Pending')");
                $stmt->bind_param("ss", $formUsernameLower, $roleToRequest);
                $stmt->execute();
                $stmt->close();
            }

            $success = "Inscription réussie ! Vous pouvez maintenant <a href='login-fr.php' class='text-red-600 hover:underline'>vous connecter ici</a>.";
        } else {
            $errors[] = "Échec de l'inscription. Veuillez réessayer.";
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
    <title>Thundra Music - Inscription</title>
    <link rel="icon" type="image/x-icon" href="THUNDRA MUSIC.png">
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
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
        /* Ajustements responsives */
        @media (max-width: 768px) {
            h1 {
                @apply text-2xl;
            }
            .max-w-md {
                @apply max-w-full px-4;
            }
            input, select, button {
                @apply text-sm py-2;
            }
        }
        @media (max-width: 480px) {
            h1 {
                @apply text-xl;
            }
            .text-sm {
                @apply text-xs;
            }
            .space-x-4 > * + * {
                @apply ml-2;
            }
        }
        /* Messages d'erreur et de succès */
        .error {
            color: #e02424;
            font-size: 0.875rem;
            margin-top: 0.25rem;
        }
        .success {
            color: #10b981;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            text-align: center;
        }
        .back-button {
            position: absolute;
            top: 1rem;
            left: 1rem;
            color: #e02424;
            font-size: 1.5rem;
            z-index: 10;
        }
        .consent-error {
            color: #e02424;
            font-size: 0.75rem;
            margin-top: 0.25rem;
            display: none;
        }
        .social-login-container {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 1rem; /* Espacement constant entre les icônes */
        }
        .social-login-container a {
            font-size: 2rem; /* Taille uniforme pour toutes les icônes */
            line-height: 1; /* Assurer l'alignement */
        }
    </style>
</head>
<body class="bg-white dark:bg-black text-black dark:text-white min-h-screen page-transition">
<a href="welcome.html" class="back-button"><i class="fas fa-arrow-left"></i></a>
    <!-- Toile de fond Canvas -->
    <canvas id="background-canvas"></canvas>

    <!-- Contenu principal -->
    <div class="pt-4 px-4">
        <h1 class="text-3xl font-bold text-red-600 text-center">Inscription</h1>
        <div class="max-w-md mx-auto mt-4 bg-gray-200 dark:bg-gray-800 p-6 rounded">
            <!-- Afficher les erreurs ou le succès -->
            <?php if (!empty($errors)): ?>
                <div class="mb-4">
                    <?php foreach ($errors as $error): ?>
                        <p class="error"><?php echo htmlspecialchars($error); ?></p>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
            <?php if (!empty($success)): ?>
                <div class="mb-4">
                    <p class="success"><?php echo $success; ?></p>
                </div>
            <?php endif; ?>

            <!-- Formulaire d'inscription -->
            <form method="POST" action="signup-fr.php" onsubmit="return validateConsent()">
                <div class="mb-4">
                    <label class="block text-sm font-medium">Nom d'utilisateur</label>
                    <input type="text" name="username" value="<?php echo isset($formUsername) ? htmlspecialchars($formUsername) : ''; ?>" class="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-red-600 focus:border-red-600" placeholder="Entrez votre nom d'utilisateur">
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium">Email</label>
                    <input type="email" name="email" value="<?php echo isset($email) ? htmlspecialchars($email) : ''; ?>" class="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-red-600 focus:border-red-600" placeholder="Entrez votre email">
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium">Mot de passe</label>
                    <input type="password" name="password" class="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-red-600 focus:border-red-600" placeholder="Entrez votre mot de passe">
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium">Demander un rôle (Optionnel)</label>
                    <select name="role" class="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-red-600 focus:border-red-600">
                        <option value="">Aucun</option>
                        <option value="artist">Demander à être un Artiste Indépendant</option>
                        <option value="moderator">Demander à être un Modérateur</option>
                    </select>
                    <p class="text-sm mt-2">Les demandes sont envoyées aux Admins pour approbation. <br> En attendant, vous serez un utilisateur normal.</p>
                    <br>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium">
                        <input type="checkbox" name="consent" id="consent" class="mr-2"> Je valide, consens et accepte les
                        <a href="privacy-fr.html" class="text-red-600 hover:underline">Politique de Confidentialité</a>,
                        <a href="conduct-fr.html" class="text-red-600 hover:underline">Code de Conduite Communautaire</a>,
                        <a href="conditions-fr.html" class="text-red-600 hover:underline">Conditions Générales d'Utilisation</a>, et
                        <a href="legal-fr.html" class="text-red-600 hover:underline">Lois & Directives</a>
                    </label>
                    <p class="consent-error" id="consent-error">Ce champ est requis.</p>
                </div>
                <button type="submit" class="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 electric-hover"><i class="fas fa-user-plus mr-2"></i> S'inscrire</button>
            </form>

            <!-- Séparateur OU -->
            <div class="text-center my-4">
                <span class="text-sm font-semibold text-gray-500 dark:text-gray-400">OU</span>
            </div>
            <!-- Options de connexion sociale -->
            <div class="mt-4 social-login-container">
                <a href="https://accounts.google.com/" class="text-red-600 hover:opacity-80" title="Google">
                    <i class="fab fa-google"></i>
                </a>
                <a href="https://appleid.apple.com/" class="text-red-600 hover:opacity-80" title="Apple">
                    <i class="fab fa-apple"></i>
                </a>
                <a href="https://x.com/login" class="text-red-600 hover:opacity-80" title="X">
                    <i class="fab fa-x-twitter"></i>
                </a>
                <a href="https://www.facebook.com/login" class="text-red-600 hover:opacity-80" title="Facebook">
                    <i class="fab fa-facebook-f"></i>
                </a>
                <a href="https://walletconnect.com/" class="text-red-600 hover:opacity-80" title="Wallet Connect">
                    <i class="fas fa-wallet"></i>
                </a>
            </div>
        </div>
        <div class="text-center mt-4">
            <p>Vous avez déjà un compte ? <a href="login-fr.php" class="text-red-600 hover:underline">Connexion</a></p>
        </div>

        <!-- Pied de page avec liens de politique et bascule de thème -->
        <footer class="text-center text-sm py-4">
            <div>
                <a href="privacy-fr.html" class="text-red-600 hover:underline mx-2">Politique de Confidentialité</a>
                <a href="conduct-fr.html" class="text-red-600 hover:underline mx-2">Code de Conduite Communautaire</a>
                <a href="conditions-fr.html" class="text-red-600 hover:underline mx-2">Conditions Générales d'Utilisation</a>
                <a href="legal-fr.html" class="text-red-600 hover:underline mx-2">Lois & Directives</a>
            </div>
            <div class="mt-4">
                <button id="theme-toggle" class="text-red-600 hover:text-red-700 focus:outline-none">
                    <i id="theme-icon" class="fas fa-moon text-2xl"></i>
                </button>
            </div>
        </footer>
    </div>

    <script>
        // Détection automatique du mode clair/sombre
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark');
            document.getElementById('theme-icon').classList.replace('fa-moon', 'fa-sun');
        }

        // Bascule de thème
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

        // Charger la préférence de thème sauvegardée
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

        // Fond animé en direct
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
                ctx.fillStyle = '#ff0000';
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

        // Validation du consentement
        function validateConsent() {
            const consentCheckbox = document.getElementById('consent');
            const consentError = document.getElementById('consent-error');
            if (!consentCheckbox.checked) {
                consentError.style.display = 'block';
                return false;
            }
            consentError.style.display = 'none';
            return true;
        }
    </script>
</body>
</html>