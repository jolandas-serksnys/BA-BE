import { DataTypes } from "sequelize";
import { database } from "../../../config/database.config";
import { BaseModel } from "../../base.model";
import { Dish } from "../dish";
import { Option } from "../option";

export interface AddonInterface {
  title: string;
  isOptional: boolean;
  dishId: number;
}

export class Addon extends BaseModel {
  declare title: string;
  declare isOptional: boolean;
  declare dishId: number;
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
  },
  {
    tableName: 'addons',
    sequelize: database,
  }
);

Dish.hasMany(Addon, { as: 'addons', foreignKey: 'dishId' });
Addon.hasMany(Option, { as: 'options', foreignKey: 'addonId' });
