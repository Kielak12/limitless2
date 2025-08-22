export function json(data, init={}){
  const headers = new Headers(init.headers || {});
  headers.set('content-type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(data), {...init, headers});
}
export function parseCookies(req){
  const header = req.headers.get('cookie') || '';
  const out = {};
  header.split(';').forEach(v=>{
    const i = v.indexOf('=');
    if(i>0) out[v.slice(0,i).trim()] = decodeURIComponent(v.slice(i+1));
  });
  return out;
}
export function isAuthed(request){
  const cookies = parseCookies(request);
  return cookies.session === 'ok';
}
