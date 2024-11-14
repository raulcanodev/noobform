import { Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  role: string;
  banned: boolean;
  createdAt: Date;
  subscriptionPlan: string;
  customerId?: string;
  subscriptionId?: string;
  billingInterval?: string;
  status?: string;
  billingStart?: Date;
  billingEnd?: Date;
  planCanceled: boolean;
  provider: string;
  lastLogin?: Date;
}

export interface UserTableProps {
  initialUsers: IUser[];
  totalUsers: number
}