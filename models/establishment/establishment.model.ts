import { DataTypes } from "sequelize";
import { database } from "../../config/database.config";
import { BaseModel } from "../base.model";

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
  public title!: string;
  public description!: string;
  public type!: EstablishmentType;
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