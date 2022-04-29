import { BaseModel } from "./base.model";
import { Establishment } from "./establishment.model";
import { database } from "../config/database.config";
import { DataTypes } from "sequelize";
import { UserInterface } from "./user.model";

export enum EmployeeRole {
  GENERAL = 'general',
  WAITER = 'waiter',
  ADMINISTRATOR = 'administrator',
  KITCHEN = 'kitchenStaff',
  OTHER = 'other'
}

export interface EmployeeInterface extends UserInterface {
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
        'general',
        'waiter',
        'administrator',
        'kitchenStaff',
        'other'
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

export interface SignUpCodeInterface {
  code: string;
  establishmentId: number;
  role: EmployeeRole;
  isClaimed: boolean;
}

export class SignUpCode extends BaseModel {
  declare code: string;
  declare establishmentId: number;
  declare role: EmployeeRole;
  declare isClaimed: boolean;
}

SignUpCode.init(
  {
    code: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    establishmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(
        'general',
        'waiter',
        'administrator',
        'kitchenStaff',
        'other'
      ),
      allowNull: false,
    },
    isClaimed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: 'signup_codes',
    sequelize: database,
  }
);

Employee.belongsTo(Establishment, { as: 'establishment', foreignKey: 'establishmentId' });
SignUpCode.hasOne(Employee, { foreignKey: 'signUpCodeId' });