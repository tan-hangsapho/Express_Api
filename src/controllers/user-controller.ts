import {
  Body,
  Post,
  Query,
  Route,
  SuccessResponse,
  Get,
  Tags,
  Controller,
  Middlewares,
} from "tsoa";
import { IUser } from "../database/models/user.model";
import { StatusCode } from "../utils/consts";
import { AuthService } from "../service/user-service";
import { generateSignature } from "../utils/jwt";
import { generateEmailVerificationToken } from "../utils/account-verification";
import { publicDecrypt } from "crypto";
import { UserSignInSchema } from "../schema/user-schema";
import { validate } from "../middlewars/validation";
import CustomError from "../error/custom-error";

interface SignUpRequestBody {
  username: string;
  email: string;
  password: string;
}

interface LoginRequestBody {
  email: string;
  password: string;
}

@Route("user")
@Tags("Users")
export class UserController extends Controller {
  private userService: AuthService;
  constructor() {
    super();
    this.userService = new AuthService();
  }
  @SuccessResponse(StatusCode.Created, "Created")
  @Post("/signup")
  public async RegisterUser(
    @Body() requestBody: SignUpRequestBody
  ): Promise<IUser> {
    try {
      const { username, email, password } = requestBody;
      const newUser = await this.userService.SignUp({
        username,
        email,
        password,
      });

      await this.userService.SendVerifyEmailToken({
        userId: newUser._id,
      });
      return newUser;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  @SuccessResponse(StatusCode.OK, "OK")
  @Get("/verify")
  public async VerifyEmail(@Query() token: string): Promise<{ token: string }> {
    try {
      // Verify the email token
      const user = await this.userService.VerifyEmailToken(token);

      // Generate JWT for the verified user
      const jwtToken = await generateSignature({
        userId: user._id,
      });
      return { token: jwtToken };
    } catch (error) {
      throw error;
    }
  }

  @SuccessResponse(StatusCode.OK, "OK")
  @Post("/login")
  @Middlewares(validate(UserSignInSchema))
  public async LoginWithEmail(
    @Body() requestBody: LoginRequestBody
  ): Promise<{ token: string }> {
    try {
      const { email, password } = requestBody;
      // Call the userService to perform the login operation
      const jwtToken = await this.userService.Login({ email, password });
      console.log(jwtToken);
      if (!jwtToken) {
        // Handle failed login with a specific error
        throw new CustomError(
          "email or password is incorrect",
          StatusCode.Unauthorized
        );
      }
      // Return the JWT token in the response
      return {
        token: jwtToken,
      };
    } catch (error) {
      // Handle specific error types
      if (error instanceof CustomError) {
        // More fine-grained status codes based on CustomError type
        throw error;
      } else {
        console.error("Unexpected error:", error);
        throw new CustomError("Login failed", StatusCode.InternalServerError);
      }
    }
  }
}
