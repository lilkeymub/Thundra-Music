<?php
// Enable error reporting for debugging (disabled for production)
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');
error_reporting(E_ALL);

// Increase memory limit and execution time
ini_set('memory_limit', '512M');
ini_set('max_execution_time', 60);

// Force HTTPS
if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === 'off') {
    header('Location: https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
    exit();
}

// Start session safely
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Configuration
define('STYTCH_PROJECT_ID', 'project-live-a9260d05-5dbe-4c03-8eab-d56c1f202890');
define('STYTCH_SECRET', 'secret-live-kydsqMHf1leDE2iKqTobSbDrIvZV0hh8G1U=');
define('STYTCH_PUBLIC_TOKEN', 'public-token-live-f6fd17b9-bcd4-41f9-bddf-d858e30bb3e4');
define('WALLET_CONNECT_PROJECT_ID', 'acf0ba32fd83fd3d60552342707cd3dc');
define('CONTRACT_ADDRESS', '0xc335Df7C25b72eEC661d5Aa32a7c2B7b2a1D1874');

/// Database connection
$host = '';
$dbname = '';
$username = '';
$password = '';
$port = ;

$conn = new mysqli($host, $username, $password, $dbname, $port);
if ($conn->connect_error) {
    error_log("Database connection failed: " . $conn->connect_error);
    die("Connection failed: " . $conn->connect_error);
}

// Include PHPMailer
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
require 'vendor/PHPMailer/src/Exception.php';
require 'vendor/PHPMailer/src/PHPMailer.php';
require 'vendor/PHPMailer/src/SMTP.php';

// Cookie-based auto-login
if (!isset($_SESSION['username']) && isset($_COOKIE['remember_user']) && isset($_COOKIE['remember_token'])) {
    $cookie_user = $_COOKIE['remember_user'];
    $cookie_token = $_COOKIE['remember_token'];

    $stmt = $conn->prepare("SELECT Username, Tier, Subscription, ion_status FROM users WHERE LOWER(Username) = ? AND remember_token = ?");
    $cookie_user_lower = strtolower($cookie_user);
    $stmt->bind_param("ss", $cookie_user_lower, $cookie_token);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($user = $result->fetch_assoc()) {
        $_SESSION['username'] = $cookie_user_lower;
        $_SESSION['authToken'] = bin2hex(random_bytes(16));
        $_SESSION['ion_status'] = $user['ion_status'] ?? 'Non-ION';
        $tier = $user['Tier'] ?? 'Free';
        $subscription = $user['Subscription'] ?? 'Free';

        switch ($tier) {
            case 'Admin':
                header("Location: https://thundramusic.infinityfreeapp.com/admin_dashboard.php");
                break;
            case 'Moderator':
                header("Location: https://thundramusic.infinityfreeapp.com/moderator_dashboard.php");
                break;
            case 'Artist':
                header("Location: https://thundramusic.infinityfreeapp.com/artist_dashboard.php");
                break;
            case 'Staff':
                header("Location: https://thundramusic.infinityfreeapp.com/staff_dashboard.php");
                break;
            default:
                if ($subscription === 'VIP') {
                    header("Location: https://thundramusic.infinityfreeapp.com/vip_dashboard.php");
                } elseif ($subscription === 'Subscription') {
                    header("Location: https://thundramusic.infinityfreeapp.com/premium_dashboard.php");
                } else {
                    header("Location: https://thundramusic.infinityfreeapp.com/dashboard.php");
                }
                break;
        }
        $stmt->close();
        exit();
    }
    $stmt->close();
    // Clear invalid cookies
    setcookie('remember_user', '', time() - 3600, "/");
    setcookie('remember_token', '', time() - 3600, "/");
}

// Initialize error messages
$errors = [];
$forgotErrors = [];
$forgotSuccess = '';

// Handle Google OAuth redirect
if (isset($_GET['google_login'])) {
    $redirect_uri = urlencode('https://thundramusic.infinityfreeapp.com/authenticate.php');
    $google_oauth_url = "https://api.stytch.com/v1/public/oauth/google/start?public_token=" . STYTCH_PUBLIC_TOKEN . "&login_redirect_url=$redirect_uri&signup_redirect_url=$redirect_uri";
    header("Location: $google_oauth_url");
    exit();
}

// Handle X OAuth redirect
if (isset($_GET['x_login'])) {
    $redirect_uri = urlencode('https://thundramusic.infinityfreeapp.com/authenticate.php');
    $x_oauth_url = "https://api.stytch.com/v1/public/oauth/twitter/start?public_token=" . STYTCH_PUBLIC_TOKEN . "&login_redirect_url=$redirect_uri&signup_redirect_url=$redirect_uri";
    header("Location: $x_oauth_url");
    exit();
}

// Forgot Password handling
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['forgot_submit'])) {
    $forgotEmail = trim($_POST['forgot_email'] ?? '');
    if (empty($forgotEmail)) {
        $forgotErrors[] = "Email is required.";
    } elseif (!filter_var($forgotEmail, FILTER_VALIDATE_EMAIL)) {
        $forgotErrors[] = "Invalid email format.";
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
                    $mail->setFrom('contact.thundramusic@gmail.com', 'Thundra Music');
                    $mail->addAddress($forgotEmail);
                    $resetLink = "https://thundramusic.infinityfreeapp.com/reset_password.php?token=" . $resetToken;
                    $mail->isHTML(true);
                    $mail->Subject = 'Reset Your Thundra Music Password';
                    $mail->Body = "<p>Hello,</p><p>You requested a password reset. Click below to reset:</p><a href='$resetLink'>Reset Password</a><p>Expires in 1 hour.</p>";
                    $mail->AltBody = "Reset your password: $resetLink\nExpires in 1 hour.";
                    $mail->send();
                    $forgotSuccess = "A password reset link has been sent to your email.";
                } catch (Exception $e) {
                    $forgotErrors[] = "Failed to send reset email.";
                    error_log("PHPMailer Error: " . $mail->ErrorInfo);
                }
            } else {
                $forgotErrors[] = "Error processing request.";
            }
            $stmt->close();
        } else {
            $forgotErrors[] = "No account found with that email.";
        }
    }
}

// Form handling for login
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['login_submit'])) {
    $formUsername = trim($_POST['username'] ?? '');
    $formPassword = trim($_POST['password'] ?? '');
    $rememberMe = isset($_POST['remember_me']);

    if (empty($formUsername)) {
        $errors[] = "Username is required.";
    }
    if (empty($formPassword)) {
        $errors[] = "Password is required.";
    }

    if (empty($errors)) {
        $stmt = $conn->prepare("SELECT Username, Password, Tier, Subscription, ion_status FROM users WHERE LOWER(Username) = ?");
        $formUsernameLower = strtolower($formUsername);
        $stmt->bind_param("s", $formUsernameLower);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        $stmt->close();

        if ($user && password_verify($formPassword, $user['Password'])) {
            $_SESSION['username'] = $formUsernameLower;
            $_SESSION['authToken'] = bin2hex(random_bytes(16));
            $_SESSION['ion_status'] = $user['ion_status'] ?? 'Non-ION';

            if ($rememberMe) {
                $token = bin2hex(random_bytes(32));
                $expires = time() + (7 * 24 * 60 * 60);
                setcookie('remember_token', $token, $expires, "/", "", true, true);
                setcookie('remember_user', $formUsernameLower, $expires, "/", "", true, true);

                $stmt = $conn->prepare("UPDATE users SET remember_token = ? WHERE LOWER(Username) = ?");
                $stmt->bind_param("ss", $token, $formUsernameLower);
                $stmt->execute();
                $stmt->close();
            }

            $tier = $user['Tier'] ?? 'Free';
            $subscription = $user['Subscription'] ?? 'Free';
            switch ($tier) {
                case 'Admin':
                    header("Location: https://thundramusic.infinityfreeapp.com/admin_dashboard.php");
                    break;
                case 'Moderator':
                    header("Location: https://thundramusic.infinityfreeapp.com/moderator_dashboard.php");
                    break;
                case 'Artist':
                    header("Location: https://thundramusic.infinityfreeapp.com/artist_dashboard.php");
                    break;
                case 'Staff':
                    header("Location: https://thundramusic.infinityfreeapp.com/staff_dashboard.php");
                    break;
                default:
                    if ($subscription === 'VIP') {
                        header("Location: https://thundramusic.infinityfreeapp.com/vip_dashboard.php");
                    } elseif ($subscription === 'Subscription') {
                        header("Location: https://thundramusic.infinityfreeapp.com/premium_dashboard.php");
                    } else {
                        header("Location: https://thundramusic.infinityfreeapp.com/dashboard.php");
                    }
                    break;
            }
            exit();
        } else {
            $errors[] = "Invalid username or password. Please sign up if you don't have an account.";
        }
    }
}

// Generate nonce for wallet login
$nonce = bin2hex(random_bytes(16));
$_SESSION['wallet_nonce'] = $nonce;

$conn->close();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thundra Music - Login</title>
    <link rel="icon" type="image/x-icon" href="THUNDRA MUSIC.png">
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <script src="https://unpkg.com/@reown/appkit@1.0.0-beta.6/dist/index.js"></script>
    <script src="https://unpkg.com/viem@2.21.1/dist/index.js"></script>
    <script src="https://unpkg.com/web3@4.4.0/dist/web3.min.js"></script>
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
            h1 { @apply text-2xl; }
            .max-w-md { @apply max-w-full px-4; }
            input, button { @apply text-sm py-2; }
        }
        @media (max-width: 480px) {
            h1 { @apply text-xl; }
            .text-sm { @apply text-xs; }
            .space-x-4 > * + * { @apply ml-2; }
        }
        .error {
            color: #e02424;
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
            flex-wrap: wrap;
        }
        .social-btn {
            width: 48px;
            height: 48px;
            background-color: #e02424;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            transition: transform 0.2s, background-color 0.2s, box-shadow 0.2s;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .social-btn:hover {
            transform: scale(1.1);
            background-color: #c01818;
            box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
        }
        .social-btn:active {
            transform: scale(0.95);
        }
    </style>
</head>
<body class="bg-white dark:bg-black text-black dark:text-white min-h-screen">
    <a href="https://thundramusic.infinityfreeapp.com/index.html" class="back-button"><i class="fas fa-arrow-left"></i></a>
    <canvas id="background-canvas"></canvas>

    <div class="pt-4 px-4">
        <h1 class="text-3xl font-bold text-red-600 text-center">Login</h1>
        <div class="max-w-md mx-auto mt-4 bg-gray-200 dark:bg-gray-800 p-6 rounded">
            <?php if (!empty($errors)): ?>
                <div class="mb-4">
                    <?php foreach ($errors as $error): ?>
                        <p class="error"><?php echo htmlspecialchars($error); ?> <a href='https://thundramusic.infinityfreeapp.com/signup.php' class='text-blue-600 hover:underline'>Sign up here</a>.</p>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
            <?php if (isset($_GET['error'])): ?>
                <p class="error"><?php echo htmlspecialchars($_GET['error']); ?> <a href='https://thundramusic.infinityfreeapp.com/signup.php' class='text-blue-600 hover:underline'>Sign up here</a>.</p>
            <?php endif; ?>
            <?php if ($forgotSuccess): ?>
                <p class="text-green-600"><?php echo htmlspecialchars($forgotSuccess); ?></p>
            <?php endif; ?>

            <form method="POST" action="https://thundramusic.infinityfreeapp.com/login.php">
                <input type="hidden" name="login_submit" value="1">
                <div class="mb-4">
                    <label class="block text-sm font-medium">Username</label>
                    <input type="text" name="username" value="<?php echo isset($formUsername) ? htmlspecialchars($formUsername) : ''; ?>" class="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-red-600 focus:border-red-600" placeholder="Enter your username">
                </div>
                <div class="mb-4 password-toggle">
                    <label class="block text-sm font-medium">Password</label>
                    <input type="password" name="password" id="password" class="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-red-600 focus:border-red-600" placeholder="Enter your password">
                    <span class="toggle-icon" onclick="togglePassword()">
                        <i id="password-icon" class="fas fa-eye"></i>
                    </span>
                </div>
                <div class="mb-4">
                    <label class="flex items-center">
                        <input type="checkbox" name="remember_me" class="mr-2">
                        <span class="text-sm">Remember Me</span>
                    </label>
                </div>
                <button type="submit" class="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"><i class="fas fa-sign-in-alt mr-2"></i> Login</button>
            </form>

            <div class="text-center mt-2">
                <a href="#" id="forgot-password-link" class="text-red-600 hover:underline">Forgot Password?</a>
            </div>

            <div id="forgot-password-form" class="forgot-password">
                <?php if (!empty($forgotErrors)): ?>
                    <div class="mb-4">
                        <?php foreach ($forgotErrors as $error): ?>
                            <p class="error"><?php echo htmlspecialchars($error); ?></p>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
                <form method="POST" action="https://thundramusic.infinityfreeapp.com/login.php">
                    <input type="hidden" name="forgot_submit" value="1">
                    <div class="mb-4">
                        <label class="block text-sm font-medium">Email</label>
                        <input type="email" name="forgot_email" class="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-red-600 focus:border-red-600" placeholder="Enter your email">
                    </div>
                    <button type="submit" class="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Send Reset Link</button>
                </form>
                <div class="text-center mt-2">
                    <a href="#" id="back-to-login-link" class="text-red-600 hover:underline">Back to Login</a>
                </div>
            </div>

            <div class="text-center my-4">
                <span class="text-sm font-semibold text-gray-500 dark:text-gray-400">OR</span>
            </div>
            <div class="mt-4 social-login-container">
                <a href="https://thundramusic.infinityfreeapp.com/login.php?google_login=1" class="social-btn" title="Login with Google">
                    <i class="fab fa-google"></i>
                </a>
                <a href="https://thundramusic.infinityfreeapp.com/login.php?x_login=1" class="social-btn" title="Login with X">
                    <i class="fab fa-x-twitter"></i>
                </a>
                <a href="#" id="wallet-login-btn" class="social-btn" title="Login with Wallet">
                    <i class="fas fa-wallet"></i>
                </a>
                <a href="https://appleid.apple.com/" class="social-btn" title="Login with Apple">
                    <i class="fab fa-apple"></i>
                </a>
                <a href="https://www.facebook.com/login" class="social-btn" title="Login with Facebook">
                    <i class="fab fa-facebook-f"></i>
                </a>
            </div>
        </div>
        <div class="text-center mt-4">
            <p>Don't have an account? <a href="https://thundramusic.infinityfreeapp.com/signup.php" class="text-red-600 hover:underline">Sign Up</a></p>
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
        async function initAppKit() {
            const projectId = '<?php echo WALLET_CONNECT_PROJECT_ID; ?>';
            const contractAddress = '<?php echo CONTRACT_ADDRESS; ?>';
            const bnbChain = {
                id: 56,
                name: 'BNB Smart Chain',
                nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
                rpcUrls: { default: { http: ['https://bsc-dataseed.binance.org/'] } },
                blockExplorers: { default: { name: 'BscScan', url: 'https://bscscan.com' } }
            };
            const chains = [
                viem.createPublicClient({
                    chain: bnbChain,
                    transport: viem.http('https://bsc-dataseed.binance.org/')
                })
            ];

            const appKit = await window.AppKit.createAppKit({
                projectId,
                networks: chains,
                defaultNetwork: bnbChain,
                metadata: {
                    name: 'Thundra Music',
                    description: 'Thundra Music Web3 Login',
                    url: 'https://thundramusic.infinityfreeapp.com',
                    icons: ['https://thundramusic.infinityfreeapp.com/THUNDRA MUSIC.png']
                },
                themeMode: 'light'
            });

            return { appKit, contractAddress };
        }

        document.getElementById('wallet-login-btn').addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                const { appKit, contractAddress } = await initAppKit();
                await appKit.open();
                const { address } = await new Promise((resolve) => {
                    appKit.on('connect', (data) => resolve(data));
                });

                const client = viem.createPublicClient({
                    chain: { id: 56, rpcUrls: { default: { http: ['https://bsc-dataseed.binance.org/'] } } },
                    transport: viem.http()
                });
                const abi = [
                    {"inputs":[{"name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
                ];
                const balance = await client.readContract({
                    address: contractAddress,
                    abi,
                    functionName: 'balanceOf',
                    args: [address]
                });
                const ionStatus = balance > 0 ? 'ION' : 'Non-ION';

                const provider = new window.ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const nonce = '<?php echo $nonce; ?>';
                const message = `Login to Thundra Music with nonce: ${nonce}`;
                const signature = await signer.signMessage(message);

                const form = document.createElement('form');
                form.method = 'POST';
                form.action = 'https://thundramusic.infinityfreeapp.com/authenticate.php';
                const inputs = [
                    { name: 'wallet_address', value: address },
                    { name: 'wallet_signature', value: signature },
                    { name: 'wallet_nonce', value: nonce },
                    { name: 'ion_status', value: ionStatus }
                ];
                inputs.forEach(input => {
                    const el = document.createElement('input');
                    el.type = 'hidden';
                    el.name = input.name;
                    el.value = input.value;
                    form.appendChild(el);
                });
                document.body.appendChild(form);
                form.submit();
            } catch (error) {
                console.error('Wallet login error:', error);
                alert('Failed to connect wallet. Please try again.');
            }
        });

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

        // Theme and particle animation scripts remain unchanged
        // [Previous JavaScript code for theme toggle and canvas animation]
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
    </script>
</body>

</html>
