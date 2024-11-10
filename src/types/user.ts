import { Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  createdAt: string; // ISO date string
  subscriptionPlan: string;
  customerId: string;
  subscriptionId: string;
  billingInterval: string;
  status: string;
  billingStart: string; // ISO date string
  billingEnd: string; // ISO date string
  planCanceled: boolean;
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