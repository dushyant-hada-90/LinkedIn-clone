import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CloudinaryService } from '../../providers/cloudinary/cloudinary.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(payload: Partial<User>) {
    const created = await this.userModel.create(payload);
    return this.sanitize(created);
  }

  async findByEmail(email: string, withPassword = false) {
    const query = this.userModel.findOne({ email });
    if (withPassword) query.select('+password');
    return query;
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id).select('-password');
    return user;
  }

  async search(query: string) {
    if (!query || query.length < 2) return [];
    const regex = new RegExp(query, 'i');
    return this.userModel
      .find({
        $or: [
          { firstName: regex },
          { lastName: regex },
          { headline: regex },
          { email: regex },
        ],
      })
      .select('firstName lastName profileImage headline')
      .limit(20)
      .lean();
  }

  async incrementPostCount(userId: string, delta: number) {
    await this.userModel.findByIdAndUpdate(userId, { $inc: { postCount: delta } });
  }

  async addConnectionPair(userA: string, userB: string) {
    await this.userModel.findByIdAndUpdate(userA, { $addToSet: { connections: new Types.ObjectId(userB) } });
    await this.userModel.findByIdAndUpdate(userB, { $addToSet: { connections: new Types.ObjectId(userA) } });
  }

  async removeConnectionPair(userA: string, userB: string) {
    await this.userModel.findByIdAndUpdate(userA, { $pull: { connections: new Types.ObjectId(userB) } });
    await this.userModel.findByIdAndUpdate(userB, { $pull: { connections: new Types.ObjectId(userA) } });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto, files?: { profileImage?: Express.Multer.File[]; coverImage?: Express.Multer.File[] }) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (files?.profileImage?.[0]) {
      const uploaded = await this.cloudinary.upload(files.profileImage[0].path);
      if (user.profileImagePublicId) await this.cloudinary.delete(user.profileImagePublicId);
      user.profileImage = uploaded?.url || user.profileImage;
      user.profileImagePublicId = uploaded?.publicId;
    }

    if (files?.coverImage?.[0]) {
      const uploaded = await this.cloudinary.upload(files.coverImage[0].path);
      if (user.coverImagePublicId) await this.cloudinary.delete(user.coverImagePublicId);
      user.coverImage = uploaded?.url || user.coverImage;
      user.coverImagePublicId = uploaded?.publicId;
    }

    if (dto.skills && typeof dto.skills === 'string') {
      try {
        dto.skills = JSON.parse(dto.skills as unknown as string);
      } catch (error) {
        dto.skills = [];
      }
    }
    if (dto.experience && typeof dto.experience === 'string') {
      dto.experience = JSON.parse(dto.experience as unknown as string);
    }
    if (dto.education && typeof dto.education === 'string') {
      dto.education = JSON.parse(dto.education as unknown as string);
    }

    Object.assign(user, dto);
    await user.save();
    return this.sanitize(user);
  }

  sanitize(user: UserDocument) {
    const plain = user.toObject();
    delete plain.password;
    return plain;
  }
}
