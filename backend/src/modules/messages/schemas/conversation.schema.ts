import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], required: true })
  participants: Types.ObjectId[];

  @Prop({ default: '' })
  lastMessage: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  lastMessageSender?: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  lastMessageAt: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastMessageAt: -1 });
