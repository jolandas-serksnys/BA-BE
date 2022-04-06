import { DataTypes } from "sequelize";
import { database } from "../../../config/database.config";
import { BaseModel } from "../../base.model";

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