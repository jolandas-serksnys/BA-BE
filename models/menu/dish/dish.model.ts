import { DataTypes } from "sequelize";
import { database } from "../../../config/database.config";
import { BaseModel } from "../../base.model";
import { Tag } from "../tag/tag.model";

export interface DishInterface {
  title: string;
  description: string;
  ageRestriction: string;
  isVisible: boolean;
  isAvailable: boolean;
  imageUrl: string;
  categoryId: number;
  basePrice: number;
}

export class Dish extends BaseModel {
  declare title: string;
  declare description: string;
  declare ageRestriction: string;
  declare isVisible: boolean;
  declare isAvailable: boolean;
  declare imageUrl: string;
  declare categoryId: number;
  declare basePrice: number;
}

Dish.init(
  {
    title: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    description: {
      type: new DataTypes.TEXT,
      allowNull: true,
    },
    ageRestriction: {
      type: new DataTypes.TEXT,
      allowNull: true,
    },
    isVisible: {
      type: new DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    isAvailable: {
      type: new DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    imageUrl: {
      type: new DataTypes.STRING(512),
      allowNull: true,
    },
    basePrice: {
      type: new DataTypes.DECIMAL(10, 2)
    },
  },
  {
    tableName: 'dishes',
    sequelize: database,
  }
);

Dish.hasMany(Tag, { as: 'tags', foreignKey: 'dishId' });