import { DataTypes } from "sequelize";
import { database } from "../../config";
import { BaseModel } from "../base.model";
import { Customer } from "../customer";
import { TableClaim } from "../table";

export interface OrderPriceRequestInterface {
  dishId: number;
  options: number[];
}

export enum TableOrderStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
}

export interface TableOrderInterface {
  tableClaimId: number;
  status: TableOrderStatus;
}

export class TableOrder extends BaseModel {
  declare tableClaimId: number;
  declare status: TableOrderStatus;
}

export enum CustomerOrderStatus {
  CREATED = 'CREATED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED',
}

export interface CustomerOrderInterface {
  status: CustomerOrderStatus;
  comment: string;
  price: string;
}

export class CustomerOrder extends BaseModel {
  declare title: string;
  declare status: CustomerOrderStatus;
  declare comment: string;
  declare price: number;
  declare totalPrice: number;
  declare dishId: number;
  declare tableOrderId: number;
  declare ownerId: number;
}

export class OrderAddon extends BaseModel {
  declare title: string;
  declare price: number;
  declare orderId: number;
  declare addonId: number;
  declare optionId: number;
}

TableOrder.init({
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
    tableName: 'table_orders',
    sequelize: database,
  }
);

CustomerOrder.init(
  {
    title: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        'CREATED',
        'PREPARING',
        'READY',
        'DONE',
        'CANCELLED',
      ),
      allowNull: false,
      defaultValue: 'CREATED',
    },
    comment: {
      type: new DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: new DataTypes.DECIMAL(10, 2)
    },
    totalPrice: {
      type: new DataTypes.DECIMAL(10, 2)
    },
  },
  {
    tableName: 'customer_orders',
    sequelize: database,
  }
);

OrderAddon.init(
  {
    title: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    price: {
      type: new DataTypes.DECIMAL(10, 2)
    },
  },
  {
    tableName: 'order_addons',
    sequelize: database,
  }
);

TableOrder.belongsTo(TableClaim, { as: 'table_claim', foreignKey: 'tableClaimId' });
TableOrder.hasMany(CustomerOrder, { as: 'customer_orders', foreignKey: 'tableOrderId' });
CustomerOrder.hasMany(OrderAddon, { as: 'order_addons', foreignKey: 'customerOrderId' });

CustomerOrder.belongsTo(Customer, { as: 'owner', foreignKey: 'ownerId' })