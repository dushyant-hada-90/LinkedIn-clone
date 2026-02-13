import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CloudinaryService } from '../../providers/cloudinary/cloudinary.service';
import { UsersService } from '../users/users.service';
import { ConnectionsService } from '../connections/connections.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CommentDto } from './dto/comment.dto';
import { EditCommentDto } from './dto/edit-comment.dto';
import { Post, PostDocument } from './schemas/post.schema';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    private readonly cloudinary: CloudinaryService,
    private readonly usersService: UsersService,
    private readonly connectionsService: ConnectionsService,
  ) {}

  async create(authorId: string, dto: CreatePostDto, file?: Express.Multer.File) {
    let uploadResult: { url?: string; publicId?: string } | null = null;
    if (file) uploadResult = await this.cloudinary.upload(file.path);

    const post = await this.postModel.create({
      author: new Types.ObjectId(authorId),
      description: dto.description,
      image: uploadResult?.url,
      imagePublicId: uploadResult?.publicId,
    });
    await this.usersService.incrementPostCount(authorId, 1);
    return this.populatePost(post, authorId);
  }

  async delete(authorId: string, postId: string) {
    const post = await this.postModel.findOne({ _id: postId, author: authorId });
    if (!post) throw new NotFoundException('Post not found');

    if (post.imagePublicId) await this.cloudinary.delete(post.imagePublicId);
    await this.postModel.deleteOne({ _id: postId, author: authorId });
    await this.usersService.incrementPostCount(authorId, -1);
    return { message: 'Post deleted' };
  }

  async feed(currentUserId: string, limit = 10, cursor?: { createdAt: string; _id: string }) {
    const cursorQuery = cursor
      ? {
          $or: [
            { createdAt: { $lt: cursor.createdAt } },
            { createdAt: cursor.createdAt, _id: { $lt: cursor._id } },
          ],
        }
      : {};

    const posts = await this.postModel
      .find(cursorQuery)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .populate('author', 'firstName lastName profileImage headline')
      .populate('comments.user', 'firstName lastName profileImage')
      .lean();

    const hasMore = posts.length > limit;
    const trimmed = hasMore ? posts.slice(0, limit) : posts;
    const connectionMap = await this.connectionsService.buildConnectionMap(currentUserId);

    const enhanced = trimmed.map((post) => ({
      ...post,
      connectionStatus: this.connectionsService.determineStatus(currentUserId, post.author?._id, connectionMap),
    }));

    const last = enhanced[enhanced.length - 1];
    const nextCursor = hasMore && last ? { createdAt: last.createdAt, _id: last._id } : null;
    return { posts: enhanced, nextCursor };
  }

  async toggleLike(userId: string, postId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    const alreadyLiked = post.likes.some((id) => id.toString() === userId);
    post.likes = alreadyLiked
      ? post.likes.filter((id) => id.toString() !== userId)
      : [...post.likes, new Types.ObjectId(userId)];
    await post.save();

    const populated = await this.populatePost(post, userId);
    return populated;
  }

  async addComment(userId: string, postId: string, dto: CommentDto) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');
    post.comments.push({ content: dto.content, user: new Types.ObjectId(userId), isEdited: false } as any);
    await post.save();
    return this.populatePost(post, userId);
  }

  async deleteComment(userId: string, postId: string, commentId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');
    post.comments = post.comments.filter(
      (comment: any) => comment._id.toString() !== commentId || comment.user.toString() !== userId,
    ) as any;
    await post.save();
    return this.populatePost(post, userId);
  }

  async editComment(userId: string, postId: string, commentId: string, dto: EditCommentDto) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');
    const comment = post.comments.find(
      (c: any) => c._id.toString() === commentId && c.user.toString() === userId,
    ) as any;
    if (comment) {
      comment.content = dto.newContent;
      comment.isEdited = true;
      comment.updatedAt = new Date();
    }
    await post.save();
    return this.populatePost(post, userId);
  }

  private async populatePost(post: PostDocument, currentUserId: string) {
    const populated = await this.postModel
      .findById(post._id)
      .populate('author', 'firstName lastName profileImage headline')
      .populate('comments.user', 'firstName lastName profileImage')
      .lean();
    const connectionMap = await this.connectionsService.buildConnectionMap(currentUserId);
    return {
      ...populated,
      connectionStatus: this.connectionsService.determineStatus(
        currentUserId,
        populated?.author?._id,
        connectionMap,
      ),
    };
  }
}
