import { Controller, Get, Param, Post, Body, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('conversations')
  getConversations(@CurrentUser() user: { userId: string }) {
    return this.messagesService.getConversations(user.userId);
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser() user: { userId: string }) {
    return this.messagesService.getUnreadCount(user.userId);
  }

  @Post('send/:receiverId')
  sendMessage(
    @CurrentUser() user: { userId: string },
    @Param('receiverId') receiverId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagesService.sendMessage(user.userId, receiverId, dto);
  }

  @Get(':conversationId')
  getMessages(
    @CurrentUser() user: { userId: string },
    @Param('conversationId') conversationId: string,
    @Query('before') before?: string,
  ) {
    return this.messagesService.getMessages(user.userId, conversationId, 50, before);
  }

  @Put(':conversationId/read')
  markRead(
    @CurrentUser() user: { userId: string },
    @Param('conversationId') conversationId: string,
  ) {
    return this.messagesService.markRead(user.userId, conversationId);
  }
}
