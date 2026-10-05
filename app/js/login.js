// Handles login, account creation, and their form states.
import { signUpUser, signInUser, getCurrentSession } from './authService.js';
import { getRememberMe, setRememberMe } from './supabaseClient.js';

// HTML file to go to after login
const AFTER_LOGIN = 'home.html';

// Elements
const $ = (id) => document.getElementById(id); // Shorthand for getElementById
const form = $('form');
const msg = $('msg');
const submitBtn = $('submit');
const rememberMe = $('remember-me');
let mode = 'login';
rememberMe.checked = getRememberMe();

// Displays validation, progress, and authentication messages.
function showMessage(text, type = '') {
  msg.textContent = text;
  msg.className = 'msg ' + type;
}

// Handles switching modes such as tabs
function setMode(next) {
  mode = next;
  const signup = mode === 'signup';
  $('tab-login').setAttribute('aria-selected', String(!signup));
  $('tab-signup').setAttribute('aria-selected', String(signup));
  $('name-fields').hidden = !signup;
  $('pw-hint').hidden = !signup;
  $('password').autocomplete = signup ? 'new-password' : 'current-password';
  $('title').textContent = signup ? 'Create your account' : 'Welcome back';
  $('sub').textContent = signup
    ? 'Start tracking your health in a minute.'
    : 'Log in to see your health data.';
  submitBtn.textContent = signup ? 'Create account' : 'Log in';
  showMessage('');
}

// Tab Button event listeners
$('tab-login').addEventListener('click', () => setMode('login'));
$('tab-signup').addEventListener('click', () => setMode('signup'));
rememberMe.addEventListener('change', () => {
  try {
    setRememberMe(rememberMe.checked);
  } catch (error) {
    rememberMe.checked = !rememberMe.checked;
    showMessage(error.message || 'Could not update the session preference.', 'error');
  }
});

// Skip the form and go to the next page if the user is already logged in
try {
  const { session } = await getCurrentSession();
  if (session) window.location.replace(AFTER_LOGIN);
} catch (e) {
  // Stay on the login page
}

// Submit button
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  // Collect values
  const email = $('email').value.trim();
  const password = $('password').value;
  const firstName = $('firstName').value.trim();
  const lastName = $('lastName').value.trim();

  // Error checks
  if (!email || !password) {
    return showMessage('Enter your email and password.', 'error');
  }
  if (mode === 'signup') {
    if (!firstName || !lastName) {
      return showMessage('Enter your first and last name.', 'error');
    }
    if (password.length < 8) {
      return showMessage('Your password needs at least 8 characters.', 'error');
    }
  }

  submitBtn.disabled = true;
  showMessage(mode === 'signup' ? 'Creating your account…' : 'Logging in…');

  // Call backend functions
  try {
    if (mode === 'signup') {
      const { data, error } = await signUpUser(email, password, firstName, lastName);
      if (error) throw error;
      if (data.session) {
        window.location.replace(AFTER_LOGIN);
      } else {
        // No session yet, so they need to confirm their email before logging in.
        setMode('login');
        showMessage('Account created. Check your email to confirm it, then log in.', 'ok');
      }
    } else {
      const { error } = await signInUser(email, password);
      if (error) throw error;
      window.location.replace(AFTER_LOGIN);
    }
  } catch (err) {
    showMessage(err.message || 'Something went wrong. Try again.', 'error');
  } finally {
    submitBtn.disabled = false;
  }
});
