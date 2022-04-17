import { BaseModel } from "./base.model";
import { Dish } from "./dish.model";
import { Option } from "./option.model";
import { database } from "../config/database.config";
import { DataTypes } from "sequelize";

export interface AddonInterface {
  title: string;
  isOptional: boolean;
  dishId: number;
  isMultiple: boolean;
}

export class Addon extends BaseModel {
  declare title: string;
  declare isOptional: boolean;
  declare dishId: number;
  declare isMultiple: boolean;
}

Addon.init(
  {
    title: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    isOptional: {
      type: new DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    isMultiple: {
      type: new DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  },
  {
    tableName: 'addons',
    sequelize: database,
  }
);

Dish.hasMany(Addon, { as: 'addons', foreignKey: 'dishId' });
Addon.hasMany(Option, { as: 'options', foreignKey: 'addonId' });
