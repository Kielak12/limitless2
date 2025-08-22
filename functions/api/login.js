import { json } from './_utils.js';

export async function onRequestPost(context){
  const { request } = context;
  let body = {};
  try{ body = await request.json(); }catch(e){}
  const { login, password } = body;
  if(login === '123' && password === '123'){
    const headers = new Headers();
    headers.append('set-cookie', `session=ok; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`);
    return json({ ok: true }, { headers });
  }
  return new Response('Unauthorized', {status: 401});
}
