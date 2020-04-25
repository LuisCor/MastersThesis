// Loading environment variables
import * as dotenv from "dotenv";
dotenv.config({path : "./tests/.env.test"});

import app from "../../src/app";
import mongoose from "mongoose";
import request from 'supertest';
import { MongoMemoryServer } from "mongodb-memory-server"
import UserSchema from "../../src/schemas/UsersSchema"

describe('User', () => {
  let mongoServer : MongoMemoryServer;
  beforeAll(async () => {
    mongoServer = new MongoMemoryServer();
    const URI = await mongoServer.getUri();

    mongoose.connect(URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    }, (err) => {
        if (err) {
            console.log ('Unable to connect', err);
            process.exit (1);
          }else{
            console.log('Succesfully connected');
          }
    });
  });

  afterAll(async (done) => {
    mongoose.disconnect(done);
    await mongoServer.stop();
    app.close();
  });

  afterEach(async () => {
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
      await collection.deleteMany({});
    }

  });

  it('Listing the empty user list', async () => {
    const response = await request(app)
      .get('/users')

    expect(response.status).toBe(200);
  });
  

})