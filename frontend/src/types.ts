export type ConnectionStatus = 'connect' | 'pending' | 'accept' | 'disconnect' | 'self';

export type NotificationType = 'like' | 'comment' | 'connection_request' | 'connection_accepted' | 'message';

export interface User {
  _id: string;
  firstName: string;
  lastName?: string;
  email: string;
  profileImage?: string;
  coverImage?: string;
  headline?: string;
  location?: string;
  gender?: string;
  skills?: string[];
  education?: Array<{ college?: string; degree?: string; fieldOfStudy?: string; startYear?: string; endYear?: string }>;
  experience?: Array<{ title?: string; company?: string; description?: string; startDate?: string; endDate?: string }>;
  connections?: string[];
  postCount?: number;
  createdAt?: string;
}

export interface Comment {
  _id: string;
  content: string;
  user: User;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  _id: string;
  author: User;
  description: string;
  image?: string;
  imagePublicId?: string;
  likes: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
  connectionStatus?: ConnectionStatus;
}

export interface Notification {
  _id: string;
  recipient: string;
  sender: User;
  type: NotificationType;
  post?: string;
  conversation?: string;
  read: boolean;
  preview: string;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: User[];
  lastMessage: string;
  lastMessageSender?: User;
  lastMessageAt: string;
}

export interface Message {
  _id: string;
  conversation: string;
  sender: User;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface ConnectionRequest {
  _id: string;
  sender: User;
  receiver: string;
  status: string;
  createdAt: string;
}

export interface FeedResponse {
  posts: Post[];
  nextCursor: { createdAt: string; _id: string } | null;
}
