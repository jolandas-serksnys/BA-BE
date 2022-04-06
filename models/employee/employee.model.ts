import { DataTypes } from "sequelize";
import { database } from "../../config/database.config";
import { BaseModel } from "../base.model";
import { Establishment } from "../establishment";

export enum EmployeeRole {
  GENERAL,
  WAITER,
  ADMINISTRATOR,
  RECEPTIONIS,
  KITCHEN,
  OTHER
}

export interface EmployeeInterface {
  firstName: string;
  lastName: string;
  email: string;
  role: EmployeeRole;
}

export class Employee extends BaseModel {
  declare firstName: string;
  declare lastName: string;
  declare email: string;
  declare role: EmployeeRole;
  declare password: string;
}

Employee.init(
  {
    firstName: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    lastName: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    email: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(
        'GENERAL',
        'WAITER',
        'ADMINISTRATOR',
        'RECEPTIONIS',
        'KITCHEN',
        'OTHER'
      ),
      allowNull: false,
    },
    password: {
      type: new DataTypes.STRING
    },
  },
  {
    tableName: 'employees',
    sequelize: database,
  }
);

Employee.belongsTo(Establishment, { as: 'establishment', foreignKey: 'establishmentId' });