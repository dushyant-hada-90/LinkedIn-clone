import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import { Connection, ConnectionDocument } from './schemas/connection.schema';

@Injectable()
export class ConnectionsService {
  constructor(
    @InjectModel(Connection.name) private readonly connectionModel: Model<ConnectionDocument>,
    private readonly usersService: UsersService,
  ) {}

  async sendConnection(senderId: string, receiverId: string) {
    if (senderId === receiverId) throw new BadRequestException("Can't connect to yourself");

    const existing = await this.connectionModel.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
      status: { $ne: 'rejected' },
    });
    if (existing) throw new BadRequestException('Request already exists');

    await this.connectionModel.create({
      sender: new Types.ObjectId(senderId),
      receiver: new Types.ObjectId(receiverId),
      status: 'pending',
    });
    return { message: 'Connection request sent' };
  }

  async accept(connectionId: string, currentUserId: string) {
    const connection = await this.connectionModel.findById(connectionId);
    if (!connection) throw new NotFoundException('Connection not found');
    if (connection.receiver.toString() !== currentUserId)
      throw new BadRequestException('Only receiver can accept');
    connection.status = 'accepted';
    await connection.save();
    await this.connectionModel.updateOne({ _id: connectionId }, { status: 'accepted' });
    await this.usersService.addConnectionPair(connection.sender.toString(), connection.receiver.toString());
    return { message: 'Connection accepted' };
  }

  async reject(connectionId: string, currentUserId: string) {
    const connection = await this.connectionModel.findById(connectionId);
    if (!connection) throw new NotFoundException('Connection not found');
    if (connection.receiver.toString() !== currentUserId)
      throw new BadRequestException('Only receiver can reject');
    connection.status = 'rejected';
    await connection.save();
    return { message: 'Connection rejected' };
  }

  async findById(connectionId: string) {
    return this.connectionModel.findById(connectionId);
  }

  async removeConnection(currentUserId: string, otherUserId: string) {
    await this.usersService.removeConnectionPair(currentUserId, otherUserId);
    await this.connectionModel.deleteMany({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
    });
    return { message: 'Disconnected' };
  }

  async pendingRequests(currentUserId: string) {
    return this.connectionModel
      .find({ receiver: currentUserId, status: 'pending' })
      .populate('sender', 'firstName lastName profileImage headline email');
  }

  async myConnections(currentUserId: string) {
    const user = await this.usersService.findById(currentUserId);
    return user?.connections || [];
  }

  async getStatus(currentUserId: string, targetUserId: string) {
    const map = await this.buildConnectionMap(currentUserId);
    return { status: this.determineStatus(currentUserId, targetUserId, map) };
  }

  async buildConnectionMap(currentUserId: string) {
    const connections = await this.connectionModel.find({
      $or: [{ sender: currentUserId }, { receiver: currentUserId }],
    });
    const map = new Map<string, { status: string; isSender: boolean }>();
    connections.forEach((conn) => {
      const other = conn.sender.equals(currentUserId) ? conn.receiver.toString() : conn.sender.toString();
      map.set(other, { status: conn.status, isSender: conn.sender.equals(currentUserId) });
    });
    return map;
  }

  determineStatus(currentUserId: string, targetUserId: string, map: Map<string, { status: string; isSender: boolean }>) {
    if (!targetUserId) return 'connect';
    const currentStr = currentUserId.toString();
    const targetStr = targetUserId.toString();
    if (currentStr === targetStr) return 'self';
    const entry = map.get(targetStr);
    if (!entry) return 'connect';
    if (entry.status === 'accepted') return 'disconnect';
    if (entry.status === 'pending') return entry.isSender ? 'pending' : 'accept';
    return 'connect';
  }
}
