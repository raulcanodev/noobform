import { Schema, model, models } from "mongoose";
import { IUser } from "@/types/user";

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false, // This ensures the password isn't returned in queries by default
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    avatar: {
      type: String,
      default: 'default-avatar.png', // You can set a default avatar image
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    premium: {
      type: Boolean,
      default: false,
    },
    emailVerified: {
      type: Date,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Add any pre-save hooks, methods, or statics here
UserSchema.pre('save', function(next) {
  // You can add logic here, for example, to hash the password before saving
  // if (this.isModified('password')) {
  //   this.password = hashPassword(this.password);
  // }
  next();
});

// Removing the password field when returning user objects for security
UserSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

export const User = models.User || model<IUser>('User', UserSchema);