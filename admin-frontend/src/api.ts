const API_KEY = import.meta.env.VITE_ADMIN_API_KEY;

export async function listConversations() {
  const res = await fetch('/admin/conversations', { headers: { 'x-api-key': API_KEY } });
  return res.json();
}

export async function getConversation(id: string) {
  const res = await fetch(`/admin/conversations/${id}`, { headers: { 'x-api-key': API_KEY } });
  return res.json();
}

export async function createCheckout() {
  const res = await fetch('/admin/pay', { headers: { 'x-api-key': API_KEY } });
  const url = await res.text();
  window.location.href = url;
}
