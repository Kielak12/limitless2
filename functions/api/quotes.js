import { json, isAuthed } from './_utils.js';

export async function onRequestGet(context){
  const { request, env } = context;
  if(!isAuthed(request)) return new Response('Unauthorized', {status: 401});
  if(!env.DB) return new Response('DB binding not configured', {status: 500});
  await ensureSchema(env);
  const { results } = await env.DB.prepare('SELECT id, created_at, data FROM quotes ORDER BY id DESC').all();
  const rows = results.map(r=>({ id: r.id, created_at: r.created_at, data: safeJson(r.data) }));
  return json(rows);
}

export async function onRequestPost(context){
  const { request, env } = context;
  if(!env.DB) return new Response('DB binding not configured', {status: 500});
  await ensureSchema(env);
  let payload;
  try{
    payload = await request.json();
  }catch(e){
    return new Response('Invalid JSON', {status: 400});
  }
  const data = JSON.stringify(payload);
  const stmt = env.DB.prepare('INSERT INTO quotes (data) VALUES (?1) RETURNING id, created_at');
  const { results } = await stmt.bind(data).all();
  const row = results && results[0];
  return json({ ok: true, id: row?.id, created_at: row?.created_at });
}

function safeJson(txt){
  try{ return JSON.parse(txt); } catch(e){ return {raw: txt}; }
}

async function ensureSchema(env){
  await env.DB.exec(`CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    data TEXT NOT NULL
  );`);
}
