import request from 'supertest'
import app from "../app.test";
import Users, { UserInterface } from "../../src/schemas/UsersSchema"
import mongoose from "mongoose"
import { MongoMemoryServer } from "mongodb-memory-server"
import { doesIntersect } from 'tslint';

jest.setTimeout(600000);

let mongoServer: MongoMemoryServer;

let connection: any;
let db: any;

beforeAll(async () => {
  mongoServer = new MongoMemoryServer();
  const mongoUri = await mongoServer.getUri();
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if (err) console.error(err);
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  app.close();
});

describe('Testing User Controller', () => {

  let mockUser = {
    username: "luiscor",
    password: "qwe123",
    name: "Luis Correia",
    role: "patient",
    address: "Rua das Cenas, n8",
    email: "luis@email",
    phone: "912344356"
  };

  it('DB Sanity Check', async () => {


    await new Users(mockUser).save();
    const count = await Users.countDocuments();
    expect(count).toEqual(1);

  });

  it('Fetching db with one element', async () => {

    const res = await request(app)
      .get('/users')
      
    expect(res.status).toEqual(200)
    expect(res.body).toHaveLength(1)

  });

});
