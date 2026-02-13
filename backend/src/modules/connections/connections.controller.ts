import { Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ConnectionsService } from './connections.service';
import { ConnectionsAiService } from './connections-ai.service';
import { EventsGateway } from '../../gateways/events.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';

@Controller('connections')
@UseGuards(JwtAuthGuard)
export class ConnectionsController {
  constructor(
    private readonly connectionsService: ConnectionsService,
    private readonly connectionsAi: ConnectionsAiService,
    private readonly usersService: UsersService,
    private readonly eventsGateway: EventsGateway,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Post(':userId')
  async send(@CurrentUser() user: { userId: string }, @Param('userId') target: string) {
    const result = await this.connectionsService.sendConnection(user.userId, target);
    const notification = await this.notificationsService.create({
      recipientId: target,
      senderId: user.userId,
      type: 'connection_request',
      preview: 'sent you a connection request',
    });
    if (notification) {
      this.eventsGateway.emitNotification(target, notification);
    }
    return result;
  }

  @Put(':connectionId/accept')
  async accept(@CurrentUser() user: { userId: string }, @Param('connectionId') connectionId: string) {
    const result = await this.connectionsService.accept(connectionId, user.userId);

    // Get the connection to find sender
    const connection = await this.connectionsService.findById(connectionId);
    if (connection) {
      const senderId = connection.sender.toString();
      const notification = await this.notificationsService.create({
        recipientId: senderId,
        senderId: user.userId,
        type: 'connection_accepted',
        preview: 'accepted your connection request',
      });
      if (notification) {
        this.eventsGateway.emitNotification(senderId, notification);
      }
    }
    return result;
  }

  @Put(':connectionId/reject')
  reject(@CurrentUser() user: { userId: string }, @Param('connectionId') connectionId: string) {
    return this.connectionsService.reject(connectionId, user.userId);
  }

  @Delete(':userId')
  remove(@CurrentUser() user: { userId: string }, @Param('userId') otherUserId: string) {
    return this.connectionsService.removeConnection(user.userId, otherUserId);
  }

  @Get(':userId/status')
  status(@CurrentUser() user: { userId: string }, @Param('userId') otherUserId: string) {
    return this.connectionsService.getStatus(user.userId, otherUserId);
  }

  @Get('me/requests')
  requests(@CurrentUser() user: { userId: string }) {
    return this.connectionsService.pendingRequests(user.userId);
  }

  @Get('me')
  me(@CurrentUser() user: { userId: string }) {
    return this.connectionsService.myConnections(user.userId);
  }

  @Get(':userId/icebreaker')
  async icebreaker(
    @CurrentUser() user: { userId: string },
    @Param('userId') targetId: string,
  ) {
    const [sender, receiver] = await Promise.all([
      this.usersService.findById(user.userId),
      this.usersService.findById(targetId),
    ]);
    if (!sender || !receiver) {
      return { greeting: 'Could not load profiles', options: [], sharedInterests: [] };
    }
    return this.connectionsAi.generateIcebreaker(sender, receiver);
  }
}
