import express, { Request, Response, NextFunction } from "express";
import { UserSignInSchema, UserSignUpSchema } from "../../schema/user-schema";
import { UserController } from "../../controllers/user-controller";
import { StatusCode } from "../../utils/consts";
import { validate } from "../../middlewars/validation";
import CustomError from "../../error/custom-error";
export const userRouter = express.Router();
const controllers = new UserController();

userRouter.post(
  "/signup",
  validate(UserSignUpSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestBody = req.body;
      await controllers.RegisterUser(requestBody);
      return res.status(StatusCode.Created).send({ message: "Create Success" });
    } catch (error: any) {
      res.status(StatusCode.Found).json({ message: error.message });
    }
  }
);
userRouter.get(
  "/verify",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.query.token as string; // Assuming the token is passed as a query parameter
      await controllers.VerifyEmail(token);
      return res.status(StatusCode.Found).json("Successfully verifiy");
    } catch (error: any) {
      res.status(StatusCode.BadRequest).json({ message: error.message });
    }
  }
);

userRouter.post("/login", validate(UserSignInSchema), async (req, res) => {
  try {
    const requestBody = req.body;
    const token = await controllers.LoginWithEmail(requestBody);
    return res.status(StatusCode.OK).json({ message: "Login Success" });
  } catch (error: any) {
    let statusCode = StatusCode.BadRequest; // Default status code for validation errors
    if (error instanceof CustomError) {
      statusCode = error.statusCode; // Use the status code from the CustomError if available
    }
    res.status(statusCode).json({ message: error.message });
  }
});
