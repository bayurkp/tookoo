import type { SyncMessage } from '@/types/sync.types';

export type MessageHandler = (message: SyncMessage) => void;
export type PeerStatusHandler = (
  peerId: string,
  status: 'CONNECTED' | 'DISCONNECTED',
  deviceName?: string
) => void;

interface SignalPayload {
  type: 'JOIN' | 'OFFER' | 'ANSWER' | 'ICE' | 'SYNC_DATA' | 'LEAVE';
  passphrase: string;
  fromId: string;
  targetId?: string;
  deviceName?: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  message?: SyncMessage;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export class P2PClient {
  private passphrase = '';
  private deviceId = '';
  private deviceName = 'Terminal Kasir';
  private onMessageCallback: MessageHandler | null = null;
  private onStatusCallback: PeerStatusHandler | null = null;
  private onConnectCallback: (() => void) | null = null;

  private peerConnections = new Map<
    string,
    { pc: RTCPeerConnection; channel: RTCDataChannel | null; deviceName: string }
  >();
  private broadcastChannel: BroadcastChannel | null = null;
  private isInitialized = false;

  public initConnection(
    onMessage: MessageHandler,
    onStatus: PeerStatusHandler,
    onConnect?: () => void
  ) {
    this.onMessageCallback = onMessage;
    this.onStatusCallback = onStatus;
    if (onConnect) this.onConnectCallback = onConnect;

    if (this.isInitialized) return;
    this.isInitialized = true;

    // 1. Setup Local BroadcastChannel (for multi-tab testing on same machine)
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel('tookoo-p2p-relay');
        this.broadcastChannel.onmessage = (event) => {
          this.handleIncomingSignal(event.data as SignalPayload);
        };
      } catch {
        // Ignore BroadcastChannel errors in unsupported environments
      }
    }

    // 2. Setup Vite HMR WebSocket Signaling (for cross-device LAN / Tunnel communication)
    if (typeof import.meta !== 'undefined' && import.meta.hot) {
      import.meta.hot.on('tookoo:signal', (data: SignalPayload) => {
        this.handleIncomingSignal(data);
      });
    }
  }

  public updateIdentity(passphrase: string, deviceId: string, deviceName?: string) {
    const normalized = passphrase.trim().toLowerCase().replace(/\s+/g, ' ');
    const changed =
      normalized !== this.passphrase ||
      deviceId !== this.deviceId ||
      (deviceName && deviceName !== this.deviceName);

    this.passphrase = normalized;
    this.deviceId = deviceId;
    if (deviceName) this.deviceName = deviceName;

    if (changed && this.passphrase && this.deviceId) {
      // Announce presence to all peers sharing the same network/passphrase
      this.sendSignal({
        type: 'JOIN',
        passphrase: this.passphrase,
        fromId: this.deviceId,
        deviceName: this.deviceName,
      });
    }
  }

  private sendSignal(signal: SignalPayload) {
    // 1. Send via Vite WebSocket relay
    if (typeof import.meta !== 'undefined' && import.meta.hot) {
      try {
        import.meta.hot.send('tookoo:signal', signal);
      } catch {
        // fallback
      }
    }

    // 2. Send via BroadcastChannel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(signal);
      } catch {
        // fallback
      }
    }
  }

  private async handleIncomingSignal(signal: SignalPayload) {
    if (!signal || !signal.passphrase || !this.passphrase) return;
    if (signal.passphrase !== this.passphrase) return; // Different store passphrase
    if (signal.fromId === this.deviceId) return; // Ignore messages from self

    const peerId = signal.fromId;
    const peerDeviceName = signal.deviceName || 'Terminal Kasir';

    switch (signal.type) {
      case 'JOIN': {
        // Peer joined the same store passphrase room
        this.onStatusCallback?.(peerId, 'CONNECTED', peerDeviceName);
        this.onConnectCallback?.();

        // Initiator logic: Higher deviceId initiates WebRTC connection
        if (
          typeof RTCPeerConnection !== 'undefined' &&
          this.deviceId > peerId &&
          !this.peerConnections.has(peerId)
        ) {
          await this.initiatePeerOffer(peerId, peerDeviceName);
        }
        break;
      }

      case 'OFFER': {
        if (signal.targetId === this.deviceId && signal.sdp) {
          await this.handlePeerOffer(peerId, peerDeviceName, signal.sdp);
        }
        break;
      }

      case 'ANSWER': {
        if (signal.targetId === this.deviceId && signal.sdp) {
          const entry = this.peerConnections.get(peerId);
          if (entry && typeof RTCSessionDescription !== 'undefined') {
            await entry.pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
            this.onStatusCallback?.(peerId, 'CONNECTED', peerDeviceName);
            this.onConnectCallback?.();
          }
        }
        break;
      }

      case 'ICE': {
        if (signal.targetId === this.deviceId && signal.candidate) {
          const entry = this.peerConnections.get(peerId);
          if (entry && typeof RTCIceCandidate !== 'undefined') {
            try {
              await entry.pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
            } catch {
              // candidate error ignored
            }
          }
        }
        break;
      }

      case 'SYNC_DATA': {
        if (signal.message) {
          this.onStatusCallback?.(peerId, 'CONNECTED', peerDeviceName);
          this.onMessageCallback?.(signal.message);
        }
        break;
      }

      case 'LEAVE': {
        this.peerConnections.delete(peerId);
        this.onStatusCallback?.(peerId, 'DISCONNECTED');
        break;
      }
    }
  }

  private async initiatePeerOffer(peerId: string, peerDeviceName: string) {
    if (typeof RTCPeerConnection === 'undefined') return;

    try {
      const pc = new RTCPeerConnection(ICE_SERVERS);
      const channel = pc.createDataChannel('tookoo-sync');

      this.peerConnections.set(peerId, { pc, channel, deviceName: peerDeviceName });
      this.setupDataChannel(peerId, peerDeviceName, channel);

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          this.sendSignal({
            type: 'ICE',
            passphrase: this.passphrase,
            fromId: this.deviceId,
            targetId: peerId,
            candidate: event.candidate.toJSON(),
          });
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      this.sendSignal({
        type: 'OFFER',
        passphrase: this.passphrase,
        fromId: this.deviceId,
        targetId: peerId,
        deviceName: this.deviceName,
        sdp: offer,
      });
    } catch (err) {
      console.warn('[WebRTC] Failed to create offer:', err);
    }
  }

  private async handlePeerOffer(
    peerId: string,
    peerDeviceName: string,
    sdp: RTCSessionDescriptionInit
  ) {
    if (typeof RTCPeerConnection === 'undefined') return;

    try {
      const pc = new RTCPeerConnection(ICE_SERVERS);
      this.peerConnections.set(peerId, { pc, channel: null, deviceName: peerDeviceName });

      pc.ondatachannel = (event) => {
        const entry = this.peerConnections.get(peerId);
        if (entry) entry.channel = event.channel;
        this.setupDataChannel(peerId, peerDeviceName, event.channel);
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          this.sendSignal({
            type: 'ICE',
            passphrase: this.passphrase,
            fromId: this.deviceId,
            targetId: peerId,
            candidate: event.candidate.toJSON(),
          });
        }
      };

      if (typeof RTCSessionDescription !== 'undefined') {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        this.sendSignal({
          type: 'ANSWER',
          passphrase: this.passphrase,
          fromId: this.deviceId,
          targetId: peerId,
          deviceName: this.deviceName,
          sdp: answer,
        });

        this.onStatusCallback?.(peerId, 'CONNECTED', peerDeviceName);
        this.onConnectCallback?.();
      }
    } catch (err) {
      console.warn('[WebRTC] Failed to handle offer:', err);
    }
  }

  private setupDataChannel(peerId: string, deviceName: string, channel: RTCDataChannel) {
    channel.onopen = () => {
      this.onStatusCallback?.(peerId, 'CONNECTED', deviceName);
      this.onConnectCallback?.();
    };

    channel.onclose = () => {
      this.onStatusCallback?.(peerId, 'DISCONNECTED');
    };

    channel.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as SyncMessage;
        this.onMessageCallback?.(parsed);
      } catch (err) {
        console.error('[WebRTC] Failed to parse DataChannel message:', err);
      }
    };
  }

  public broadcast(message: SyncMessage): boolean {
    let sent = false;

    // 1. Send via open WebRTC DataChannels
    this.peerConnections.forEach(({ channel }) => {
      if (channel && channel.readyState === 'open') {
        try {
          channel.send(JSON.stringify(message));
          sent = true;
        } catch {
          // fallback
        }
      }
    });

    // 2. Multi-tier fallback: Broadcast via Signaling Channel
    if (this.passphrase) {
      this.sendSignal({
        type: 'SYNC_DATA',
        passphrase: this.passphrase,
        fromId: this.deviceId,
        deviceName: this.deviceName,
        message,
      });
      sent = true;
    }

    return sent;
  }

  public close() {
    this.peerConnections.forEach(({ pc, channel }) => {
      try {
        channel?.close();
        pc?.close();
      } catch {
        // ignore
      }
    });
    this.peerConnections.clear();

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.close();
      } catch {
        // ignore
      }
      this.broadcastChannel = null;
    }

    this.isInitialized = false;
  }
}

export const p2pEngine = new P2PClient();
export default p2pEngine;
