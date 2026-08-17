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
  private pendingCandidates = new Map<string, RTCIceCandidateInit[]>();
  private isProcessingAnswer = new Set<string>();
  private isCreatingOffer = new Set<string>();
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

    // 1. Local BroadcastChannel
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel('tookoo-p2p-relay');
        this.broadcastChannel.onmessage = (event) => {
          this.handleIncomingSignal(event.data as SignalPayload);
        };
      } catch {
        // ignore
      }
    }

    // 2. Vite WebSocket Relay
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
      this.sendSignal({
        type: 'JOIN',
        passphrase: this.passphrase,
        fromId: this.deviceId,
        deviceName: this.deviceName,
      });
    }
  }

  private sendSignal(signal: SignalPayload) {
    if (typeof import.meta !== 'undefined' && import.meta.hot) {
      try {
        import.meta.hot.send('tookoo:signal', signal);
      } catch {
        // ignore
      }
    }

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(signal);
      } catch {
        // ignore
      }
    }
  }

  private async handleIncomingSignal(signal: SignalPayload) {
    if (!signal || !signal.passphrase || !this.passphrase) return;
    if (signal.passphrase !== this.passphrase) return; // Different store
    if (signal.fromId === this.deviceId) return; // Ignore self

    const peerId = signal.fromId;
    const peerDeviceName = signal.deviceName || 'Terminal Kasir';

    switch (signal.type) {
      case 'JOIN': {
        this.onStatusCallback?.(peerId, 'CONNECTED', peerDeviceName);
        this.onConnectCallback?.();

        const existing = this.peerConnections.get(peerId);
        if (
          !existing &&
          typeof RTCPeerConnection !== 'undefined' &&
          this.deviceId > peerId
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
          await this.handlePeerAnswer(peerId, peerDeviceName, signal.sdp);
        }
        break;
      }

      case 'ICE': {
        if (signal.targetId === this.deviceId && signal.candidate) {
          await this.handleIceCandidate(peerId, signal.candidate);
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
        this.closePeer(peerId);
        this.onStatusCallback?.(peerId, 'DISCONNECTED');
        break;
      }
    }
  }

  private async initiatePeerOffer(peerId: string, peerDeviceName: string) {
    if (typeof RTCPeerConnection === 'undefined' || this.isCreatingOffer.has(peerId)) return;
    this.isCreatingOffer.add(peerId);

    try {
      this.closePeer(peerId);

      const pc = new RTCPeerConnection(ICE_SERVERS);
      const channel = pc.createDataChannel('tookoo-sync');

      this.peerConnections.set(peerId, { pc, channel, deviceName: peerDeviceName });
      this.setupDataChannel(peerId, peerDeviceName, channel);
      this.setupConnectionListeners(peerId, peerDeviceName, pc);

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
      console.warn('[WebRTC] Failed to initiate offer:', err);
    } finally {
      this.isCreatingOffer.delete(peerId);
    }
  }

  private async handlePeerOffer(
    peerId: string,
    peerDeviceName: string,
    sdp: RTCSessionDescriptionInit
  ) {
    if (typeof RTCPeerConnection === 'undefined') return;

    try {
      this.closePeer(peerId);

      const pc = new RTCPeerConnection(ICE_SERVERS);
      this.peerConnections.set(peerId, { pc, channel: null, deviceName: peerDeviceName });

      pc.ondatachannel = (event) => {
        const entry = this.peerConnections.get(peerId);
        if (entry) entry.channel = event.channel;
        this.setupDataChannel(peerId, peerDeviceName, event.channel);
      };

      this.setupConnectionListeners(peerId, peerDeviceName, pc);

      if (typeof RTCSessionDescription !== 'undefined') {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        this.flushPendingCandidates(peerId, pc);

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

  private async handlePeerAnswer(
    peerId: string,
    peerDeviceName: string,
    sdp: RTCSessionDescriptionInit
  ) {
    const entry = this.peerConnections.get(peerId);
    if (!entry) return;

    // Guard: Only apply answer if state is 'have-local-offer' and not already processing
    if (entry.pc.signalingState !== 'have-local-offer' || this.isProcessingAnswer.has(peerId)) {
      return;
    }

    this.isProcessingAnswer.add(peerId);
    try {
      if (typeof RTCSessionDescription !== 'undefined') {
        await entry.pc.setRemoteDescription(new RTCSessionDescription(sdp));
        this.flushPendingCandidates(peerId, entry.pc);
        this.onStatusCallback?.(peerId, 'CONNECTED', peerDeviceName);
        this.onConnectCallback?.();
      }
    } catch {
      // Ignored: connection might have already settled
    } finally {
      this.isProcessingAnswer.delete(peerId);
    }
  }

  private async handleIceCandidate(peerId: string, candidate: RTCIceCandidateInit) {
    const entry = this.peerConnections.get(peerId);
    if (!entry || !entry.pc.remoteDescription) {
      const queue = this.pendingCandidates.get(peerId) || [];
      queue.push(candidate);
      this.pendingCandidates.set(peerId, queue);
      return;
    }

    try {
      if (typeof RTCIceCandidate !== 'undefined') {
        await entry.pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch {
      // ignored
    }
  }

  private flushPendingCandidates(peerId: string, pc: RTCPeerConnection) {
    const queue = this.pendingCandidates.get(peerId);
    if (queue && queue.length > 0) {
      queue.forEach((candidate) => {
        try {
          if (typeof RTCIceCandidate !== 'undefined') {
            pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
          }
        } catch {
          // ignored
        }
      });
      this.pendingCandidates.delete(peerId);
    }
  }

  private setupConnectionListeners(peerId: string, deviceName: string, pc: RTCPeerConnection) {
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

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        this.onStatusCallback?.(peerId, 'CONNECTED', deviceName);
        this.onConnectCallback?.();
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        this.closePeer(peerId);
        this.onStatusCallback?.(peerId, 'DISCONNECTED');
      }
    };
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

  private closePeer(peerId: string) {
    const entry = this.peerConnections.get(peerId);
    if (entry) {
      try {
        entry.channel?.close();
        entry.pc.close();
      } catch {
        // ignored
      }
      this.peerConnections.delete(peerId);
    }
    this.pendingCandidates.delete(peerId);
    this.isProcessingAnswer.delete(peerId);
    this.isCreatingOffer.delete(peerId);
  }

  public broadcast(message: SyncMessage): boolean {
    let sent = false;

    // 1. Send via active WebRTC DataChannels
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

    // 2. Reliable Signal Fallback (Always delivers data regardless of NAT/firewall)
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
        // ignored
      }
    });
    this.peerConnections.clear();
    this.pendingCandidates.clear();
    this.isProcessingAnswer.clear();
    this.isCreatingOffer.clear();

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.close();
      } catch {
        // ignored
      }
      this.broadcastChannel = null;
    }

    this.isInitialized = false;
  }
}

export const p2pEngine = new P2PClient();
export default p2pEngine;
