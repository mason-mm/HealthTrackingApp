// Loads safe account details and handles home-page testing actions.
import { getCurrentSession, signOutUser } from './authService.js';

const $ = (id) => document.getElementById(id);
const pageStatus = $('page-status');
const refreshButton = $('refresh-account');
const signOutButton = $('sign-out');
let currentUserId = '';

// Updates the page's accessible status message.
function setStatus(message, kind = '') {
  pageStatus.textContent = message;
  pageStatus.dataset.kind = kind;
}

// Shows a readable fallback when account fields are empty.
function setValue(id, value) {
  $(id).textContent = value === null || value === undefined || value === ''
    ? 'Not set'
    : String(value);
}

// Formats Supabase timestamps for both local and UTC reference.
function formatTimestamp(value) {
  if (!value) return 'Not set';
  const date = typeof value === 'number' ? new Date(value * 1000) : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return `${date.toLocaleString()} (${date.toISOString()})`;
}

// Removes sensitive values before account data is shown on the page.
function redactSecrets(value) {
  if (Array.isArray(value)) return value.map(redactSecrets);
  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(Object.entries(value).map(([key, item]) => {
    if (/token|secret|password|credential|api[_-]?key/i.test(key)) {
      return [key, '[hidden]'];
    }
    return [key, redactSecrets(item)];
  }));
}

// Fills the account overview and safe session details.
function showAccount(session) {
  const user = session.user;
  if (!user) throw new Error('The current session has no account details.');

  const metadata = user.user_metadata || {};
  const fullName = [metadata.first_name, metadata.last_name].filter(Boolean).join(' ')
    || metadata.full_name
    || metadata.name
    || user.email
    || 'Account holder';
  const identities = Array.isArray(user.identities) ? user.identities : [];
  const providers = user.app_metadata?.providers?.length
    ? user.app_metadata.providers
    : [...new Set(identities.map((identity) => identity.provider).filter(Boolean))];

  currentUserId = user.id || '';
  $('account-name').textContent = fullName;
  $('account-email').textContent = user.email || 'No email address';
  setValue('user-id', user.id);
  setValue('user-email', user.email);
  setValue('email-confirmed', formatTimestamp(user.email_confirmed_at));
  setValue('user-phone', user.phone);
  setValue('phone-confirmed', formatTimestamp(user.phone_confirmed_at));
  setValue('user-role', [user.role, user.aud].filter(Boolean).join(' / '));
  setValue('user-providers', providers.length ? providers.join(', ') : 'Not set');
  setValue('created-at', formatTimestamp(user.created_at));
  setValue('updated-at', formatTimestamp(user.updated_at));
  setValue('last-sign-in', formatTimestamp(user.last_sign_in_at));
  setValue('is-anonymous', typeof user.is_anonymous === 'boolean'
    ? (user.is_anonymous ? 'Yes' : 'No')
    : 'Not set');

  $('user-record').textContent = JSON.stringify(redactSecrets(user), null, 2);
  $('session-record').textContent = JSON.stringify({
    expires_at: session.expires_at ? formatTimestamp(session.expires_at) : 'Not set',
    expires_in: session.expires_in ?? 'Not set',
    token_type: session.token_type ?? 'Not set',
    access_token: '[hidden]',
    refresh_token: '[hidden]'
  }, null, 2);
}

// Verifies the active session and refreshes the account view.
async function loadAccount() {
  refreshButton.disabled = true;
  setStatus('Loading account details...');

  try {
    // Copies the account identifier for test and support workflows.
    const { session } = await getCurrentSession();
    if (!session) {
      window.location.replace('login.html');
      return;
    }

    showAccount(session);
    setStatus('Account details are up to date.');
  } catch (error) {
    setStatus(error.message || 'Could not load account details.', 'error');
  } finally {
    refreshButton.disabled = false;
  }
}

refreshButton.addEventListener('click', loadAccount);

$('copy-user-id').addEventListener('click', async () => {
  if (!currentUserId) return;

  try {
    await navigator.clipboard.writeText(currentUserId);
    setStatus('User ID copied.');
  } catch {
    setStatus('Could not copy the user ID from this browser.', 'error');
  }
});

// Signs out and returns to the login page.
signOutButton.addEventListener('click', async () => {
  signOutButton.disabled = true;
  setStatus('Ending session...');

  try {
    const { error } = await signOutUser();
    if (error) throw error;
    window.location.replace('login.html');
  } catch (error) {
    setStatus(error.message || 'Could not end the session. Try again.', 'error');
    signOutButton.disabled = false;
  }
});

loadAccount();