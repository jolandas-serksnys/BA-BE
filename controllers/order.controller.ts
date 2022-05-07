import { TableClaimController } from './tableClaim.controller';
import app from '../app';
import {
  Customer,
  CustomerOrder,
  CustomerOrderStatus,
  Dish,
  Option,
  OrderAddon,
  OrderPriceRequestInterface,
  Table,
  TableClaim,
  TableClaimStatus,
  TableOrder,
  TableOrderStatus
} from '../models';
import { ResponseType } from '../utils';
import { Request, Response } from 'express';
import { Op } from 'sequelize';

const MESSAGE_404 = 'Table order not found.';
const MESSAGE_201 = 'Order has been accepted.';
const MESSAGE_200 = 'Order has been cancelled.';
const MESSAGE_STATUS = 'Order status has been updated.';
const MESSAGE_CLAIM_CLOSED = 'Table claim has been closed and ordering new dishes is not possible.';

export class OrderController {
  public calculatePrice = async (req: Request, res: Response) => {
    try {
      const { dishId, options, quantity }: OrderPriceRequestInterface = req.body;
      let price = 0.0;

      await Dish.findByPk(dishId)
        .then((dish) => { price += Number(dish.getDataValue('basePrice')) });

      for (const option of options) {
        await Option.findByPk(option)
          .then((foundOption) => {
            price += Number(foundOption.getDataValue('price'));
          });
      }

      res.status(200).json({
        isSuccessful: true,
        type: ResponseType.SUCCESS,
        data: price * quantity
      });
    } catch (error) {
      res.status(400).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        data: error
      });
    }
  };

  public processOrder = async (req: Request, res: Response) => {
    try {
      const { tableClaimId, dishId, options, comment, quantity, userId } = req.body;

      const tableClaim = await TableClaim.findOne({
        where: {
          id: tableClaimId,
          status: TableClaimStatus.ACTIVE
        }
      });

      if (!tableClaim) {
        return res.status(404).json({
          isSuccessful: false,
          type: ResponseType.DANGER,
          message: MESSAGE_CLAIM_CLOSED
        });
      }

      const claimClients = await new TableClaimController().getRelevantSocketClients(tableClaimId);

      let tableOrder;

      await TableOrder.findOne({
        where: {
          tableClaimId: tableClaimId,
          status: TableOrderStatus.ACTIVE
        }
      })
        .then(async (node) => {
          if (node) {
            tableOrder = node;
          } else {
            await TableOrder.create({
              tableClaimId: tableClaimId,
              status: TableOrderStatus.ACTIVE
            });

            tableOrder = await TableOrder.findOne({
              where: {
                tableClaimId: tableClaimId,
                status: TableOrderStatus.ACTIVE
              }
            });
          }
        });

      const dish = await Dish.findByPk(dishId);

      let customerOrder = await CustomerOrder.create({
        title: dish.title,
        status: CustomerOrderStatus.CREATED,
        comment: comment,
        tableOrderId: tableOrder.id,
        ownerId: userId
      });

      const price = Number(dish.basePrice);
      let totalPrice = price;

      for (const option of options) {
        const optionObj = await Option.findByPk(option);

        await OrderAddon.create({
          title: optionObj.title,
          price: optionObj.price,
          customerOrderId: customerOrder.id
        });

        totalPrice = Number(totalPrice) + Number(optionObj.price);
      }

      customerOrder = await CustomerOrder.findByPk(
        customerOrder.id,
        {
          include: {
            model: OrderAddon,
            as: 'order_addons'
          },
          plain: true
        }
      );

      await customerOrder.update({
        price: price,
        totalPrice: totalPrice * quantity,
        quantity
      });

      claimClients.forEach((client) => {
        app.io.to(client.id).emit('status', true);
      });

      res.status(201).json({
        isSuccessful: true,
        type: ResponseType.SUCCESS,
        message: MESSAGE_201,
        data: {
          tableOrderId: tableOrder.id,
          customerOrderId: customerOrder.id
        }
      });
    } catch (error) {
      res.status(400).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        data: error
      });
    }
  };

  public getTableOrder = async (req: Request, res: Response) => {
    try {
      const { id } = req.body;
      const tableOrder = await TableOrder.findOne({
        where: {
          tableClaimId: id
        },
        include: {
          model: CustomerOrder,
          as: 'customer_orders',
          include: [
            {
              model: OrderAddon,
              as: 'order_addons',
              attributes: ['title', 'price']
            },
            {
              model: Customer,
              as: 'owner',
              attributes: ['displayName', 'id']
            }
          ]
        },
        order: [['customer_orders', 'updatedAt', 'DESC']]
      });

      res.status(200).json({
        isSuccessful: true,
        type: ResponseType.SUCCESS,
        data: tableOrder
      });
    } catch (error) {
      res.status(400).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        data: error
      });
    }
  };

  public cancelCustomerOrder = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      const customerOrder = await CustomerOrder.findOne({
        where: {
          id: id,
          ownerId: userId,
          status: CustomerOrderStatus.CREATED
        }
      });

      if (customerOrder) {
        await customerOrder.update({
          status: CustomerOrderStatus.CANCELLED
        });

        const tableOrder = await TableOrder.findByPk(customerOrder.tableOrderId);
        const claimClients = await new TableClaimController().getRelevantSocketClients(tableOrder.tableClaimId);

        claimClients.forEach((client) => {
          app.io.to(client.id).emit('status', true);
        });

        res.status(200).json({
          isSuccessful: true,
          type: ResponseType.SUCCESS,
          message: MESSAGE_200
        });
      } else {
        res.status(404).json({
          isSuccessful: false,
          type: ResponseType.DANGER,
          message: MESSAGE_404
        });
      }
    } catch (error) {
      res.status(400).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        data: error
      });
    }
  };

  public updateStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const customerOrder = await CustomerOrder.findOne({
        where: {
          id: id
        },
        include: [
          {
            model: OrderAddon,
            as: 'order_addons',
            attributes: ['title', 'price']
          },
          {
            model: Customer,
            as: 'owner',
            attributes: ['displayName', 'id']
          }
        ]
      });

      if (!customerOrder) {
        return res.status(404).json({
          isSuccessful: false,
          type: ResponseType.DANGER,
          message: MESSAGE_404
        });
      }

      const tableOrder = await TableOrder.findByPk(customerOrder.tableOrderId);

      if (customerOrder) {
        const claimClients = await new TableClaimController().getRelevantSocketClients(tableOrder.tableClaimId);

        await customerOrder.update({
          status: status
        });

        claimClients.forEach((client) => {
          app.io.to(client.id).emit('status', true);
        });

        res.status(200).json({
          isSuccessful: true,
          type: ResponseType.SUCCESS,
          message: MESSAGE_STATUS, data: customerOrder
        });
      } else {
        res.status(404).json({
          isSuccessful: false,
          type: ResponseType.DANGER,
          message: MESSAGE_404
        });
      }
    } catch (error) {
      res.status(400).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        data: error
      });
    }
  };

  public getActiveOrders = async (req: Request, res: Response) => {
    const { dateFrom: reqDateFrom, dateTo: reqDateTo, query } = req.body;

    const dateFrom = new Date();
    dateFrom.setHours(0, 0, 0, 0);

    const dateTo = new Date();
    dateTo.setHours(0, 0, 0, 0);
    dateTo.setDate(dateTo.getDate() + 1);

    const activeTableOrders = await TableOrder.findAll({
      where: {
        status: TableOrderStatus.ACTIVE,
        createdAt: {
          [Op.between]: [reqDateFrom || dateFrom, reqDateTo || dateTo]
        }
      },
      include: [
        {
          model: TableClaim,
          as: 'table_claim',
          attributes: ['id', 'tableId', 'status', 'allowSeatsBypass'],
          include: [
            {
              model: Table,
              as: 'table',
              attributes: ['id', 'displayName']
            },
            {
              model: Customer,
              as: 'customers',
              attributes: ['id', 'displayName']
            }
          ]
        },
        {
          model: CustomerOrder,
          as: 'customer_orders',
          include: [
            {
              model: OrderAddon,
              as: 'order_addons',
              attributes: ['title', 'price']
            },
            {
              model: Customer,
              as: 'owner',
              attributes: ['displayName', 'id']
            }
          ]
        }
      ]
    });

    const filteredData = !query ? activeTableOrders : activeTableOrders.filter((order) =>
      order.getDataValue('table_claim').table.displayName.toLowerCase().includes(query.toLowerCase())
      || order.getDataValue('customer_orders').some((customerOrder) => customerOrder.status?.toLowerCase().includes(query.toLowerCase()))
      || order.getDataValue('customer_orders').some((customerOrder) => customerOrder.title.toLowerCase().includes(query.toLowerCase()))
    );

    res.status(200).json({
      isSuccessful: true,
      type: ResponseType.SUCCESS,
      data: filteredData
    });
  };

  public toggleTableOrderClaim = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const tableOrder = await TableOrder.findByPk(id);

      if (tableOrder) {
        const tableClaim = await TableClaim.findByPk(tableOrder.tableClaimId);

        if (!tableClaim) {
          return res.status(404).json({
            isSuccessful: false,
            type: ResponseType.DANGER,
            message: MESSAGE_404
          });
        }

        await tableClaim.update({
          status: (tableClaim.status === TableClaimStatus.ACTIVE ?
            TableClaimStatus.CLOSED : TableClaimStatus.ACTIVE)
        });

        const claimClients = await new TableClaimController().getRelevantSocketClients(tableClaim.id);

        claimClients.forEach((client) => {
          app.io.to(client.id).emit('status', true);
        });

        res.status(200).json({
          isSuccessful: true,
          type: ResponseType.SUCCESS,
          message: MESSAGE_STATUS,
          data: tableClaim
        });
      } else {
        res.status(404).json({
          isSuccessful: false,
          type: ResponseType.DANGER,
          message: MESSAGE_404
        });
      }
    } catch (error) {
      res.status(400).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        data: error
      });
    }
  };

  public getCustomerReceipt = async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;

      const customerOrders = await CustomerOrder.findAll({
        where: {
          ownerId: userId,
          status: {
            [Op.ne]: CustomerOrderStatus.CANCELLED
          }
        },
        include: [
          {
            model: OrderAddon,
            as: 'order_addons',
            attributes: ['title', 'price']
          }
        ]
      });

      const totalPrice = customerOrders.reduce((acc, order) => Number(acc) + Number(order.totalPrice), 0);

      res.status(200).json({
        isSuccessful: true,
        type: ResponseType.SUCCESS,
        data: {
          orders: customerOrders,
          totalPrice
        }
      });
    } catch (error) {
      res.status(400).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        data: error
      });
    }
  };

  public getReceipts = async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      const customer = await Customer.findByPk(userId);
      const tableOrder = await TableOrder.findOne({
        where: {
          tableClaimId: customer.tableClaimId
        },
        attributes: ['id'],
      });

      const customerOrders = await CustomerOrder.findAll({
        where: {
          tableOrderId: tableOrder.id,
          ownerId: {
            [Op.ne]: userId
          },
          status: {
            [Op.ne]: CustomerOrderStatus.CANCELLED
          }
        },
        include: [
          {
            model: OrderAddon,
            as: 'order_addons',
            attributes: ['title', 'price']
          },
          {
            model: Customer,
            as: 'owner',
            attributes: ['displayName', 'id']
          }
        ],
        order: [['ownerId', 'DESC']]
      });

      const totalPrice = customerOrders.reduce((acc, order) => Number(acc) + Number(order.totalPrice), 0);

      res.status(200).json({
        isSuccessful: true,
        type: ResponseType.SUCCESS,
        data: {
          orders: customerOrders,
          totalPrice
        }
      });
    } catch (error) {
      res.status(400).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        data: error
      });
    }
  };

  public getTableReceiptTotal = async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      const customer = await Customer.findByPk(userId);
      const tableOrder = await TableOrder.findOne({
        where: {
          tableClaimId: customer.tableClaimId
        },
        attributes: ['id'],
      });

      const customerOrders = await CustomerOrder.findAll({
        where: {
          tableOrderId: tableOrder.id,
          status: {
            [Op.ne]: CustomerOrderStatus.CANCELLED
          }
        },
        include: [
          {
            model: OrderAddon,
            as: 'order_addons',
            attributes: ['title', 'price']
          },
          {
            model: Customer,
            as: 'owner',
            attributes: ['displayName', 'id']
          }
        ],
        order: [['ownerId', 'DESC']]
      });

      const total = customerOrders.reduce((acc, order) => Number(acc) + Number(order.totalPrice), 0);

      res.status(200).json({
        isSuccessful: true,
        type: ResponseType.SUCCESS,
        data: {
          total
        }
      });
    } catch (error) {
      res.status(400).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        data: error
      });
    }
  };
}