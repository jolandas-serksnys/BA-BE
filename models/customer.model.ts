import { BaseModel } from "./base.model";
import { database } from "../config/database.config";
import { DataTypes } from "sequelize";
import { UserInterface } from "./user.model";

export interface CustomerInterface extends UserInterface {
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