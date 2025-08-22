import { json } from './_utils.js';
export async function onRequestGet({ env }){
  const ok = !!env.DB;
  return json({ ok, binding: ok ? 'DB' : null });
}
