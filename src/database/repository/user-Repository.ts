import UserModel, { IUser } from "../models/user.model";
import { UserCreateRepository } from "./@types/user-Repository";
interface UpdateVerificationTokenData {
  email: string;
  verificationToken: string;
}
export class UserRepository {
  async createUser({ username, email, password }: UserCreateRepository) {
    try {
      const existingUser = await this.FindUser({ email });
      if (existingUser) {
        throw new Error("Please,verifiy your email");
      }
      const user = new UserModel({
        username,
        email,
        password,
      });
      const userResult = await user.save();
      return userResult;
    } catch (err) {
      throw err;
    }
  }
  async FindUser({ email }: { email: string }) {
    try {
      const existingUser = await UserModel.findOne({ email: email });
      return existingUser;
    } catch (err) {
      return null;
    }
  }
  async FindUserById({ id }: { id: string }) {
    try {
      const existingUser = await UserModel.findById(id);

      return existingUser;
    } catch (error) {
      throw new Error("Unable to Find User in Database");
    }
  }
  async findUserByUsernameOrEmail(
    usernameOrEmail: string
  ): Promise<IUser | null> {
    // Search for a user by username or email
    const user = await UserModel.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    return user;
  }
  async updateVerificationToken(
    data: UpdateVerificationTokenData
  ): Promise<void> {
    try {
      const { email, verificationToken } = data;
      // Ensure your verificationToken is generated as a string before this point
      await UserModel.updateOne({ email }, { $set: { verificationToken } });
    } catch (error) {
      console.error("Error updating verification token:", error);
      throw new Error("Failed to update verification token");
    }
  }
}
