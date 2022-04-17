import { BaseModel } from "./base.model";
import { database } from "../config/database.config";
import { DataTypes } from "sequelize";

export interface TagInterface {
  title: string;
}

export class Tag extends BaseModel {
  declare title: string;
}

Tag.init(
  {
    title: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    }
  },
  {
    tableName: 'tags',
    sequelize: database,
  }
);