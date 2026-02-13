import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryModule } from '../../providers/cloudinary/cloudinary.module';
import { ConnectionsModule } from '../connections/connections.module';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { Post, PostSchema } from './schemas/post.schema';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    CloudinaryModule,
    UsersModule,
    ConnectionsModule,
    NotificationsModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
