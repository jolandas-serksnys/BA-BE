import { BaseModel } from "./base.model";
import { database } from "../config/database.config";
import { DataTypes } from "sequelize";

export interface EstablishmentInterface {
  title: string;
  description: string;
}

export class Establishment extends BaseModel {
  declare title: string;
  declare description: string;
}

Establishment.init(
  {
    title: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    description: {
      type: new DataTypes.TEXT
    },
  },
  {
    tableName: 'establishments',
    sequelize: database,
  }
);