export async function onRequestPost(context){
  const headers = new Headers();
  headers.append('set-cookie', `session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  return new Response('ok', { headers });
}
