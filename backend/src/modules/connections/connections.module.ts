import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ConnectionsController } from './connections.controller';
import { ConnectionsService } from './connections.service';
import { ConnectionsAiService } from './connections-ai.service';
import { Connection, ConnectionSchema } from './schemas/connection.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Connection.name, schema: ConnectionSchema }]),
    UsersModule,
    NotificationsModule,
  ],
  controllers: [ConnectionsController],
  providers: [ConnectionsService, ConnectionsAiService],
  exports: [ConnectionsService, ConnectionsAiService],
})
export class ConnectionsModule {}
