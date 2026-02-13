import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as cookie from 'cookie';
import * as jwt from 'jsonwebtoken';
import { MessagesService } from '../modules/messages/messages.service';
import { NotificationsService } from '../modules/notifications/notifications.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private userSockets = new Map<string, Set<string>>();

  constructor(
    private readonly messagesService: MessagesService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const cookies = cookie.parse(client.handshake.headers.cookie || '');
      const token = cookies['access_token'] || client.handshake.auth?.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = jwt.verify(token, process.env.JWT_SECRET || 'changeme') as any;
      const userId = payload.sub;
      client.data.userId = userId;

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);
      client.join(`user:${userId}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data?.userId;
    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId)!.delete(client.id);
      if (this.userSockets.get(userId)!.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: string; content: string },
  ) {
    const senderId = client.data.userId;
    if (!senderId) return;

    const result = await this.messagesService.sendMessage(senderId, data.receiverId, {
      content: data.content,
    });

    // Emit to receiver's room
    this.server.to(`user:${data.receiverId}`).emit('new_message', {
      message: result.message,
      conversationId: result.conversationId,
    });

    // Also send back to sender for confirmation
    client.emit('message_sent', {
      message: result.message,
      conversationId: result.conversationId,
    });

    // Create notification for the receiver
    const notification = await this.notificationsService.create({
      recipientId: data.receiverId,
      senderId,
      type: 'message',
      conversationId: result.conversationId,
      preview: data.content.substring(0, 60),
    });

    if (notification) {
      this.server.to(`user:${data.receiverId}`).emit('new_notification', notification);
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; receiverId: string },
  ) {
    this.server.to(`user:${data.receiverId}`).emit('user_typing', {
      conversationId: data.conversationId,
      userId: client.data.userId,
    });
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = client.data.userId;
    if (!userId) return;
    await this.messagesService.markRead(userId, data.conversationId);
  }

  // Called by controllers to push notifications in real-time
  emitNotification(recipientId: string, notification: any) {
    this.server.to(`user:${recipientId}`).emit('new_notification', notification);
  }

  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }
}
