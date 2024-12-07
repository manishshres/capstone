const { MongoClient } = require("mongodb");
const { connectToDatabase } = require("../config/mongoDbClient");

jest.mock("mongodb", () => {
  const mockDb = { collection: jest.fn() };
  const mockClient = {
    connect: jest.fn(),
    db: jest.fn().mockReturnValue(mockDb),
  };
  return {
    MongoClient: jest.fn(() => mockClient),
  };
});

describe("connectToDatabase", () => {
  let mockClientInstance;
  let originalEnv;

  beforeAll(() => {
    // Save original environment variables and set some defaults
    originalEnv = { ...process.env };
    process.env.MONGODB_USERNAME = "testUser";
    process.env.MONGODB_PASSWORD = "testPass";
    process.env.MONGODB_DB_NAME = "testDb";
  });

  afterAll(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  beforeEach(() => {
    mockClientInstance = new MongoClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should connect to MongoDB and return the database", async () => {
    mockClientInstance.connect.mockResolvedValue();

    const db = await connectToDatabase();

    expect(mockClientInstance.connect).toHaveBeenCalledTimes(1);
    expect(mockClientInstance.db).toHaveBeenCalledWith("testDb");
    expect(db).toBeTruthy();
  });

  it("should throw an error if connection fails", async () => {
    mockClientInstance.connect.mockRejectedValue(
      new Error("Connection failed")
    );

    await expect(connectToDatabase()).rejects.toThrow(
      "Error connecting to MongoDB: Connection failed"
    );
    expect(mockClientInstance.connect).toHaveBeenCalledTimes(1);
  });
});
