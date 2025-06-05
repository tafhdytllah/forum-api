import dotenv from 'dotenv';
import { container } from './Infrastructures/container.js';
import { createServer } from './Infrastructures/http/createServer.js';

dotenv.config();

const start = async () => {
  const server = await createServer(container);
  await server.start();
  console.log(`server start at ${server.info.uri}`);
};

start();
