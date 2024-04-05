import mongoose, { Document, Model } from "mongoose";

export interface IUser {
  username: string;
  email: string;
  password: string;
  isVerified: boolean;
}

export interface IUserDocument extends Document {
  username: string;
  email: string;
  password: string;
  isVerified: boolean;
}


export interface IUserModel extends Model<IUserDocument> {}

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.password; // Remove 'password' field
        delete ret.salt; // Remove 'salt' field
        delete ret.__v; // Remove '__v' field
      },
    },
  }
);
const UserModel = mongoose.model<IUserDocument, IUserModel>("User", userSchema);
export default UserModel;
