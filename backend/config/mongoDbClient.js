const { MongoClient } = require("mongodb");

const username = encodeURIComponent(process.env.MONGODB_USERNAME);
const password = encodeURIComponent(process.env.MONGODB_PASSWORD);
const cluster = "cluster0.mubbu.mongodb.net";
const authSource = "admin";
const authMechanism = "SCRAM-SHA-1";

const uri = `mongodb+srv://${username}:${password}@${cluster}/?authSource=${authSource}&authMechanism=${authMechanism}&retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri);

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    return client.db(process.env.MONGODB_DB_NAME);
  } catch (error) {
    // console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

module.exports = { connectToDatabase };
