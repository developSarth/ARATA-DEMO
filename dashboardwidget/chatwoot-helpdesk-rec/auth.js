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
      redirectTo: window.location.href
    }
  });
};

window.signInWithEmail = async function() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const btn = document.getElementById('btn-email-login');
  
  hideAuthMessages();
  if (!email || !password) { showAuthError('Please enter both email and password.'); return; }
  
  if (btn) { btn.disabled = true; btn.textContent = 'Signing in\u2026'; }
  
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  
  if (error) {
    showAuthError(error.message);
    if (btn) { btn.disabled = false; btn.textContent = 'Sign In with Email'; }
  }
  // If successful, onAuthStateChange in helpdesk.js will trigger checkAuth() automatically
};

// §5 — Registration removed for security (agents are invited via Supabase Admin).
// registerWithEmail() and verifyOtp() have been intentionally deleted.
// New agents are added via Supabase Dashboard → Authentication → Users → Invite.

window.signOut = async function() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    await dbUpdate('agents', 'id', session.user.id, { status: 'offline' });
  }
  await supabaseClient.auth.signOut();
  window.location.reload();
};
