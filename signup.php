<?php
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');
error_reporting(E_ALL);

ini_set('memory_limit', '256M');
ini_set('max_execution_time', 60);

if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === 'off') {
    header('Location: https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
    exit();
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (isset($_SESSION['username'])) {
    header('Location: https://thundramusic.infinityfreeapp.com/dashboard.php');
    exit();
}

define('STYTCH_PROJECT_ID', '');
define('STYTCH_SECRET', '');
define('STYTCH_PUBLIC_TOKEN', '');
define('WALLET_CONNECT_PROJECT_ID', '');
define('CONTRACT_ADDRESS', '');

// Database connection
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

$errors = [];
$success = "";
$adminUsernames = ['isaackan', 'lilkey\'s', 'suspect44', 'jedida', 'loic', 'loïc'];

if (isset($_GET['google_signup'])) {
    $redirect_uri = urlencode('https://thundramusic.infinityfreeapp.com/authenticate.php');
    $google_oauth_url = "https://api.stytch.com/v1/public/oauth/google/start?public_token=" . STYTCH_PUBLIC_TOKEN . "&login_redirect_url=$redirect_uri&signup_redirect_url=$redirect_uri";
    header("Location: $google_oauth_url");
    exit();
}

if (isset($_GET['x_signup'])) {
    $redirect_uri = urlencode('https://thundramusic.infinityfreeapp.com/authenticate.php');
    $x_oauth_url = "https://api.stytch.com/v1/public/oauth/twitter/start?public_token=" . STYTCH_PUBLIC_TOKEN . "&login_redirect_url=$redirect_uri&signup_redirect_url=$redirect_uri";
    header("Location: $x_oauth_url");
    exit();
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $formUsername = trim($_POST['username']);
    $email = trim($_POST['email']);
    $formPassword = trim($_POST['password']);
    $requestedRole = $_POST['role'] ?? '';
    $consent = isset($_POST['consent']) ? true : false;

    $formUsernameLower = strtolower($formUsername);

    if (empty($formUsername)) {
        $errors[] = "Username is required.";
    }
    if (empty($email)) {
        $errors[] = "Email is required.";
    }
    if (empty($formPassword)) {
        $errors[] = "Password is required.";
    }
    if (!$consent) {
        $errors[] = "You must accept the Privacy Policy, Community Code of Conduct, and General User Conditions.";
    }

    if (empty($errors) && in_array($formUsernameLower, $adminUsernames)) {
        $errors[] = "This username is reserved.";
    }

    if (empty($errors)) {
        $stmt = $conn->prepare("SELECT COUNT(*) FROM users WHERE LOWER(Username) = ?");
        $stmt->bind_param("s", $formUsernameLower);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();

        if ($count > 0) {
            $errors[] = "Username already exists.";
        }
    }

    if (empty($errors)) {
        $hashedPassword = password_hash($formPassword, PASSWORD_DEFAULT);
        $tier = 'Free';
        $subscription = 'Free';
        $ion_status = 'Non-ION';

        $stmt = $conn->prepare("INSERT INTO users (Username, Email, Password, Tier, Subscription, ion_status) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssss", $formUsernameLower, $email, $hashedPassword, $tier, $subscription, $ion_status);
        if ($stmt->execute()) {
            if (!empty($requestedRole) && ($requestedRole === 'artist' || $requestedRole === 'moderator')) {
                $roleToRequest = ucfirst($requestedRole);
                $stmt = $conn->prepare("INSERT INTO role_requests (username, requested_role, status) VALUES (?, ?, 'Pending')");
                $stmt->bind_param("ss", $formUsernameLower, $roleToRequest);
                $stmt->execute();
                $stmt->close();
            }
            $success = "Registration successful! You can now <a href='login.php' class='text-red-600 hover:underline'>log in here</a>.";
        } else {
            $errors[] = "Failed to register user.";
        }
    }
}

$nonce = bin2hex(random_bytes(16));
$_SESSION['wallet_nonce'] = $nonce;

$conn->close();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thundra Music - Sign Up</title>
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
            input, select, button { @apply text-sm py-2; }
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
        <h1 class="text-3xl font-bold text-red-600 text-center">Sign Up</h1>
        <div class="max-w-md mx-auto mt-4 bg-gray-200 dark:bg-gray-800 p-6 rounded">
            <?php if (!empty($errors)): ?>
                <div class="mb-4">
                    <?php foreach ($errors as $error): ?>
                        <p class="error"><?php echo htmlspecialchars($error); ?></p>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
            <?php if (!empty($success)): ?>
                <p class="success"><?php echo $success; ?></p>
            <?php endif; ?>
            <?php if (isset($_GET['error'])): ?>
                <p class="error"><?php echo htmlspecialchars($_GET['error']); ?></p>
            <?php endif; ?>

            <form method="POST" action="https://thundramusic.infinityfreeapp.com/signup.php" onsubmit="return validateConsent()">
                <div class="mb-4">
                    <label class="block text-sm font-medium">Username</label>
                    <input type="text" name="username" value="<?php echo isset($formUsername) ? htmlspecialchars($formUsername) : ''; ?>" class="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-red-600 focus:border-red-600" placeholder="Enter your username">
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium">Email</label>
                    <input type="email" name="email" value="<?php echo isset($email) ? htmlspecialchars($email) : ''; ?>" class="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-red-600 focus:border-red-600" placeholder="Enter your email">
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium">Password</label>
                    <input type="password" name="password" class="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-red-600 focus:border-red-600" placeholder="Enter your password">
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium">Request Role (Optional)</label>
                    <select name="role" class="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-red-600 focus:border-red-600">
                        <option value="">None</option>
                        <option value="artist">Request to be an Independent Artist</option>
                        <option value="moderator">Request to be a Moderator</option>
                    </select>
                    <p class="text-sm mt-2">Requests are sent to the Admin for approval.</p>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium">
                        <input type="checkbox" name="consent" id="consent" class="mr-2"> I consent to the
                        <a href="https://thundramusic.infinityfreeapp.com/privacy.html" class="text-red-600 hover:underline">Privacy Policy</a>,
                        <a href="https://thundramusic.infinityfreeapp.com/conduct.html" class="text-red-600 hover:underline">Community Code of Conduct</a>,
                        <a href="https://thundramusic.infinityfreeapp.com/conditions.html" class="text-red-600 hover:underline">General User Terms & Conditions</a>, and
                        <a href="https://thundramusic.infinityfreeapp.com/legal.html" class="text-red-600 hover:underline">Legal & Guidelines</a>.
                    </label>
                    <p class="consent-error" id="consent-error">This field is required.</p>
                </div>
                <button type="submit" class="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"><i class="fas fa-user-plus mr-2"></i> Sign Up</button>
            </form>

            <div class="text-center my-4">
                <span class="text-sm font-semibold text-gray-500 dark:text-gray-400">OR</span>
            </div>
            <div class="mt-4 social-login-container">
                <a href="https://thundramusic.infinityfreeapp.com/signup.php?google_signup=1" class="social-btn" title="Sign up with Google">
                    <i class="fab fa-google"></i>
                </a>
                <a href="https://thundramusic.infinityfreeapp.com/signup.php?x_signup=1" class="social-btn" title="Sign up with X">
                    <i class="fab fa-x-twitter"></i>
                </a>
                <a href="#" id="wallet-signup-btn" class="social-btn" title="Sign up with Wallet">
                    <i class="fas fa-wallet"></i>
                </a>
                <a href="https://appleid.apple.com/" class="social-btn" title="Sign up with Apple">
                    <i class="fab fa-apple"></i>
                </a>
                <a href="https://www.facebook.com/login" class="social-btn" title="Sign up with Facebook">
                    <i class="fab fa-facebook-f"></i>
                </a>
            </div>
        </div>
        <div class="text-center mt-4">
            <p>Already have an account? <a href="https://thundramusic.infinityfreeapp.com/login.php" class="text-red-600 hover:underline">Login</a></p>
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
                    description: 'Thundra Music Web3 Signup',
                    url: 'https://thundramusic.infinityfreeapp.com',
                    icons: ['https://thundramusic.infinityfreeapp.com/THUNDRA MUSIC.png']
                },
                themeMode: 'light'
            });

            return { appKit, contractAddress };
        }

        document.getElementById('wallet-signup-btn').addEventListener('click', async (e) => {
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
                const message = `Sign up to Thundra Music with nonce: ${nonce}`;
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
                console.error('Wallet signup error:', error);
                alert('Failed to connect wallet. Please try again.');
            }
        });

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
