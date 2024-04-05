import express, { NextFunction, Request, Response } from "express";
import { requestTime } from "./middlewars/requestTime";
import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from "../dist/swagger/swagger.json";
import errorHandler from "./middlewars/errorhandle";
import { RegisterRoutes } from "./routes/routes";
import { movieRouter } from "./routes/v1/movie-route";
import { userRouter } from "./routes/v1/user-route";
function createServer() {
  const app = express();
  // Middleware
  app.use(express.json());
  app.use("/movie", movieRouter);
  app.use("/user", userRouter);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  // Routes
  RegisterRoutes(app);
  // Catch-all route for handling unknown routes
  app.all("*", (req: Request, res: Response, _next: NextFunction) => {
    _next(new Error(`page could be not found!`));
  });
  app.use(errorHandler);
  return app;
}
export default createServer();
