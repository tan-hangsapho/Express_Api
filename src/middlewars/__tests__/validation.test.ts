import { NextFunction, Request, Response } from "express";
import { userSchema } from "../../schema/validate-schema";
import { validate } from "../validation";
import InvalidInputError from "../../error/invalid-input-error";

const validUserData = {
  movieName: "Test Movie",
  userName: "ValidUser",
  released_on: new Date(),
};

const invalidUserData = {
  movieName: "123", // Too short movie name
  userName: "ok", // Too short username
  released_on: "not-a-valid-date",
};

describe("Validation Middleware Tests", () => {
  let res: Partial<Response>;
  let next: NextFunction;

  beforeAll(() => {
    res = {};
  });

  beforeEach(() => {
    next = jest.fn();
  });

  it("should run next() if the validation is successful", async () => {
    res = {};
    next = jest.fn();

    const req: Partial<Request> = {
      body: validUserData,
    };
    await validate(userSchema)(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith();
    expect(next).toHaveBeenCalledTimes(1); // Ensure that next is called exactly once
  });
  test("should call next() with an InvalidInputError for invalid input", async () => {
    res = {};
    next = jest.fn();

    const req: Partial<Request> = {
      body: invalidUserData,
    };

    await validate(userSchema)(
      req as Request,
      res as Response,
      next as NextFunction
    );

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(expect.any(InvalidInputError));
  });
});
