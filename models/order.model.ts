import { BaseModel } from "./base.model";
import { Customer } from "./customer.model";
import { TableClaim } from "./tableClaim.model";
import { database } from "../config";
import { DataTypes } from "sequelize";

export interface OrderPriceRequestInterface {
  dishId: number;
  options: number[];
  quantity: number;
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
  title: string;
  status: CustomerOrderStatus;
  comment: string;
  price: number;
  totalPrice: number;
  dishId: number;
  tableOrderId: number;
  ownerId: number;
  quantity: number;
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
  declare quantity: number;
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
    quantity: {
      type: new DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    }
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