import assert from 'node:assert/strict';
import { Client } from 'colyseus.js';

const endpoint = process.argv[2];
const client = new Client(endpoint);
const roomCode = 'DP-' + Math.random().toString(36).slice(2, 6).toUpperCase();
const owner = await client.create('lost_signal', { roomCode, playerName: 'Yayın kontrolü A', operationTheme: 'derin_basinc' });
try {
  owner.onMessage('state_update', () => {});
  owner.onMessage('radio_signal', () => {});
  const guest = await new Client(endpoint).joinById(owner.roomId, { playerName: 'Yayın kontrolü B' });
  try {
    guest.onMessage('state_update', () => {});
    assert.equal(guest.roomId, owner.roomId);
    assert.notEqual(guest.sessionId, owner.sessionId);
    console.log('Two distinct players connected to the same room over TLS.');
  } finally {
    await guest.leave();
  }
} finally {
  await owner.leave();
}
