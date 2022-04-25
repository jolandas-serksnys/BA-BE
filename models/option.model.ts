import { BaseModel } from "./base.model";
import { database } from "../config/database.config";
import { DataTypes } from "sequelize";

export interface OptionInterface {
  id?: number;
  title: string;
  price: number;
  addonId: number;
  isDeleted?: boolean;
}

export class Option extends BaseModel {
  declare title: string;
  declare price: number;
  declare addonId: number;
}

Option.init(
  {
    title: {
      type: new DataTypes.STRING(128),
      allowNull: false,
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