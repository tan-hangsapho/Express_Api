import express, { NextFunction, Request } from "express";
import { movieSchema } from "../../schema/validate-schema";
import { MovieController } from "../../controllers/movies-controller";
import { StatusCode } from "../../utils/consts";
import { Options, movieModel } from "../../database/models/movie";
import { validate } from "../../middlewars/validation";

export const movieRouter = express.Router();

movieRouter.post(
  "/create",
  validate(movieSchema),
  async (req: Request, res, _next) => {
    try {
      const controllers = new MovieController();
      const requestBody = req.body;
      const response = await controllers.createMovie(requestBody);
      return res
        .status(StatusCode.Created)
        .send({ message: "Create Success", data: response });
    } catch (err) {
      _next(err);
    }
  }
);
movieRouter.get("/get", async (req, res, next: NextFunction) => {
  try {
    const controllers = new MovieController();
    const { page = 1, limit = 5 } = req.query;
    const options: Options = {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
    };
    const movies = await controllers.getAllMovies(options);
    res.status(StatusCode.OK).json({ message: "Get Success", data: movies });
  } catch (err) {
    next(err);
  }
});
movieRouter.get("/:id", async (req, res, next: NextFunction) => {
  try {
    const controllers = new MovieController();
    const { id } = req.params;
    const movies = await controllers.getById(id);
    if (!movies) {
      throw new Error("User not found");
    }
    res.status(StatusCode.Found).json({ message: "Get Success", data: movies });
  } catch (err) {
    next(err);
  }
});
movieRouter.put("/:id", async (req, res, next: NextFunction) => {
  try {
    const controllers = new MovieController();
    const id = req.params.id;
    const requestBody = req.body;
    const movies = await controllers.updateMovie(id, requestBody); // Pass both id and requestBody
    res.status(StatusCode.OK).json({ message: "Update Successfully", movies });
  } catch (err) {
    next(err);
  }
});
movieRouter.delete("/:id", async (req, res, next: NextFunction) => {
  try {
    const { id } = req.params;
    const controllers = new MovieController();
    const response = await controllers.deleteMovie(id);
    res
      .status(StatusCode.OK)
      .json({ message: "Delete success", data: response });
  } catch (err) {
    console.error("Error deleting movie with ID:", req.params.id, err);
    next(err);
  }
});
