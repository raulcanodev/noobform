'use server'

import { mongooseConnection } from "@/lib/db/mongoclient"
import { revalidatePath } from "next/cache"
import { User } from "@/models/User"

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
    name: user.name || 'N/A',
    email: user.email || 'N/A',
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

export async function createUser(userData: Partial<IUser>): Promise<IUser> {
  const newUser = new User(userData)
  await newUser.save()
  return newUser
}

export async function updateUser(userId: string, updateData: Partial<User>): Promise<User | null> {
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true }
  )
  return updatedUser
}