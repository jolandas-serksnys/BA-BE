import { DataTypes } from "sequelize";
import { database } from "../../config/database.config";
import { BaseModel } from "../base.model";

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