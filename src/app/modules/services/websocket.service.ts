import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private stompClient!: Client;
  private connected = false;
  private messageCallback: ((msg: any) => void) | null = null;

  connect(
    roomCode: string,
    onMessage: (msg: any) => void,
    onConnected?: () => void
  ) {
    this.messageCallback = onMessage;

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8089/ws'),
      reconnectDelay: 5000,
      debug: (str) => console.log(str)
    });

    this.stompClient.onConnect = () => {
      console.log("✅ Connected to WebSocket");
      console.log("✅ Subscribing to room:", `/topic/room/${roomCode}`);
      console.log("✅ Subscribing to user queue: /user/queue/signal");
      
      this.connected = true;

      // Subscribe to room broadcasts (JOIN/LEAVE)
      this.stompClient.subscribe(
        `/topic/room/${roomCode}`,
        (message) => {
          console.log("📩 Room message received:", message.body);
          const parsedMsg = JSON.parse(message.body);
          onMessage(parsedMsg);
        }
      );

      // Subscribe to private messages (OFFER/ANSWER/ICE)
      this.stompClient.subscribe(
        `/user/queue/signal`,
        (message) => {
          console.log("📩 Private message received:", message.body);
          const parsedMsg = JSON.parse(message.body);
          onMessage(parsedMsg);
        }
      );

      if (onConnected) {
        onConnected();
      }
    };

    this.stompClient.onStompError = (frame) => {
      console.error("Broker error:", frame.headers['message']);
      console.error("Details:", frame.body);
    };

    this.stompClient.activate();
  }

  send(payload: any) {
    if (!this.connected) {
      console.warn("⚠ WebSocket not connected yet. Message skipped.");
      return;
    }

    console.log("📤 Sending message:", payload);
    this.stompClient.publish({
      destination: `/app/signal`,
      body: JSON.stringify(payload)
    });
  }

  disconnect(): void {
    this.connected = false;
    if (this.stompClient && this.stompClient.active) {
      this.stompClient.deactivate();
      console.log("🔌 WebSocket disconnected");
    }
  }
}