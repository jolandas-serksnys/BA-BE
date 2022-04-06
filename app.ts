import express from "express";
import bodyParser from "body-parser";
import { Routes } from "./routes";
import cors from 'cors';
import { createServer } from "http";
import { Server } from "socket.io";

const allowedOrigins = ['http://localhost:3000'];

const options: cors.CorsOptions = {
  origin: allowedOrigins,
};

class App {
  public app: express.Application;
  public routePrv: Routes = new Routes();
  public server;
  public io;

  constructor() {
    this.app = express();
    this.configApp();

    this.server = createServer(this.app);
    this.io = new Server(this.server, { cors: options });

    this.routePrv.routes(this.app);
  }

  private configApp(): void {
    this.app.use(cors(options));
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());
  }
}

export default new App();