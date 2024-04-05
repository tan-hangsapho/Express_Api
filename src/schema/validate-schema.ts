import { z } from "zod";

export const movieSchema = z.object({
  movieName: z.string().min(4, "movie name must be at least 4 characters"),
  userName: z.string().min(4, "username must be at least 4 characters"),
  released_on: z.preprocess((arg) => {
    if (typeof arg == "string") return new Date(arg);
    return arg;
  }, z.date()),
});
