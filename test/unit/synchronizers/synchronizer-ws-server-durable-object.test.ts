import {createMergeableStore} from 'tinybase';
import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
import {
  WsServerDurableObject,
  getWsServerDurableObjectFetch,
  type AuthContext,
} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object';
import {WsServerDurableObjectEnhanced} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object-enhanced';
import {beforeEach, describe, expect, test, vi} from 'vitest';
import {getTimeFunctions} from '../common/mergeable.ts';

const [reset, getNow] = getTimeFunctions();

class MockClientWebSocket {
  OPEN = 1;
  CLOSED = 3;
  readyState = this.OPEN;
  bufferedAmount = 0;
  protocol = '';
  peerServerWs?: MockServerWebSocket;
  readonly #listeners: {[event: string]: ((event: any) => void)[]} = {};

  addEventListener(event: string, listener: (event: any) => void): void {
    (this.#listeners[event] ??= []).push(listener);
    if (event === 'open') {
      setTimeout(() => listener({}), 0);
    }
  }

  removeEventListener(event: string, listener: (event: any) => void): void {
    this.#listeners[event] = (this.#listeners[event] ?? []).filter(
      (l) => l !== listener,
    );
  }

  send(payload: string): void {
    if (this.peerServerWs && this.peerServerWs.server) {
      setTimeout(() => {
        this.peerServerWs!.server!.webSocketMessage?.(
          this.peerServerWs! as any,
          payload,
        );
      }, 0);
    }
  }

  receive(data: string): void {
    (this.#listeners.message ?? []).forEach((listener) => listener({data}));
  }

  close(): void {
    this.readyState = this.CLOSED;
    if (this.peerServerWs && this.peerServerWs.server) {
      this.peerServerWs.server.webSocketClose?.(
        this.peerServerWs as any,
        1000,
        '',
        true,
      );
    }
    (this.#listeners.close ?? []).forEach((listener) => listener({}));
  }
}

class MockServerWebSocket {
  OPEN = 1;
  CLOSED = 3;
  readyState = this.OPEN;
  peerClientWs?: MockClientWebSocket;
  server?: any;

  send(payload: string): void {
    if (this.peerClientWs) {
      setTimeout(() => {
        this.peerClientWs!.receive(payload);
      }, 0);
    }
  }

  close(): void {
    this.readyState = this.CLOSED;
  }
}

class MockWebSocketPair {
  0: MockClientWebSocket;
  1: MockServerWebSocket;
  constructor() {
    this[0] = new MockClientWebSocket();
    this[1] = new MockServerWebSocket();
    this[0].peerServerWs = this[1];
    this[1].peerClientWs = this[0];
  }
}

class MockDurableObjectState {
  webSockets = new Map<any, string[]>();

  blockConcurrencyWhile(fn: () => Promise<void>) {
    return fn();
  }

  acceptWebSocket(ws: any, tags: string[]) {
    this.webSockets.set(ws, tags);
  }

  getTags(ws: any): string[] {
    return this.webSockets.get(ws) ?? [];
  }

  getWebSockets(tag?: string): any[] {
    const list: any[] = [];
    for (const [ws, tags] of this.webSockets.entries()) {
      if (!tag || tags.includes(tag)) {
        list.push(ws);
      }
    }
    return list;
  }
}

// Register global WebSocketPair for the mock Durable Object environment
(globalThis as any).WebSocketPair = MockWebSocketPair;

const createMockRequest = (
  url: string,
  key = 'test-client-key-1',
  isWebSocket = true,
): Request => {
  const req = new Request(url);
  const headerMap: Record<string, string> = {};
  if (isWebSocket) {
    headerMap['upgrade'] = 'websocket';
    headerMap['sec-websocket-key'] = key;
  }
  Object.defineProperty(req, 'headers', {
    value: {
      get: (name: string) => headerMap[name.toLowerCase()] ?? null,
    },
    configurable: true,
  });
  return req;
};

const pause = (ms = 50) => new Promise((resolve) => setTimeout(resolve, ms));

beforeEach(() => {
  reset();
});

describe('WsServerDurableObject Authentication & Room Boundaries', () => {
  class AuthenticatedServer extends WsServerDurableObject {
    override async onAuthenticate(
      request: Request,
      pathId: string,
    ): Promise<AuthContext | boolean | null | Response> {
      const url = new URL(request.url);
      const token = url.searchParams.get('token');
      if (!token) {
        return null; // 401
      }
      if (token === 'invalid-token') {
        return false; // 401
      }
      if (token === 'forbidden-token') {
        return new Response('Forbidden', {status: 403});
      }

      // Room-based authorization:
      // alice-token can only access rooms prefixed with 'alice-' or 'shared-'
      // bob-token can only access rooms prefixed with 'bob-' or 'shared-'
      if (token === 'alice-token') {
        if (pathId.includes('alice-') || pathId.includes('shared-')) {
          return {userId: 'alice', role: 'member'};
        }
        return new Response('Forbidden: cannot access other users room', {
          status: 403,
        });
      }
      if (token === 'bob-token') {
        if (pathId.includes('bob-') || pathId.includes('shared-')) {
          return {userId: 'bob', role: 'member'};
        }
        return new Response('Forbidden: cannot access other users room', {
          status: 403,
        });
      }

      return null;
    }
  }

  test('Rejects non-WebSocket upgrade requests with 426', async () => {
    const state = new MockDurableObjectState();
    const server = new AuthenticatedServer(state as any, {});
    const req = createMockRequest('https://example.com/room/1', 'key', false);
    const res = await server.fetch(req);
    expect(res.status).toBe(426);
  });

  test('Rejects requests with missing or invalid token with 401', async () => {
    const state = new MockDurableObjectState();
    const server = new AuthenticatedServer(state as any, {});

    // Missing token
    const reqNoToken = createMockRequest('https://example.com/room/alice-1');
    const resNoToken = await server.fetch(reqNoToken);
    expect(resNoToken.status).toBe(401);

    // Invalid token
    const reqInvalid = createMockRequest(
      'https://example.com/room/alice-1?token=invalid-token',
    );
    const resInvalid = await server.fetch(reqInvalid);
    expect(resInvalid.status).toBe(401);
  });

  test('Rejects unauthorized room access with 403', async () => {
    const state = new MockDurableObjectState();
    const server = new AuthenticatedServer(state as any, {});

    // Bob trying to enter Alice's private room
    const reqBob = createMockRequest(
      'https://example.com/room/alice-private?token=bob-token',
    );
    const resBob = await server.fetch(reqBob);
    expect(resBob.status).toBe(403);
  });

  test('Accepts authorized connection and tags WebSocket with userId', async () => {
    const state = new MockDurableObjectState();
    const server = new AuthenticatedServer(state as any, {});

    const reqAlice = createMockRequest(
      'https://example.com/alice-private?token=alice-token',
      'alice-client-1',
    );
    const resAlice = await server.fetch(reqAlice);
    expect(resAlice.status).toBe(101);

    // Verify WebSocket tags in state
    const clients = state.getWebSockets();
    expect(clients.length).toBe(1);
    const serverWs = clients[0];
    const tags = state.getTags(serverWs);
    expect(tags).toEqual(['alice-client-1', 'alice-private', 'alice']);

    // Verify helper methods
    expect(server.getUserId(serverWs)).toBe('alice');
    expect(server.getUserClients('alice')).toEqual([serverWs]);
    expect(server.getUserClients('bob')).toEqual([]);
  });

  test('Default WsServerDurableObject allows connections if not overridden', async () => {
    const state = new MockDurableObjectState();
    const server = new WsServerDurableObject(state as any, {});
    const req = createMockRequest(
      'https://example.com/public-1',
      'anon-client',
    );
    const res = await server.fetch(req);
    expect(res.status).toBe(101);

    const clients = state.getWebSockets();
    expect(clients.length).toBe(1);
    expect(state.getTags(clients[0])).toEqual(['anon-client', 'public-1']);
  });

  test('getWsServerDurableObjectFetch delegates to durable object', async () => {
    const state = new MockDurableObjectState();
    const server = new AuthenticatedServer(state as any, {});
    const env = {
      Rooms: {
        idFromName: (name: string) => name,
        get: (_id: any) => server,
      } as any,
    };
    const handler = getWsServerDurableObjectFetch('Rooms');

    const req = createMockRequest(
      'https://example.com/room/alice-1?token=alice-token',
      'client-key',
    );
    const res = await handler(req, env);
    expect(res.status).toBe(101);
  });
});

describe('CRDT Merkle Tree Convergence', () => {
  test('Two clients synchronize and achieve identical tablesHash and valuesHash', async () => {
    const state = new MockDurableObjectState();
    const server = new WsServerDurableObject(state as any, {});

    // Client 1 connects
    const req1 = createMockRequest(
      'https://example.com/room/collab',
      'client-1',
    );
    const res1 = await server.fetch(req1);
    expect(res1.status).toBe(101);
    const serverWs1 = state.getWebSockets()[0] as MockServerWebSocket;
    serverWs1.server = server;
    const clientWs1 = (res1 as any).webSocket as MockClientWebSocket;

    const store1 = createMergeableStore('store1', getNow);
    const syncer1 = await createWsSynchronizer(store1, clientWs1 as any);
    await syncer1.startSync();

    // Client 2 connects
    const req2 = createMockRequest(
      'https://example.com/room/collab',
      'client-2',
    );
    const res2 = await server.fetch(req2);
    expect(res2.status).toBe(101);
    const serverWs2 = state.getWebSockets()[1] as MockServerWebSocket;
    serverWs2.server = server;
    const clientWs2 = (res2 as any).webSocket as MockClientWebSocket;

    const store2 = createMergeableStore('store2', getNow);
    const syncer2 = await createWsSynchronizer(store2, clientWs2 as any);
    await syncer2.startSync();

    await pause(50);

    // Client 1 writes data
    store1.setCell('tasks', 'task1', 'title', 'Build TinyBase sync');
    store1.setCell('tasks', 'task1', 'done', false);
    store1.setValue('status', 'in-progress');

    await pause(100);

    // Client 2 should receive the mutation
    expect(store2.getCell('tasks', 'task1', 'title')).toBe(
      'Build TinyBase sync',
    );
    expect(store2.getCell('tasks', 'task1', 'done')).toBe(false);
    expect(store2.getValue('status')).toBe('in-progress');

    // VERIFICATION: Merkle tree convergence (tablesHash and valuesHash equality)
    const [tablesHash1, valuesHash1] = store1.getMergeableContentHashes();
    const [tablesHash2, valuesHash2] = store2.getMergeableContentHashes();

    expect(tablesHash1).toBeDefined();
    expect(tablesHash1).toBe(tablesHash2);
    expect(valuesHash1).toBeDefined();
    expect(valuesHash1).toBe(valuesHash2);

    // Client 2 updates data
    store2.setCell('tasks', 'task1', 'done', true);
    store2.setCell('tasks', 'task2', 'title', 'Automated tests');
    store2.setValue('status', 'completed');

    await pause(100);

    expect(store1.getCell('tasks', 'task1', 'done')).toBe(true);
    expect(store1.getCell('tasks', 'task2', 'title')).toBe('Automated tests');
    expect(store1.getValue('status')).toBe('completed');

    // Both stores still match hashes perfectly
    const [tablesHash1After, valuesHash1After] =
      store1.getMergeableContentHashes();
    const [tablesHash2After, valuesHash2After] =
      store2.getMergeableContentHashes();

    expect(tablesHash1After).toBe(tablesHash2After);
    expect(valuesHash1After).toBe(valuesHash2After);

    syncer1.destroy();
    syncer2.destroy();
    clientWs1.close();
    clientWs2.close();
  });

  test('Partitioned stores in separate rooms do not leak data or diverge', async () => {
    // Room 1: Alice's room
    const stateAlice = new MockDurableObjectState();
    const serverAlice = new WsServerDurableObject(stateAlice as any, {});

    // Room 2: Bob's room
    const stateBob = new MockDurableObjectState();
    const serverBob = new WsServerDurableObject(stateBob as any, {});

    // Alice connects to her room
    const resAlice = await serverAlice.fetch(
      createMockRequest('https://example.com/room/alice', 'alice-client'),
    );
    const serverWsAlice = stateAlice.getWebSockets()[0] as MockServerWebSocket;
    serverWsAlice.server = serverAlice;
    const clientWsAlice = (resAlice as any).webSocket as MockClientWebSocket;

    const storeAlice = createMergeableStore('aliceStore', getNow);
    const syncerAlice = await createWsSynchronizer(
      storeAlice,
      clientWsAlice as any,
    );
    await syncerAlice.startSync();

    // Bob connects to his room
    const resBob = await serverBob.fetch(
      createMockRequest('https://example.com/room/bob', 'bob-client'),
    );
    const serverWsBob = stateBob.getWebSockets()[0] as MockServerWebSocket;
    serverWsBob.server = serverBob;
    const clientWsBob = (resBob as any).webSocket as MockClientWebSocket;

    const storeBob = createMergeableStore('bobStore', getNow);
    const syncerBob = await createWsSynchronizer(storeBob, clientWsBob as any);
    await syncerBob.startSync();

    await pause(50);

    // Alice writes private notes
    storeAlice.setCell('notes', 'note1', 'text', 'Alice private secret');

    // Bob writes private notes
    storeBob.setCell('notes', 'note2', 'text', 'Bob private secret');

    await pause(100);

    // Verify isolation
    expect(storeAlice.hasRow('notes', 'note1')).toBe(true);
    expect(storeAlice.hasRow('notes', 'note2')).toBe(false);

    expect(storeBob.hasRow('notes', 'note2')).toBe(true);
    expect(storeBob.hasRow('notes', 'note1')).toBe(false);

    syncerAlice.destroy();
    syncerBob.destroy();
    clientWsAlice.close();
    clientWsBob.close();
  });
});

describe('WsServerDurableObjectEnhanced', () => {
  test('Passes all messages cleanly without wire diff mutation', async () => {
    const state = new MockDurableObjectState();
    const server = new WsServerDurableObjectEnhanced(state as any, {});

    const logs: any[] = [];
    server.setLogger((level, message, context) => {
      logs.push({level, message, context});
    });

    const res1 = await server.fetch(
      createMockRequest('https://example.com/room/test', 'c1'),
    );
    const serverWs1 = state.getWebSockets()[0] as MockServerWebSocket;
    serverWs1.server = server;
    const clientWs1 = (res1 as any).webSocket as MockClientWebSocket;

    const res2 = await server.fetch(
      createMockRequest('https://example.com/room/test', 'c2'),
    );
    const serverWs2 = state.getWebSockets()[1] as MockServerWebSocket;
    serverWs2.server = server;
    const clientWs2 = (res2 as any).webSocket as MockClientWebSocket;

    const store1 = createMergeableStore('s1', getNow);
    const syncer1 = await createWsSynchronizer(store1, clientWs1 as any);
    await syncer1.startSync();

    const store2 = createMergeableStore('s2', getNow);
    const syncer2 = await createWsSynchronizer(store2, clientWs2 as any);
    await syncer2.startSync();

    await pause(50);

    store1.setCell('users', 'u1', 'name', 'Alice');
    await pause(100);

    expect(store2.getCell('users', 'u1', 'name')).toBe('Alice');

    // Verify convergence
    expect(store1.getMergeableContentHashes()[0]).toBe(
      store2.getMergeableContentHashes()[0],
    );

    // Verify logs were captured without throwing
    expect(logs.length).toBeGreaterThan(0);

    syncer1.destroy();
    syncer2.destroy();
    clientWs1.close();
    clientWs2.close();
  });
});
