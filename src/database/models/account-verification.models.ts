import mongoose, { Document, Model } from "mongoose";

export interface IAccountVerificationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  emailVerificationToken: string;
  timestamp: Date;
}

export interface IAccountVerificationModel
  extends Model<IAccountVerificationDocument> {}

const accountVerificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  emailVerificationToken: {
    type: String,
    required: true,
    validate: (value: string): boolean => {
      if (!value) {
        throw new Error("Invalid email verification token");
      }
      return true;
    },
  },
  timestamp: { type: Date, default: Date.now }, // Add timestamp field with default value of current date/time
});

const AccountVerificationModel = mongoose.model<
  IAccountVerificationDocument,
  IAccountVerificationModel
>("AccountVerification", accountVerificationSchema);

export default AccountVerificationModel;
