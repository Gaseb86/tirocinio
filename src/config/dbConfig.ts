import { Dialect } from "sequelize";

require("dotenv").config();

interface DbConfig {
  HOST: string;
  USER: string;
  PASSWORD: string;
  DB: string;
  dialect: Dialect;
  pool: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
}

console.log("HOST " + process.env.DB_HOST);
console.log("USER " + process.env.DB_USER);
console.log("PASS " + process.env.DB_PASS);
console.log("NAME " + process.env.DB_NAME);

const dbConfig: DbConfig = {
  HOST: process.env.DB_HOST!,
  USER: process.env.DB_USER!,
  PASSWORD: process.env.DB_PASS!,
  DB: process.env.DB_NAME!,
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

export default dbConfig;