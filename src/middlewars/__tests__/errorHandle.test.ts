import { NextFunction, Request, Response } from "express";
import { ErrorStateCode } from "../../utils/errorState";
import errorHandler from "../errorhandle";
describe("errorHandler middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("should handle ErrorStateCode error", () => {
    const err = new ErrorStateCode("Not Found", 404);

    errorHandler(err as Error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Not Found",
      statusCode: 404,
    });
    expect(next).toHaveBeenCalled();
  });
  it("should call next if error is not an instance of ErrorStateCode", () => {
    const err = new Error("Internal Server Error");

    errorHandler(err, req as Request, res as Response, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
