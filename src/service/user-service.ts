require("dotenv").config();
import AccountVerificationModel from "../database/models/account-verification.models";
import { IUser } from "../database/models/user.model";
import { AccountVerificationRepository } from "../database/repository/account-verification-repos";
import { UserRepository } from "../database/repository/user-Repository";
import {
  UserSchemaType,
  UserSignInSchemaType,
} from "../schema/@types/userSchema.type";
import { generateEmailVerificationToken } from "../utils/account-verification";
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
        throw new Error("User does not exist!");
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
      throw new Error("Failed to send verification email.");
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
        throw new Error("Verification token is invalid"); // Token verification failed
      }
      // Convert the userId to string
      const user = await this.userRepo.FindUserById({
        id: accountVerification.userId.toString(),
      });
      // Fetch the user using the converted userId
      if (!user) {
        throw new Error("User not found");
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
      throw new Error("Failed to verify token.");
    }
  }

  async Login(userDetails: UserSignInSchemaType) {
    const user = await this.userRepo.FindUser({ email: userDetails.email });

    if (!user) {
      throw new Error("User not exist");
    }
    const isPwdCorrect = await validationPassword({
      enterPassword: userDetails.password,
      savedPassword: user.password as string,
    });

    if (!isPwdCorrect) {
      throw new Error("Email or Password is incorrect");
    }
    const token = await generateSignature({ userId: user._id });

    return token;
  }
}
