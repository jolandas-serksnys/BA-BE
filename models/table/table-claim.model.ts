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
  requestCode: string;
}

export class TableClaim extends BaseModel {
  declare tableId: number;
  declare requestsEnabled: boolean;
  declare status: TableClaimStatus;
  declare requestCode: string;
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
    requestCode: {
      type: new DataTypes.STRING(6),
      allowNull: true,
      defaultValue: '',
    }
  },
  {
    tableName: 'table_claims',
    sequelize: database,
  }
);

Table.hasMany(TableClaim, { as: 'tableClaims', foreignKey: 'tableId' });
TableClaim.belongsTo(Table, { as: 'table' });
TableClaim.hasMany(Customer, { as: 'customers', foreignKey: 'tableClaimId' });