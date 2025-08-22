import mongoose, { Document, Schema } from 'mongoose';

export interface IEmailSubscription extends Document {
  email: string;
  isSubscribed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const emailSubscriptionSchema = new Schema<IEmailSubscription>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    isSubscribed: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const EmailSubscription: mongoose.Model<IEmailSubscription> =
  mongoose.models.EmailSubscription ||
  mongoose.model<IEmailSubscription>('EmailSubscription', emailSubscriptionSchema);

export default EmailSubscription;
