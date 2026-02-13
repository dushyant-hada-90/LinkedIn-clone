import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

export type NotificationType = 'like' | 'comment' | 'connection_request' | 'connection_accepted' | 'message';

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  recipient!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender!: Types.ObjectId;

  @Prop({ required: true, enum: ['like', 'comment', 'connection_request', 'connection_accepted', 'message'] })
  type!: NotificationType;

  @Prop({ type: Types.ObjectId, ref: 'Post' })
  post?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Conversation' })
  conversation?: Types.ObjectId;

  @Prop({ default: false })
  read!: boolean;

  @Prop({ default: '' })
  preview!: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ recipient: 1, createdAt: -1 });
