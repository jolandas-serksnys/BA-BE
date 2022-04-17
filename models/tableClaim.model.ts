import { BaseModel } from "./base.model";
import { Customer } from "./customer.model";
import { Table } from "./table.model";
import { database } from "../config/database.config";
import { DataTypes } from "sequelize";

export enum TableClaimStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
}

export class TableClaimInteface {
  tableId: number;
  requestsEnabled: boolean;
  status: TableClaimStatus;
  requestCode: string;
  allowSeatsBypass: boolean;
}

export class TableClaim extends BaseModel {
  declare tableId: number;
  declare requestsEnabled: boolean;
  declare status: TableClaimStatus;
  declare requestCode: string;
  declare allowSeatsBypass: boolean;
}

TableClaim.init(
  {
    requestsEnabled: {
      type: new DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM(
        'ACTIVE',
        'CLOSED'
      ),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
    requestCode: {
      type: new DataTypes.STRING(6),
      allowNull: true,
      defaultValue: '',
    },
    allowSeatsBypass: {
      type: new DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0,
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