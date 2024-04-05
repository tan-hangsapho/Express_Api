import { PaginateType } from "../@types/repository-type";
import { Movie, Options, movieModel } from "../models/movie";

class MovieRepository {
  async findbyId(id: string): Promise<Movie | null> {
    return await movieModel.findById(id);
  }

  // Asynchronous function to find movies with pagination
  async find(
    options: Options
  ): Promise<{ data: Movie[]; pagination: PaginateType }> {
    // Destructure options with default values
    const { page = 1, limit = 10 } = options;
    // Calculate the skip value for pagination (number of documents to skip)
    const skip = (page - 1) * limit;
    // Execute two queries in parallel using Promise.all
    const [movies, totalDocuments] = await Promise.all([
      movieModel.aggregate([{ $skip: skip }, { $limit: limit }]),
      movieModel.countDocuments(),
    ]);
    // Return an object containing the fetched movies and pagination dataS
    return {
      data: movies,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalDocuments / limit),
        totalDocuments,
      },
    };
  }

  async create(movie: Movie) {
    const newMovie = new movieModel(movie);
    return await newMovie.save();
  }
  async updateById(id: string, updateData: object): Promise<Movie | null> {
    return movieModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteById(id: string): Promise<Movie | null> {
    return movieModel.findByIdAndDelete(id);
  }
}

export { MovieRepository };
