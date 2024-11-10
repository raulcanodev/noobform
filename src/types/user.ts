import { Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  email: string;
  password?: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin';
  premium: boolean;
  emailVerified?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAdminPanelProps {
  _id?: string;
  name: string;
  email: string;
}

export interface UserTableProps {
  initialUsers: UserAdminPanelProps[];
  totalUsers: number
}