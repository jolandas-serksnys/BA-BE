import { DataTypes } from "sequelize";
import { Customer } from "../customer";
import { database } from "../../config/database.config";
import { BaseModel } from "../base.model";
import { Table } from "./table.model";

export enum TableClaimStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
}

export class TableClaimInteface {
  tableId: number;
  requestsEnabled: boolean;
  status: TableClaimStatus;
}

export class TableClaim extends BaseModel {
  declare tableId: number;
  declare requestsEnabled: boolean;
  declare status: TableClaimStatus;
}

TableClaim.init(
  {
    requestsEnabled: {
      type: new DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
    },
    status: {
      type: DataTypes.ENUM(
        'ACTIVE',
        'CLOSED'
      ),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
  },
  {
    tableName: 'table_claims',
    sequelize: database,
  }
);

Table.hasMany(TableClaim, { as: 'tableClaims', foreignKey: 'tableId' });
TableClaim.belongsTo(Table, { as: 'table' });
TableClaim.hasMany(Customer, { as: 'customers', foreignKey: 'tableClaimId' });