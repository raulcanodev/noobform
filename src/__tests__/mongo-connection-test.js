import { MongoClient } from 'mongodb';

async function testMongoDBConnection(uri) {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('MongoDB connection successful');
  } catch (error) {
    console.error('MongoDB connection failed', error);
  } finally {
    // Ensuring that the client will close when you finish/error
    await client.close();
  }
}

// URI of MongoDB (replace with your own URI)
const mongoURI = process.env.MONGODB_URI || 'your_mongodb_uri_here';

// Llamar a la función de prueba
testMongoDBConnection(mongoURI);
