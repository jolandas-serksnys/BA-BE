import { BaseModel } from "./base.model";
import { TableClaim } from "./tableClaim.model";
import { database } from "../config";
import { DataTypes } from "sequelize";

export enum AssistanceRequestType {
  HELP = 'HELP',
  PAYCASH = 'PAYCASH',
  PAYCARD = 'PAYCARD',
  OTHER = 'OTHER'
}

export interface AssistanceRequestInterface {
  type: AssistanceRequestType;
  isHidden: boolean;
  message: string;
  tableClaimId: number;
}

export class AssistanceRequest extends BaseModel {
  declare type: AssistanceRequestType;
  declare isHidden: boolean;
  declare message: string;
  declare tableClaimId: number;
}

AssistanceRequest.init(
  {
    type: {
      type: new DataTypes.ENUM(
        'HELP',
        'PAYCASH',
        'PAYCARD',
        'OTHER'
      ),
      allowNull: false,
      defaultValue: 'HELP',
    },
    isHidden: {
      type: new DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0,
    },
    message: {
      type: new DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'assistance_requests',
    sequelize: database,
  }
);

TableClaim.hasMany(AssistanceRequest, { as: 'assistanceRequests', foreignKey: 'tableClaimId' });
AssistanceRequest.belongsTo(TableClaim, { as: 'tableClaim', foreignKey: 'tableClaimId' });