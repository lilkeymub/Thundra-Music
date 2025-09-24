```php
<?php
// Start session
session_start();

// Unset all session variables
$_SESSION = [];

// Destroy the session
session_destroy();

// Clear "Remember Me" cookies if they exist
if (isset($_COOKIE['remember_token']) || isset($_COOKIE['remember_user'])) {
    setcookie('remember_token', '', time() - 3600, '/');
    setcookie('remember_user', '', time() - 3600, '/');
}

// Redirect to login page
header('Location: login.php');
exit();
?>
```