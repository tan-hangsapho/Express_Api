import {
  Route,
  Post,
  Body,
  Get,
  Put,
  Path,
  Delete,
  SuccessResponse,
  Queries,
  Tags,
  Controller,
} from "tsoa";
import { Movie, Options } from "../database/models/movie";
import { MovieService } from "../service/movie-service";
import { ErrorStateCode } from "../utils/errorState";
import { StatusCode } from "../utils/consts";

@Route("movie")
@Tags("Movies")
export class MovieController extends Controller {
  private movieService: MovieService;
  constructor() {
    super();
    this.movieService = new MovieService();
  }

  @Post("/create")
  public async createMovie(@Body() requestBody: Movie): Promise<any> {
    try {
      const { movieName, userName, released_on } = requestBody;
      const newMovie = await this.movieService.create({
        movieName,
        userName,
        released_on,
      });
      await newMovie.save();
      return newMovie;
    } catch (err) {
      throw err;
    }
  }
  @Get("/get")
  public async getAllMovies(@Queries() options: Options): Promise<any> {
    try {
      const movies = await this.movieService.getAll(options);

      return movies;
    } catch (error) {
      throw new ErrorStateCode("Failed to retrieve movie list", 500);
    }
  }
  @Get("/:id")
  public async getById(@Path() id: string): Promise<Movie> {
    try {
      const movie = await this.movieService.getById(id);
      if (movie === null) {
        throw new Error("Movie not found");
      }
      return movie;
    } catch (error) {
      throw error;
    }
  }
  @Put("{id}")
  public async updateMovie(
    @Path() id: string,
    @Body() requestBody: Movie
  ): Promise<Movie> {
    try {
      const { movieName, userName, released_on } = requestBody;
      const updatedMovie = await this.movieService.updateById(id, {
        movieName,
        userName,
        released_on,
      });
      if (updatedMovie === null) {
        throw new ErrorStateCode(`Movie with id ${id} not found`, 404);
      }
      return updatedMovie;
    } catch (err) {
      throw err;
    }
  }
  @Delete("/:id")
  @SuccessResponse(StatusCode.Found, "Movie deleted") // 204 No Content is more typical for DELETE
  public async deleteMovie(@Path() id: string): Promise<Movie | null> {
    try {
      const deletedMovie = await this.movieService.deleteById(id);
      return deletedMovie;
    } catch (error) {
      throw new Error("An error occurred while deleting the movie");
    }
  }
}
