import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

export const validateMongooseId = (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const { movieId } = req.params;

  if (!mongoose.isValidObjectId(movieId)) {
    _next(new Error("Invalid Id"));
  }
  _next();
};
