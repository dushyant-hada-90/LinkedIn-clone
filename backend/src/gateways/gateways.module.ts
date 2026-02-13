import { Global, Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { MessagesModule } from '../modules/messages/messages.module';
import { NotificationsModule } from '../modules/notifications/notifications.module';

@Global()
@Module({
  imports: [MessagesModule, NotificationsModule],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class GatewaysModule {}
