import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { Message, MessageDocument } from './schemas/message.schema';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Conversation.name) private readonly conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name) private readonly messageModel: Model<MessageDocument>,
  ) {}

  async getOrCreateConversation(userAId: string, userBId: string) {
    const existing = await this.conversationModel.findOne({
      participants: { $all: [userAId, userBId], $size: 2 },
    });
    if (existing) return existing;

    return this.conversationModel.create({
      participants: [new Types.ObjectId(userAId), new Types.ObjectId(userBId)],
    });
  }

  async sendMessage(senderId: string, receiverId: string, dto: SendMessageDto) {
    const conversation = await this.getOrCreateConversation(senderId, receiverId);

    const message = await this.messageModel.create({
      conversation: conversation._id,
      sender: new Types.ObjectId(senderId),
      content: dto.content,
    });

    await this.conversationModel.findByIdAndUpdate(conversation._id, {
      lastMessage: dto.content.substring(0, 100),
      lastMessageSender: new Types.ObjectId(senderId),
      lastMessageAt: new Date(),
    });

    const populated = await this.messageModel
      .findById(message._id)
      .populate('sender', 'firstName lastName profileImage')
      .lean();

    return { message: populated, conversationId: conversation._id.toString() };
  }

  async getConversations(userId: string) {
    return this.conversationModel
      .find({ participants: userId })
      .sort({ lastMessageAt: -1 })
      .populate('participants', 'firstName lastName profileImage headline')
      .populate('lastMessageSender', 'firstName lastName')
      .lean();
  }

  async getMessages(userId: string, conversationId: string, limit = 50, before?: string) {
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) throw new NotFoundException('Conversation not found');

    const isParticipant = conversation.participants.some((p) => p.toString() === userId);
    if (!isParticipant) throw new NotFoundException('Conversation not found');

    const query: any = { conversation: conversationId };
    if (before) query.createdAt = { $lt: new Date(before) };

    const messages = await this.messageModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('sender', 'firstName lastName profileImage')
      .lean();

    return messages.reverse();
  }

  async markRead(userId: string, conversationId: string) {
    await this.messageModel.updateMany(
      { conversation: conversationId, sender: { $ne: userId }, read: false },
      { read: true },
    );
    return { success: true };
  }

  async getUnreadCount(userId: string) {
    const conversations = await this.conversationModel.find({ participants: userId });
    const conversationIds = conversations.map((c) => c._id);
    const count = await this.messageModel.countDocuments({
      conversation: { $in: conversationIds },
      sender: { $ne: userId },
      read: false,
    });
    return { count };
  }
}
