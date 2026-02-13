import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PostsModule } from './modules/posts/posts.module';
import { ConnectionsModule } from './modules/connections/connections.module';
import { MessagesModule } from './modules/messages/messages.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CloudinaryModule } from './providers/cloudinary/cloudinary.module';
import { GatewaysModule } from './gateways/gateways.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vibe',
      }),
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        { name: 'short', ttl: 1000, limit: 5 },
        { name: 'medium', ttl: 10000, limit: 30 },
        { name: 'long', ttl: 60000, limit: 100 },
      ],
    }),
    CloudinaryModule,
    AuthModule,
    UsersModule,
    PostsModule,
    ConnectionsModule,
    MessagesModule,
    NotificationsModule,
    GatewaysModule,
  ],
})
export class AppModule {}
