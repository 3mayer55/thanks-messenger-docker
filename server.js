const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const ROOM_PASSWORD = process.env.ROOM_PASSWORD || '';
const FILE = path.join(DATA_DIR, 'messages.json');
const MAX_HISTORY = 200;

let history = [];
try { fs.mkdirSync(DATA_DIR, { recursive: true }); history = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch (e) {}
const save = () => { try { fs.writeFileSync(FILE, JSON.stringify(history)); } catch (e) {} };

const server = http.createServer((req, res) => {
  if (req.url === '/health') { res.end('ok'); return; }
  fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, data) => {
    if (err) { res.writeHead(500); res.end('error'); return; }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });
});

const wss = new WebSocketServer({ server });
const clean = (s, n) => String(s || '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);

function broadcast(obj) {
  const msg = JSON.stringify(obj);
  for (const c of wss.clients) if (c.joined && c.readyState === 1) c.send(msg);
}
function online() { return [...wss.clients].filter(c => c.joined).map(c => c.name); }

wss.on('connection', (ws) => {
  ws.joined = false;
  ws.on('message', (raw) => {
    let m; try { m = JSON.parse(raw); } catch { return; }
    if (!ws.joined) {
      if (m.type !== 'join') return;
      if (ROOM_PASSWORD && m.password !== ROOM_PASSWORD) { ws.send(JSON.stringify({ type: 'denied' })); return; }
      ws.name = clean(m.name, 20) || 'Friend';
      ws.joined = true;
      ws.send(JSON.stringify({ type: 'history', messages: history }));
      broadcast({ type: 'presence', users: online() });
      return;
    }
    if (m.type === 'msg') {
      const text = clean(m.text, 1000);
      if (!text) return;
      const entry = { id: Date.now() + Math.random().toString(36).slice(2, 6), name: ws.name, text, kind: m.kind === 'thanks' ? 'thanks' : 'msg', ts: Date.now() };
      history.push(entry);
      if (history.length > MAX_HISTORY) history = history.slice(-MAX_HISTORY);
      save();
      broadcast({ type: 'msg', message: entry });
    }
  });
  ws.on('close', () => broadcast({ type: 'presence', users: online() }));
});

server.listen(PORT, () => console.log(`Thanks Messenger running on http://localhost:${PORT}`));
