import { DataTypes } from "sequelize";
import { database } from "../../../config/database.config";
import { BaseModel } from "../../base.model";
import { Dish } from "../dish";
import { Establishment } from "../../establishment";

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
    },
    establishmentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  },
  {
    tableName: 'categories',
    sequelize: database,
  }
);

Category.belongsTo(Establishment, {
  foreignKey: 'establishmentId'
});

Category.hasMany(Dish, { as: 'dishes', foreignKey: 'categoryId' });
Dish.belongsTo(Category, { foreignKey: 'categoryId', onDelete: 'cascade' });