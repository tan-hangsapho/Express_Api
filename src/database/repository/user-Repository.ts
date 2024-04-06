import CustomError from "../../error/custom-error";
import { StatusCode } from "../../utils/consts";
import UserModel, { IUser } from "../models/user.model";
import { UserCreateRepository } from "./@types/user-Repository";
interface UpdateVerificationTokenData {
  email: string;
  verificationToken: string;
}
export class UserRepository {
  async createUser({ username, email, password }: UserCreateRepository) {
    try {
      const existingUser = await this.FindEmailUser({ email });
      if (existingUser) {
        throw new CustomError("Please,verifiy your email", StatusCode.Found);
      } else if (existingUser === email) {
        throw new CustomError(
          "Account already exist,Please,verifiy your email",
          StatusCode.Found
        );
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
  async FindEmailUser({ email }: { email: string }) {
    try {
      const existingUser = await UserModel.findOne({ email });
      return existingUser; // If user not found, this will return null
    } catch (err) {
      console.error("Error finding user by email:", err);
      throw new CustomError(
        "Failed to find user by email",
        StatusCode.InternalServerError
      );
    }
  }

  async FindUserById({ id }: { id: string }) {
    try {
      const existingUser = await UserModel.findById(id);

      return existingUser;
    } catch (error) {
      throw new CustomError(
        "Unable to Find User in Database",
        StatusCode.InternalServerError
      );
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
      throw new CustomError(
        "Failed to update verification token",
        StatusCode.Unauthorized
      );
    }
  }
}
