import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { Movie, movieModel } from "../models/movie";
import { MovieRepository } from "../repository/movie-Repository";
import { ObjectId } from "mongodb";
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
describe("MovieRepository", () => {
  let repository: MovieRepository;

  beforeEach(async () => {
    repository = new MovieRepository();
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
  });

  describe("create movie", () => {
    it("should create a new movie", async () => {
      const newMovieData = {
        _id: new ObjectId(),
        movieName: "Test Movie 1",
        userName: "Test User 1",
        released_on: new Date("3-21-2024"),
      } as Movie;
      const newMovie = await repository.create(newMovieData);
      expect(newMovie).toBeDefined();
      expect(newMovie.movieName).toEqual(newMovieData.movieName);
      expect(newMovie.userName).toEqual(newMovieData.userName);
    });
    it("should return all user", async () => {
      const newMovieData1 = {
        _id: new ObjectId(),
        movieName: "Test Movie 1",
        userName: "Test User 1",
        released_on: new Date("3-21-2024"),
      };
      const newMovieData2 = {
        _id: new ObjectId(), // Use a different ObjectId
        movieName: "Test Movie 2",
        userName: "Test User 2",
        released_on: new Date("3-21-2024"),
      };
      await repository.create(newMovieData1);
      await repository.create(newMovieData2);
      const allMovies = await repository.find();
      expect(allMovies.length).toBe(2);
    });
    it("get movie by id should return movie ID", async () => {
      const MovieData = {
        _id: new ObjectId(), // Correct type
        movieName: "Test Movie",
        userName: "Test User",
        released_on: new Date("3-21-2024"),
      };
      // Convert ObjectId to string
      const idString = MovieData._id.toString();

      // Mock the findById method to resolve with MovieData
      jest.spyOn(movieModel, "findById").mockResolvedValue(MovieData);

      // Call the repository method with the converted string ID
      const result = await repository.findById(idString);

      // Assert that findById was called with the correct ID
      expect(movieModel.findById).toHaveBeenCalledWith(idString);

      // Assert that the result matches MovieData
      expect(result).toEqual(MovieData);
    });
    it("should update a movie and return the updated document", async () => {
      // 1. Create a test movie
      const existingMovieData = {
        _id: new ObjectId(),
        movieName: "Test Movie",
        userName: "Test User ",
        released_on: new Date("3-21-2024"),
      } as Movie;
      const createdMovie = await repository.create(existingMovieData);

      // Ensure createdMovie is not null or undefined
      if (!createdMovie) {
        throw new Error("Failed to create movie");
      }

      const updateData = {
        movieName: "Updated Movie Name",
      };

      // 3.  Call  updateById
      const updatedMovie = await repository.updateById(
        createdMovie.id,
        updateData
      );

      expect(updatedMovie).toBeDefined();
      expect(updatedMovie?.movieName).toEqual(updateData.movieName);
    });
    it("should delete a movie from the database", async () => {
      // 1. Create a Test Movie
      const movieData1 = {
        _id: new ObjectId(),
        movieName: "Test Movie",
        userName: "Test User",
        released_on: new Date("3-21-2024"),
      } as Movie;
      const createdMovie = await repository.create(movieData1);

      // 2. Delete the movie
      await repository.deleteById(createdMovie.id ?? "default-id");

      // 3. Try to find the deleted movie
      const deletedMovie = await movieModel.findOne({
        _id: createdMovie.id,
      });

      // 4. Ensure that the deleted movie does not exist
      expect(deletedMovie).toBeNull();
    });
  });
});
