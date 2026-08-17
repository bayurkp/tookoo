import type { SyncMessage } from '@/types/sync.types';

export type MessageHandler = (message: SyncMessage) => void;
export type PeerStatusHandler = (
  peerId: string,
  status: 'CONNECTED' | 'DISCONNECTED'
) => void;

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export class P2PClient {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private onMessageCallback: MessageHandler | null = null;
  private onStatusCallback: PeerStatusHandler | null = null;

  public initConnection(
    onMessage: MessageHandler,
    onStatus: PeerStatusHandler
  ): RTCPeerConnection {
    this.onMessageCallback = onMessage;
    this.onStatusCallback = onStatus;

    if (typeof RTCPeerConnection === 'undefined') {
      // Fallback for jsdom / non-WebRTC test environments
      return {} as RTCPeerConnection;
    }

    this.peerConnection = new RTCPeerConnection(ICE_SERVERS);

    this.peerConnection.ondatachannel = (event) => {
      this.setupDataChannel(event.channel);
    };

    return this.peerConnection;
  }

  public createDataChannel(channelName = 'tookoo-sync'): RTCDataChannel | null {
    if (!this.peerConnection || typeof this.peerConnection.createDataChannel !== 'function') {
      return null;
    }

    try {
      const channel = this.peerConnection.createDataChannel(channelName);
      this.setupDataChannel(channel);
      return channel;
    } catch {
      return null;
    }
  }

  private setupDataChannel(channel: RTCDataChannel) {
    this.dataChannel = channel;

    this.dataChannel.onopen = () => {
      this.onStatusCallback?.('peer-1', 'CONNECTED');
    };

    this.dataChannel.onclose = () => {
      this.onStatusCallback?.('peer-1', 'DISCONNECTED');
    };

    this.dataChannel.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as SyncMessage;
        this.onMessageCallback?.(parsed);
      } catch (err) {
        console.error('Failed to parse incoming sync message', err);
      }
    };
  }

  public broadcast(message: SyncMessage): boolean {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  public close() {
    this.dataChannel?.close();
    this.peerConnection?.close();
    this.dataChannel = null;
    this.peerConnection = null;
  }
}

export const p2pEngine = new P2PClient();
