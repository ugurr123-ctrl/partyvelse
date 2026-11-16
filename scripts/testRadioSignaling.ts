import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { Client } from 'colyseus.js';
import { LostSignalRoom } from '../server/LostSignalRoom';

const httpServer = http.createServer();
const server = new Server({ transport: new WebSocketTransport({ server: httpServer }) });
server.define('lost_signal', LostSignalRoom).filterBy(['roomCode']);
httpServer.listen(0);
await once(httpServer, 'listening');
const address = httpServer.address();
assert(address && typeof address === 'object');
const client = () => new Client('ws://127.0.0.1:' + address.port);
const listen = (room: Awaited<ReturnType<Client['create']>>, type: string) => {
  const messages: any[] = [];
  room.onMessage(type, (message) => messages.push(message));
  return messages;
};
const settle = () => new Promise((resolve) => setTimeout(resolve, 100));

try {
  const host = await client().create('lost_signal', { roomCode: 'KYP-RAD1', playerName: 'Host' });
  host.onMessage('state_update', () => {});
  const guest = await client().joinById(host.roomId, { playerName: 'Guest' });
  guest.onMessage('state_update', () => {});
  const outsider = await client().create('lost_signal', { roomCode: 'KYP-RAD2', playerName: 'Other' });
  outsider.onMessage('state_update', () => {});
  const hostSignals = listen(host, 'radio_signal');
  const guestSignals = listen(guest, 'radio_signal');
  const outsideSignals = listen(outsider, 'radio_signal');
  listen(host, 'radio_transmission');
  const clips = listen(guest, 'radio_transmission');

  host.send('radio_signal', { kind: 'hello', channel: '142.85', from: 'ignored' });
  await settle();
  assert.deepEqual(guestSignals.shift(), { kind: 'hello', channel: '142.85', from: host.sessionId });
  assert.equal(hostSignals.length, 0);
  assert.equal(outsideSignals.length, 0);

  const description = { type: 'offer', sdp: 'v=0\r\n' };
  host.send('radio_signal', { kind: 'offer', channel: '142.85', to: guest.sessionId, description });
  guest.send('radio_signal', { kind: 'ready', channel: '142.85', to: host.sessionId, ready: true });
  host.send('radio_signal', { kind: 'offer', channel: '142.85', to: outsider.sessionId, description });
  host.send('radio_signal', { kind: 'offer', channel: '142.85', to: guest.sessionId, description: { type: 'answer', sdp: 'invalid' } });
  host.send('radio_transmission', { id: 'fallback-clip', isVoice: true, audioDataUrl: 'data:audio/webm;base64,AA==' });
  await settle();
  assert.deepEqual(guestSignals, [{ kind: 'offer', channel: '142.85', from: host.sessionId, description }]);
  assert.deepEqual(hostSignals, [{ kind: 'ready', channel: '142.85', from: guest.sessionId, ready: true }]);
  assert.equal(outsideSignals.length, 0);
  assert.equal(clips[0]?.id, 'fallback-clip');
  console.log('Radio signaling, room isolation, validation, and clip fallback passed.');
  await Promise.all([host.leave(), guest.leave(), outsider.leave()]);
} finally {
  await server.gracefullyShutdown(false);
}
