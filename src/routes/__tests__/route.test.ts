import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import createServer from "../../server";
import { Movie } from "../../database/models/movie";
import { MovieRepository } from "../../database/repository/movie-Repository";
import supertest from "supertest";
const app = createServer;
describe("movie route", () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });
  let repository: MovieRepository;
  beforeEach(async () => {
    repository = new MovieRepository();
  });

  describe("GET /movie/:movieId", () => {
    describe("given movie", () => {
      describe("should be return the movie that does not exist ", () => {
        it("should return a 404", async () => {
          const moveid = "movie-123";
          await supertest(app).get(`/movie/${moveid}`).expect(404);
        });
      });
      describe("should be return the movie that does exist ", () => {
        it("should return a 200 status and the movie", async () => {
          const movieData1 = {
            movieName: "Test Movie",
            userName: "Test User",
            released_on: new Date("3-21-2024"),
          } as Movie;
          const existingMovie = await repository.create(movieData1);

          const response = await supertest(app).get(
            `/movie/${existingMovie._id}`
          );

          expect(response.statusCode).toBe(200);
          expect(response.body.data).toEqual(
            // Assuming 'data' is the top-level property
            expect.objectContaining({
              // and that it contains the movie object
              movieName: existingMovie.movieName,
              userName: existingMovie.userName, // Corrected
              released_on: existingMovie.released_on.toISOString(), // Convert to ISO String
            })
          );
        });
      });
      describe("POST /", () => {
        it("should create a new user when provided with valid input", async () => {
          const newMovieData = {
            movieName: "Test Movie 1",
            userName: "Test User 1",
            released_on: new Date("3-21-2024"),
          } as Movie;
          const response = await request(app)
            .post("/")
            .send(newMovieData)
            .expect(200);

          expect(response.body.data.movieName).toBe(newMovieData.movieName);
          expect(response.body.data.userName).toBe(newMovieData.userName);
          expect(response.body.data.released_on).toBe(newMovieData.released_on);
        }, 50000);
      });
    });
  });
});
