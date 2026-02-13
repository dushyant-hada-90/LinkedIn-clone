import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CommentDto } from './dto/comment.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { EditCommentDto } from './dto/edit-comment.dto';
import { PostsService } from './posts.service';
import { EventsGateway } from '../../gateways/events.gateway';
import { NotificationsService } from '../notifications/notifications.service';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly eventsGateway: EventsGateway,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', { dest: 'tmp/' }))
  create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreatePostDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.postsService.create(user.userId, dto, file);
  }

  @Delete(':id')
  delete(@CurrentUser() user: { userId: string }, @Param('id') postId: string) {
    return this.postsService.delete(user.userId, postId);
  }

  @Get()
  feed(
    @CurrentUser() user: { userId: string },
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    const parsedCursor = cursor ? JSON.parse(cursor) : undefined;
    return this.postsService.feed(user.userId, Number(limit) || 10, parsedCursor);
  }

  @Post(':id/like')
  async like(@CurrentUser() user: { userId: string }, @Param('id') postId: string) {
    const result = await this.postsService.toggleLike(user.userId, postId);
    // Send notification if it was a like (not unlike)
    if (result.likes?.some((id: any) => id.toString() === user.userId)) {
      const authorId = result.author?._id?.toString();
      if (authorId && authorId !== user.userId) {
        const notification = await this.notificationsService.create({
          recipientId: authorId,
          senderId: user.userId,
          type: 'like',
          postId,
          preview: 'liked your post',
        });
        if (notification) {
          this.eventsGateway.emitNotification(authorId, notification);
        }
      }
    }
    return result;
  }

  @Post(':id/comments')
  async comment(
    @CurrentUser() user: { userId: string },
    @Param('id') postId: string,
    @Body() dto: CommentDto,
  ) {
    const result = await this.postsService.addComment(user.userId, postId, dto);
    const authorId = result.author?._id?.toString();
    if (authorId && authorId !== user.userId) {
      const notification = await this.notificationsService.create({
        recipientId: authorId,
        senderId: user.userId,
        type: 'comment',
        postId,
        preview: dto.content.substring(0, 60),
      });
      if (notification) {
        this.eventsGateway.emitNotification(authorId, notification);
      }
    }
    return result;
  }

  @Delete(':postId/comments/:commentId')
  deleteComment(
    @CurrentUser() user: { userId: string },
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
  ) {
    return this.postsService.deleteComment(user.userId, postId, commentId);
  }

  @Patch(':postId/comments/:commentId')
  editComment(
    @CurrentUser() user: { userId: string },
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Body() dto: EditCommentDto,
  ) {
    return this.postsService.editComment(user.userId, postId, commentId, dto);
  }
}
