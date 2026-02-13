import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument, NotificationType } from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  async create(data: {
    recipientId: string;
    senderId: string;
    type: NotificationType;
    postId?: string;
    conversationId?: string;
    preview?: string;
  }) {
    // Don't send notifications to yourself
    if (data.recipientId === data.senderId) return null;

    const notification = await this.notificationModel.create({
      recipient: new Types.ObjectId(data.recipientId),
      sender: new Types.ObjectId(data.senderId),
      type: data.type,
      post: data.postId ? new Types.ObjectId(data.postId) : undefined,
      conversation: data.conversationId ? new Types.ObjectId(data.conversationId) : undefined,
      preview: data.preview || '',
    });

    return this.notificationModel
      .findById(notification._id)
      .populate('sender', 'firstName lastName profileImage')
      .lean();
  }

  async getNotifications(userId: string, limit = 30) {
    return this.notificationModel
      .find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('sender', 'firstName lastName profileImage')
      .lean();
  }

  async markAllRead(userId: string) {
    await this.notificationModel.updateMany({ recipient: userId, read: false }, { read: true });
    return { success: true };
  }

  async markOneRead(userId: string, notificationId: string) {
    await this.notificationModel.updateOne(
      { _id: notificationId, recipient: userId },
      { read: true },
    );
    return { success: true };
  }

  async getUnreadCount(userId: string) {
    const count = await this.notificationModel.countDocuments({ recipient: userId, read: false });
    return { count };
  }
}
