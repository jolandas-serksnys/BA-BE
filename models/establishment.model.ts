import { BaseModel } from "./base.model";
import { database } from "../config/database.config";
import { DataTypes } from "sequelize";

export enum EstablishmentType {
  CAFE = 'CAFE',
  RESTAURANT = 'RESTAURANT',
  BAR = 'BAR',
  CANTEEN = 'CANTEEN',
  OTHER = 'OTHER'
}

export interface EstablishmentInterface {
  title: string;
  description: string;
  type: EstablishmentType;
}

export class Establishment extends BaseModel {
  declare title: string;
  declare description: string;
  declare type: EstablishmentType;
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
    type: {
      type: DataTypes.ENUM(
        'CAFE',
        'RESTAURANT',
        'BAR',
        'CANTEEN',
        'OTHER'
      ),
      allowNull: false,
    },
  },
  {
    tableName: 'establishments',
    sequelize: database,
  }
);