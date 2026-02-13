import { Controller, Get, Put, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getNotifications(@CurrentUser() user: { userId: string }) {
    return this.notificationsService.getNotifications(user.userId);
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser() user: { userId: string }) {
    return this.notificationsService.getUnreadCount(user.userId);
  }

  @Put('read-all')
  markAllRead(@CurrentUser() user: { userId: string }) {
    return this.notificationsService.markAllRead(user.userId);
  }

  @Put(':id/read')
  markOneRead(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.notificationsService.markOneRead(user.userId, id);
  }
}
