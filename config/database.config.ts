import { Sequelize } from "sequelize";

export const database = new Sequelize({
  host: 'localhost',
  username: 'root',
  password: '',
  database: 'bp',
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  logging: false
});