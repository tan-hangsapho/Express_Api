require("dotenv").config();
import AccountVerificationModel from "../database/models/account-verification.models";
import { IUser } from "../database/models/user.model";
import { AccountVerificationRepository } from "../database/repository/account-verification-repos";
import { UserRepository } from "../database/repository/user-Repository";
import CustomError from "../error/custom-error";
import {
  UserSchemaType,
  UserSignInSchemaType,
} from "../schema/@types/userSchema.type";
import { generateEmailVerificationToken } from "../utils/account-verification";
import { StatusCode } from "../utils/consts";
import {
  generatePassword,
  generateSignature,
  validationPassword,
} from "../utils/jwt";
import { UserSignUpResult } from "./@types/serviceUser.type";
import nodemailer from "nodemailer";
export class AuthService {
  private userRepo: UserRepository;
  private accountVerificationRepo: AccountVerificationRepository;

  constructor() {
    this.userRepo = new UserRepository();
    this.accountVerificationRepo = new AccountVerificationRepository();
  }

  async SignUp(userDetails: UserSchemaType): Promise<UserSignUpResult> {
    try {
      const { username, email, password } = userDetails;

      // Convert User Password to Hash Password
      const hashedPassword = await generatePassword(password);

      // Save User to Database
      const newUser = await this.userRepo.createUser({
        username,
        email,
        password: hashedPassword,
      });
      // Return Response
      return newUser;
    } catch (error: unknown) {
      throw error;
    }
  }
  async SendVerifyEmailToken({ userId }: { userId: string }) {
    try {
      const generateToken = generateEmailVerificationToken();
      const accountVerification = new AccountVerificationModel({
        userId,
        emailVerificationToken: generateToken,
      });

      await accountVerification.save();
      const existedUser = await this.userRepo.FindUserById({ id: userId });
      if (!existedUser) {
        throw new CustomError("User does not exist!", StatusCode.NotFound);
      }
      return await this.sendVerificationEmail(existedUser, generateToken);
    } catch (error) {
      throw error;
    }
  }

  async sendVerificationEmail(user: IUser, verificationToken: string) {
    try {
      // Create transporter
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.USER,
          pass: process.env.PASS,
        },
      });

      // Construct email options
      const mailOptions: nodemailer.SendMailOptions = {
        from: process.env.USER,
        to: user.email,
        subject: "Verify Your Email",
        html: `
          <p>Hello ${user.username},</p>
          <p>Please click the following link to verify your email:</p>
          <p><a href="http://localhost:3000/user/verify?token=${verificationToken}">Verify Email</a></p>
        `,
      };

      // Send email
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent:", info.response);
      return info;
    } catch (error) {
      // Handle error
      console.error("Error sending email:", error);
      throw new CustomError(
        "Failed to send verification email.",
        StatusCode.BadRequest
      );
    }
  }
  async VerifyEmailToken(token: string) {
    try {
      // Find the account verification entry in the database using the token
      const accountVerification =
        await this.accountVerificationRepo.FindAccountVerificationToken({
          token,
        });
      if (!accountVerification) {
        throw new CustomError(
          "Verification token is invalid",
          StatusCode.NotFound
        ); // Token verification failed
      }
      // Convert the userId to string
      const user = await this.userRepo.FindUserById({
        id: accountVerification.userId.toString(),
      });
      // Fetch the user using the converted userId
      if (!user) {
        throw new CustomError("User not found", StatusCode.NotFound);
      }
      // Update the user's isVerified status to true
      user.isVerified = true;
      await user.save();
      // Delete the account verification entry
      await this.accountVerificationRepo.deleteAccountVerification({
        token: accountVerification.emailVerificationToken,
      });

      return user;
    } catch (error) {
      console.error("Error verifying token:", error);
      throw new CustomError("Failed to verify token.", StatusCode.NotFound);
    }
  }
  async Login(userDetails: UserSignInSchemaType): Promise<string> {
    try {
      // Call the user repository to find the user by email
      const user = await this.userRepo.FindEmailUser({
        email: userDetails.email,
      });

      if (!user) {
        throw new CustomError("User not found", StatusCode.NotFound);
      }

      // Check if the provided password matches the user's password
      const isPasswordValid = await validationPassword({
        enterPassword: userDetails.password,
        savedPassword: user.password as string,
      });

      if (!isPasswordValid) {
        throw new CustomError(
          "Invalid email or password", // Generic, for security
          StatusCode.Unauthorized
        );
      }

      // If authentication succeeds, generate a JWT token
      const token = await generateSignature({ userId: user._id });
      return token;
    } catch (error) {
      console.error("Error logging in:", error);
      throw new CustomError(
        "Email and password are incorrect",
        StatusCode.Unauthorized
      );
    }
  }
}
