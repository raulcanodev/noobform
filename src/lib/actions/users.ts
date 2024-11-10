'use server'

import { mongooseConnection } from "@/lib/db/mongoclient"
import { revalidatePath } from "next/cache"
import { User } from "@/models/User"
import { IUser } from "@/types/user"

// Ensure mongoose connection is established
mongooseConnection.then(() => console.log('Mongoose connected')).catch(err => console.error('Mongoose connection error:', err))

export async function getUsers(page: number, pageSize: number, searchTerm: string = '') {
  const skip = (page - 1) * pageSize

  const query = searchTerm
    ? { $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } }
      ]}
    : {}

  const users = await User.find(query)
    .skip(skip)
    .limit(pageSize)
    .lean()

  return users.map(user => ({
    _id: user._id ? user._id.toString() : 'N/A',
    name: user.name || 'N/A',
    email: user.email || 'N/A',
    role: user.role || 'N/A',
    banned: user.banned || false,
    createdAt: user.createdAt || 'N/A',
    subscriptionPlan: user.subscriptionPlan || 'N/A',
    customerId: user.customerId || 'N/A',
    subscriptionId: user.subscriptionId || 'N/A',
    billingInterval: user.billingInterval || 'N/A',
    status: user.status || 'N/A',
    billingStart: user.billingStart || 'N/A',
    billingEnd: user.billingEnd || 'N/A',
    planCanceled: user.planCanceled || false,
    provider: user.provider || 'N/A',
    lastLogin: user.lastLogin || 'N/A',
  }))
}

export async function searchUsers(searchTerm: string, page: number, pageSize: number) {
  return getUsers(page, pageSize, searchTerm)
}

export async function getTotalUsers(searchTerm: string = '') {
  const query = searchTerm
    ? { $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } }
      ]}
    : {}

  return User.countDocuments(query)
}

export async function deleteUser(userId: string) {
  const result = await User.findByIdAndDelete(userId)

  if (!result) {
    throw new Error("User not found or delete operation failed")
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function updateUser(userId: string, updateData: Partial<IUser>): Promise<IUser | null> {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    )

    if (updatedUser) {
      revalidatePath('/profile')
    }

    return updatedUser
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}