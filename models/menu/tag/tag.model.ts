import { DataTypes } from "sequelize";
import { database } from "../../../config/database.config";
import { BaseModel } from "../../base.model";

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