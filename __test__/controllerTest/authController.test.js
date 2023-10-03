import { registerUser } from "../../controllers/authController";
import { loginUser } from "../../controllers/authController";
import bcrypt from "bcryptjs";
import User from "../../models/users";

const helpers = require("../../utils/helpers.js");

// Create a mock function for the getJwtToken method and set the return value to jwt_token
helpers.getJwtToken = jest.fn(() => "jwt_token");

const mockedRequest = () => {
  return {
    body: {
      name: "unyime",
      email: "unyime@gmail.com",
      password: "123456",
    },
  };
};

const mockedResponse = () => {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
};

const mockedUser = {
  _id: "12345",
  name: "unyime",
  email: "unyime@gmail.com",
  password: "hashedPassword",
};

const mockedUserLogin = {
  email: "unyime@gmail.com",
  password: "123456",
};

afterEach(() => {
  // reset all mocks created with spyOn method
  jest.restoreAllMocks();
});

describe("register user", () => {
  it("should register user", async () => {
    //mocks and set the values for hash and create methods
    jest.spyOn(bcrypt, "hash").mockResolvedValueOnce("hashedPassword");
    jest.spyOn(User, "create").mockResolvedValueOnce(mockedUser);

    //calls both function so that the actual return value can be used
    const mockedReq = mockedRequest();
    const mockedRes = mockedResponse();

    //calls the registerUser function with mocked parameters
    await registerUser(mockedReq, mockedRes);

    expect(mockedRes.status).toHaveBeenCalledWith(201);
    expect(bcrypt.hash).toHaveBeenCalledWith("123456", 10);
    expect(User.create).toHaveBeenLastCalledWith({
      name: "unyime",
      email: "unyime@gmail.com",
      password: "hashedPassword",
    });
    // Assert that the response JSON contains the expected data
    expect(mockedRes.json).toHaveBeenCalledWith({ token: "jwt_token" });
  });

  it("should throw validation error", async () => {
    const mockedReq = (mockedRequest().body = {
      body: {},
    });
    const mockedRes = mockedResponse();
    // console.log("body: ", mockedReq.body);

    //calls the registerUser function with mocked parameters
    await registerUser(mockedReq, mockedRes);

    expect(mockedRes.status).toHaveBeenLastCalledWith(400);
    expect(mockedRes.json).toHaveBeenCalledWith({
      error: "Please enter all values",
    });
  });

  it("should throw duplicate email entered error", async () => {
    jest.spyOn(bcrypt, "hash").mockResolvedValueOnce("hashedPassword");
    jest.spyOn(User, "create").mockRejectedValueOnce({ code: 11000 });
    const mockedReq = mockedRequest();
    const mockedRes = mockedResponse();

    await registerUser(mockedReq, mockedRes);

    expect(mockedRes.status).toHaveBeenCalledWith(400);
    expect(mockedRes.json).toHaveBeenCalledWith({
      error: "Duplicate email",
    });
  });
});

describe("login user", () => {
  it("should throw missing email or password error", async () => {
    const mockedReq1 = (mockedRequest().body = {
      body: { email: "unyime@gmail.com" },
    });
    const mockedReq2 = (mockedRequest().body = {
      body: { password: "hashedPassword" },
    });
    const mockedRes = mockedResponse();

    await loginUser(mockedReq2, mockedRes);

    expect(mockedRes.status).toHaveBeenCalledWith(400);
    expect(mockedRes.json).toHaveBeenCalledWith({
      error: "Please enter email & Password",
    });
  });

  it("should throw 'invalid email or password' when the provided email is not found", async () => {
    jest.spyOn(User, "findOne").mockImplementationOnce(() => ({
      select: jest.fn().mockResolvedValueOnce(null),
    }));

    const mockedReq = (mockedRequest().body = { body: mockedUserLogin });
    const mockedRes = mockedResponse();

    await loginUser(mockedReq, mockedRes);

    expect(mockedRes.status).toHaveBeenCalledWith(401);
    expect(mockedRes.json).toHaveBeenCalledWith({
      error: "Invalid Email or Password",
    });
    expect(User.findOne).toHaveBeenCalledWith({ email: "unyime@gmail.com" });
  });

  it("should throw 'invalid email or password' when the provided password is not correct", async () => {
    jest.spyOn(User, "findOne").mockImplementationOnce(() => ({
      select: jest.fn().mockResolvedValueOnce(mockedUserLogin),
    }));

    jest.spyOn(bcrypt, "compare").mockResolvedValueOnce(false);

    const mockedReq = (mockedRequest().body = { body: mockedUserLogin });
    const mockedRes = mockedResponse();

    await loginUser(mockedReq, mockedRes);

    expect(mockedRes.status).toHaveBeenCalledWith(401);
  });

  it("should return jwt token", async () => {
    // jest.spyOn(bcrypt, "compare").mockReset();

    jest.spyOn(User, "findOne").mockImplementationOnce(() => ({
      select: jest.fn().mockResolvedValueOnce(mockedUserLogin),
    }));

    jest.spyOn(bcrypt, "compare").mockResolvedValueOnce(true);

    const mockedReq = (mockedRequest().body = { body: mockedUserLogin });
    const mockedRes = mockedResponse();

    await loginUser(mockedReq, mockedRes);

    expect(mockedRes.status).toHaveBeenCalledWith(200);
    expect(mockedRes.json).toHaveBeenCalledWith({
      token: "jwt_token",
    });
  });
});
