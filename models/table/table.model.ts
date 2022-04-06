import { DataTypes } from "sequelize";
import { database } from "../../config/database.config";
import { BaseModel } from "../base.model";
import { Establishment } from "../establishment";

export class Table extends BaseModel {
  declare displayName: string;
  declare number: number;
  declare isAvailable: boolean;
  declare seats: number;
}

export interface TableInterface {
  displayName: string;
  number: number;
  isAvailable: boolean;
  seats: number;
  useId?: boolean;
}

Table.init(
  {
    displayName: {
      type: new DataTypes.STRING(128),
      allowNull: false,
      defaultValue: 'Table',
    },
    number: {
      type: new DataTypes.INTEGER
    },
    isAvailable: {
      type: new DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
    },
    seats: {
      type: new DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'tables',
    sequelize: database,
  }
);

Table.belongsTo(Establishment, { as: 'establishment' });