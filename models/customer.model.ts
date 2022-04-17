import { BaseModel } from "./base.model";
import { database } from "../config/database.config";
import { DataTypes } from "sequelize";

export interface CustomerInterface {
  displayName: string;
  tableClaimId: number;
}

export class Customer extends BaseModel {
  declare displayName: string;
  declare tableClaimId: number;
}

Customer.init(
  {
    displayName: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
  },
  {
    tableName: 'customers',
    sequelize: database,
  }
);