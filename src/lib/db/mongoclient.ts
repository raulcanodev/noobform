import { MongoClient, ServerApiVersion } from 'mongodb';
import mongoose from 'mongoose';

// Check if the MongoDB URI is set in the environment variables
if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

// Store the MongoDB URI
const uri = process.env.MONGODB_URI;

// Set options for MongoDB connection
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

// Declare variables to store promises for MongoDB and Mongoose connections
let clientPromise: Promise<MongoClient>;
let mongooseConnection: Promise<typeof mongoose>;

// Check if the application is running in development mode
if (process.env.NODE_ENV === 'development') {
  // Extend the global object to include MongoDB and Mongoose connection promises
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
    _mongooseConnection?: Promise<typeof mongoose>;
  };

  // If a MongoDB client promise doesn't exist, create one
  if (!globalWithMongo._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect().catch((err) => {
      console.error('Failed to connect to MongoDB', err);
      throw err;
    });
  }
  // Assign the global MongoDB client promise to the local variable
  clientPromise = globalWithMongo._mongoClientPromise;

  // If a Mongoose connection promise doesn't exist, create one
  if (!globalWithMongo._mongooseConnection) {
    globalWithMongo._mongooseConnection = mongoose.connect(uri).catch((err) => {
      console.error('Failed to connect to MongoDB with Mongoose', err);
      throw err;
    });
  }
  // Assign the global Mongoose connection promise to the local variable
  mongooseConnection = globalWithMongo._mongooseConnection;
} else {
  // For production: Create new connection promises each time
  const client = new MongoClient(uri, options);
  clientPromise = client.connect().catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    throw err;
  });

  mongooseConnection = mongoose.connect(uri).catch((err) => {
    console.error('Failed to connect to MongoDB with Mongoose', err);
    throw err;
  });
}

// Export the MongoDB client promise and Mongoose connection promise
export { clientPromise, mongooseConnection };
