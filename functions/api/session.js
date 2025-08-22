import { json, isAuthed } from './_utils.js';
export async function onRequestGet({request}){
  return json({ authenticated: isAuthed(request) });
}
