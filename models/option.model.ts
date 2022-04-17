import { BaseModel } from "./base.model";
import { database } from "../config/database.config";
import { DataTypes } from "sequelize";

export interface OptionInterface {
  title: string;
  description: string;
  price: number;
  addonId: number;
}

export class Option extends BaseModel {
  declare title: string;
  declare description: string;
  declare price: number;
  declare addonId: number;
}

Option.init(
  {
    title: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    description: {
      type: new DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: new DataTypes.DECIMAL(10, 2)
    },
  },
  {
    tableName: 'options',
    sequelize: database,
  }
);