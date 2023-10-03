import { getJobs, newJob } from "../../controllers/jobsController";
import jobs from "../../models/jobs";

const mockJob = {
  _id: "636ad8d88242262f5d0d85cc",
  title: "Node Developer",
  description:
    "Must be a full-stack developer, able to implement everything in a MEAN or MERN stack paradigm (MongoDB, Express, Angular and/or React, and Node.js).",
  email: "employeer1@gmail.com",
  address: "651 Rr 2, Oquawka, IL, 61469",
  company: "Knack Ltd",
  industry: [],
  positions: 2,
  salary: 155000,
  user: "6368dadd983d6c4b181e37c1",
  postingDate: "2022-11-08T22:31:52.441Z",
};

const mockRequest = () => {
  return {
    body: {},
    query: {},
    params: {},
    user: {},
  };
};

const mockResponse = () => {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
};

afterEach(() => {
  //restore all spy created with spyOn
  jest.restoreAllMocks();
});

describe("jobs controller", () => {
  describe("get all jobs", () => {
    it("should get all jobs", async () => {
      jest.spyOn(jobs, "find").mockImplementationOnce(() => ({
        limit: () => ({
          skip: jest.fn().mockResolvedValueOnce([mockJob]),
        }),
      }));

      const mockReq = mockRequest();
      const mockRes = mockResponse();

      await getJobs(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ jobs: [mockJob] });
    });
  });

  describe("create a new job", () => {
    it("should create a new job", async () => {
      jest.spyOn(jobs, "create").mockResolvedValueOnce(mockJob);

      const mockedReq = (mockRequest().body = {
        body: {
          title: "Node Developer",
          description:
            "Must be a full-stack developer, able to implement everything in a MEAN or MERN stack paradigm (MongoDB, Express, Angular and/or React, and Node.js).",
          email: "employeer1@gmail.com",
          address: "651 Rr 2, Oquawka, IL, 61469",
          company: "Knack Ltd",
          positions: 2,
          salary: 155000,
        },
        user: {
          id: "636ad8d88242262f5d0d85cc",
        },
      });
      const mockedRes = mockResponse();

      await newJob(mockedReq, mockedRes);

      expect(mockedRes.status).toHaveBeenCalledWith(200);
      expect(mockedRes.json).toHaveBeenCalledWith({ job: mockJob });
    });
  });
});
