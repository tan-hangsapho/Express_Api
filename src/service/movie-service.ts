import { Movie, Options } from "../database/models/movie";
import { MovieRepository } from "../database/repository/movie-Repository";

export class MovieService {
  repo: MovieRepository;

  constructor() {
    this.repo = new MovieRepository();
  }
  async getById(movieId: string) {
    return this.repo.findbyId(movieId);
  }
  async getAll(options: Options) {
    return await this.repo.find(options);
  }
  async create(movie: Movie) {
    return await this.repo.create(movie);
  }
  async updateById(movieId: string, updateData: object) {
    return await this.repo.updateById(movieId, updateData);
  }
  async deleteById(movieId: string) {
    return await this.repo.deleteById(movieId);
  }
}
