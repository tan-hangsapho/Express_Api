import mongoose, { Schema } from "mongoose";

export interface Movie {
  _id?: mongoose.Types.ObjectId; // Custom _id field
  movieName: string;
  userName: string;
  released_on: Date;
}
export interface Options {
  page: number;
  limit: number;
}
//Schema is something body of the database
const MovieSchema: Schema<Movie> = new Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // Custom _id field
  movieName: { type: String, trim: true, required: true },
  userName: { type: String, trim: true, required: true },
  released_on: { type: Date, trim: true, default: Date.now },
});
export const movieModel = mongoose.model<Movie>("Movie", MovieSchema);
