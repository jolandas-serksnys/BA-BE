import { Sequelize } from "sequelize";

export const database = new Sequelize({
  host: 'wb39lt71kvkgdmw0.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  username: 'phxxq5q9vej4qzrf',
  password: 't2karusqrfi837g0',
  database: 'lnpyotlag2fstj3h',
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  logging: false
});

/*
export const database = new Sequelize({
  host: 'localhost',
  username: 'root',
  password: '',
  database: 'bp',
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  logging: false
});
*/