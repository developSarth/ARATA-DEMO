// ═══════════════════════════════════════
// Nodewave Helpdesk — Auth Module (auth.js)
// Separated for security & modularity
// ═══════════════════════════════════════

const SUPABASE_URL = 'https://kzjvawxuubhhvodhmppt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6anZhd3h1dWJoaHZvZGhtcHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzNzkyNjgsImV4cCI6MjA5Nzk1NTI2OH0.wtJmml3Yi1BY-imqG4T7-NPe2DQALhbAFTcJJxvcaiM';

// Initialize Supabase Client (uses anon key — security enforced via RLS + JWT)
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── SDK-based data helpers (uses authenticated JWT automatically) ───

async function dbSelect(table, columns = '*', filters = {}, orderBy = null) {
  try {
    let query = supabaseClient.from(table).select(columns);
    
    // Apply filters
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }
    
    // Apply ordering
    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending !== false });
    }
    
    const { data, error } = await query;
    if (error) { console.error('[NW-DB] Select error:', error.message); return []; }
    return data || [];
  } catch (err) { console.error('[NW-DB] Select failed:', err); return []; }
}

async function dbInsert(table, row) {
  try {
    const { data, error } = await supabaseClient.from(table).insert(row).select();
    if (error) { console.error('[NW-DB] Insert error:', error.message); return null; }
    return data;
  } catch (err) { console.error('[NW-DB] Insert failed:', err); return null; }
}

async function dbUpdate(table, matchColumn, matchValue, updateData) {
  try {
    const { data, error } = await supabaseClient.from(table).update(updateData).eq(matchColumn, matchValue).select();
    if (error) { console.error('[NW-DB] Update error:', error.message); return null; }
    return data;
  } catch (err) { console.error('[NW-DB] Update failed:', err); return null; }
}

async function dbUpsert(table, row) {
  try {
    const { data, error } = await supabaseClient.from(table).upsert(row).select();
    if (error) { console.error('[NW-DB] Upsert error:', error.message); return null; }
    return data;
  } catch (err) { console.error('[NW-DB] Upsert failed:', err); return null; }
}

async function dbDelete(table, matchColumn, matchValue) {
  try {
    const { error } = await supabaseClient.from(table).delete().eq(matchColumn, matchValue);
    if (error) { console.error('[NW-DB] Delete error:', error.message); return false; }
    return true;
  } catch (err) { console.error('[NW-DB] Delete failed:', err); return false; }
}

// ─── Auth Functions ───

window.signInWithGoogle = async function() {
  await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/chatwoot-helpdesk-rec/Helpdesk-Final.html'
    }
  });
};

window.signInWithEmail = async function() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const btn = document.getElementById('btn-email-login');
  
  hideAuthMessages();
  if (!email || !password) { showAuthError('Please enter both email and password.'); return; }
  
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[18px] mr-2">progress_activity</span> Signing in...'; }
  
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  
  if (error) {
    showAuthError(error.message);
    if (btn) { btn.disabled = false; btn.textContent = 'Sign In with Email'; }
  }
  // If successful, onAuthStateChange in helpdesk.js will trigger checkAuth() automatically
};

window.registerWithEmail = async function() {
  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  const btn = document.getElementById('btn-register');

  hideAuthMessages();
  if (!name || !email || !password) { showAuthError('Please fill in all fields.'); return; }
  if (password.length < 6) { showAuthError('Password must be at least 6 characters.'); return; }

  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[18px] mr-2">progress_activity</span> Creating account...'; }

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name }
    }
  });

  if (error) {
    showAuthError(error.message);
    if (btn) { btn.disabled = false; btn.textContent = 'Create Account'; }
  } else {
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      showAuthError('An account with this email already exists.');
      if (btn) { btn.disabled = false; btn.textContent = 'Create Account'; }
    } else if (!data.session) {
      // Email confirmation (OTP) required
      showAuthSuccess('OTP sent to ' + email);
      document.getElementById('register-step-details').classList.add('hidden');
      document.getElementById('register-step-otp').classList.remove('hidden');
      if (btn) { btn.disabled = false; btn.textContent = 'Create Account'; }
    }
    // If data.session exists, onAuthStateChange will trigger checkAuth() automatically
  }
};

window.verifyOtp = async function() {
  const email = document.getElementById('register-email').value.trim();
  const code = document.getElementById('otp-code').value.trim();
  const btn = document.getElementById('btn-verify-otp');

  hideAuthMessages();
  if (!code || code.length < 8) { showAuthError('Please enter the 8-digit OTP.'); return; }
  if (!email) { showAuthError('Email missing. Please go back and re-enter your details.'); return; }

  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[18px] mr-2">progress_activity</span> Verifying...'; }

  const { data, error } = await supabaseClient.auth.verifyOtp({
    email: email,
    token: code,
    type: 'signup'
  });

  if (error) {
    showAuthError(error.message);
    if (btn) { btn.disabled = false; btn.textContent = 'Verify & Create Account'; }
  }
  // If successful, onAuthStateChange in helpdesk.js will trigger checkAuth() automatically
};

window.signOut = async function() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    await dbUpdate('agents', 'id', session.user.id, { status: 'offline' });
  }
  await supabaseClient.auth.signOut();
  window.location.reload();
};
