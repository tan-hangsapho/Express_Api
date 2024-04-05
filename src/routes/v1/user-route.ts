import express, { Request, Response, NextFunction } from "express";
import { UserSignInSchema, UserSignUpSchema } from "../../schema/user-schema";
import { UserController } from "../../controllers/user-controller";
import { StatusCode } from "../../utils/consts";
import { validate } from "../../middlewars/validation";
export const userRouter = express.Router();

userRouter.post(
  "/signup",
  validate(UserSignUpSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const controllers = new UserController();
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
      const controllers = new UserController();
      const token = req.query.token as string; // Assuming the token is passed as a query parameter
      await controllers.VerifyEmail(token);

      return res.status(StatusCode.Found).json("User already verified");
    } catch (error: any) {
      res.status(StatusCode.BadRequest).json({ message: error.message });
    }
  }
);

// userRouter.post("/login", validate(UserSignInSchema), async (req, res) => {
//   try {
//     const controllers = new UserController();
//     const requestBody = req.body;
//     const response = await controllers.LoginWithEmail(requestBody);
//     return res
//       .status(StatusCode.Created)
//       .send({ message: "Login Success", data: response });
//   } catch (error: any) {
//     res.status(StatusCode.NotFound).json({ message: error.message });
//   }
// });
