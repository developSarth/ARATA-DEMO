const SUPABASE_URL = 'https://kzjvawxuubhhvodhmppt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6anZhd3h1dWJoaHZvZGhtcHB0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjM3OTI2OCwiZXhwIjoyMDk3OTU1MjY4fQ.hIKjM2Op_bJBC6mM57vnQ9alpU54d5IR2BJ9mRCziE8';

async function testSelect() {
  console.log('=== Testing SELECT on escalations ===');
  const res = await fetch(SUPABASE_URL + '/rest/v1/escalations?select=*', {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY
    }
  });
  console.log('Status:', res.status, res.statusText);
  const body = await res.text();
  console.log('Body:', body);
}

async function testInsert() {
  console.log('\n=== Testing INSERT into escalations ===');
  const row = {
    conversation_id: 'test_' + Date.now(),
    status: 'escalated',
    user_name: 'Test User',
    user_email: 'test@example.com',
    chat_history: '[]',
    last_user_message: 'I need help',
    brand: 'Arata'
  };
  const res = await fetch(SUPABASE_URL + '/rest/v1/escalations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(row)
  });
  console.log('Status:', res.status, res.statusText);
  const body = await res.text();
  console.log('Body:', body);
}

async function testAgentRepliesSelect() {
  console.log('\n=== Testing SELECT on agent_replies ===');
  const res = await fetch(SUPABASE_URL + '/rest/v1/agent_replies?select=*', {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY
    }
  });
  console.log('Status:', res.status, res.statusText);
  const body = await res.text();
  console.log('Body:', body);
}

(async () => {
  await testSelect();
  await testInsert();
  await testAgentRepliesSelect();
})();
