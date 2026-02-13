import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  firstName: string;

  @Prop({ default: '' })
  lastName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ select: false })
  password?: string;

  @Prop({ default: '' })
  profileImage: string;

  @Prop()
  profileImagePublicId?: string;

  @Prop({ default: '' })
  coverImage: string;

  @Prop()
  coverImagePublicId?: string;

  @Prop({ default: '' })
  headline: string;

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop({
    type: [
      {
        college: String,
        degree: String,
        fieldOfStudy: String,
        startYear: String,
        endYear: String,
      },
    ],
    default: [],
  })
  education: Array<{ college?: string; degree?: string; fieldOfStudy?: string; startYear?: string; endYear?: string }>;

  @Prop({ default: 'India' })
  location: string;

  @Prop({ enum: ['male', 'female', 'other'], required: false })
  gender?: 'male' | 'female' | 'other';

  @Prop({
    type: [
      {
        title: String,
        company: String,
        description: String,
        startDate: String,
        endDate: String,
      },
    ],
    default: [],
  })
  experience: Array<{ title?: string; company?: string; description?: string; startDate?: string; endDate?: string }>;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  connections: Types.ObjectId[];

  @Prop({ enum: ['local', 'google', 'github', 'apple'], default: 'local' })
  authProvider: string;

  @Prop({ unique: true, sparse: true })
  googleId?: string;

  @Prop({ default: 0 })
  postCount: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
