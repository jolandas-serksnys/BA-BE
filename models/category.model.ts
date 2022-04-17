import { BaseModel } from "./base.model";
import { Dish } from "./dish.model";
import { Establishment } from "./establishment.model";
import { database } from "../config/database.config";
import { DataTypes } from "sequelize";

export interface CategoryInterface {
  title: string;
  description: string;
  isVisible: boolean;
  establishmentId: number;
}

export class Category extends BaseModel {
  declare title: string;
  declare description: string;
  declare isVisible: boolean;
  declare establishmentId: number;
}

Category.init(
  {
    title: {
      type: new DataTypes.STRING(128),
      allowNull: false
    },
    description: {
      type: new DataTypes.TEXT,
      allowNull: true,
    },
    isVisible: {
      type: new DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    }
  },
  {
    tableName: 'categories',
    sequelize: database,
  }
);

Category.belongsTo(Establishment,
  {
    foreignKey: 'establishmentId',
  }
);

Category.hasMany(Dish,
  {
    as: 'dishes',
    foreignKey: 'categoryId'
  }
);

Dish.belongsTo(Category,
  {
    foreignKey: 'categoryId',
    onDelete: 'cascade'
  }
);