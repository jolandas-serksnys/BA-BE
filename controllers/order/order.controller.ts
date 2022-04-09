import { Request, Response } from "express";
import { Dish } from "../../models/menu/dish/dish.model";
import { Option } from "../../models/menu/option/option.model";
import { CustomerOrder, CustomerOrderStatus, OrderAddon, OrderPriceRequestInterface, TableOrder, TableOrderStatus } from "../../models/order";
import { ResponseType } from "../../utils";
import app from "../../app";
import { AuthController } from "../authentication";
import { Customer, Table, TableClaim } from "../../models";
import { TableController } from "../table";

const MESSAGE_404 = 'Table order not found.';
const MESSAGE_200 = 'Order has been accepted.';
const MESSAGE_STATUS = 'Order status has been updated.';

export class OrderController {
  public async calculatePrice(req: Request, res: Response) {
    try {
      const { dishId, options }: OrderPriceRequestInterface = req.body;
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
        data: price
      });
    } catch (error) {
      res.status(400).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        data: error
      });
    }
  }

  public processOrder = async (req: Request, res: Response) => {
    try {
      const { tableClaimId, dishId, options, comment } = req.body;
      const { userId } = await new AuthController().getUser(req);
      const claimClients = await new TableController().getRelevantSocketClients(tableClaimId);

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
        totalPrice: totalPrice
      });

      claimClients.forEach((client) => {
        app.io.to(client.id).emit('status', true);
      });

      res.status(200).json({
        isSuccessful: true,
        type: ResponseType.SUCCESS,
        message: MESSAGE_200
      });
    } catch (error) {
      res.status(400).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        data: error
      });
    }
  }

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
          attributes: ['id', 'title', 'status', 'comment', 'price', 'totalPrice', 'createdAt', 'updatedAt'],
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

      if (tableOrder) {
        res.status(200).json({
          isSuccessful: true,
          type: ResponseType.SUCCESS,
          data: tableOrder
        });
      } else {
        res.status(200).json({
          isSuccessful: true,
          type: ResponseType.SUCCESS
        });
      }
    } catch (error) {
      res.status(400).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        data: error
      });
    }
  }

  public cancel = async (req: Request, res: Response) => {
    try {
      const { id } = req.body;
      const { userId } = await new AuthController().getUser(req);
      const customerOrder = await CustomerOrder.findOne({
        where: {
          id: id,
          ownerId: userId
        }
      });

      if (customerOrder) {
        await customerOrder.update({
          status: CustomerOrderStatus.CANCELLED
        });

        const tableOrder = await TableOrder.findByPk(customerOrder.tableOrderId);
        const claimClients = await new TableController().getRelevantSocketClients(tableOrder.tableClaimId);

        res.status(200).json({
          isSuccessful: true,
          type: ResponseType.SUCCESS,
          message: MESSAGE_200
        });

        claimClients.forEach((client) => {
          app.io.to(client.id).emit('status', true);
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

      const tableOrder = await TableOrder.findByPk(customerOrder.tableOrderId);

      if (customerOrder) {
        const claimClients = await new TableController().getRelevantSocketClients(tableOrder.tableClaimId);

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
    const activeTableOrders = await TableOrder.findAll({
      where: {
        status: TableOrderStatus.ACTIVE
      },
      include: [
        {
          model: TableClaim,
          as: 'table_claim',
          attributes: ['id', 'tableId', 'status'],
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
      ],
      order: [['updatedAt', 'DESC']]
    });

    res.status(200).json({
      isSuccessful: true,
      type: ResponseType.SUCCESS,
      data: activeTableOrders
    });
  };

  public closeTableOrder = async (req: Request, res: Response) => {
    try {
      const { id } = req.body;
      const tableOrder = await TableOrder.findByPk(id);

      if (tableOrder) {
        await tableOrder.update({
          status: TableOrderStatus.CLOSED
        });

        const claimClients = await new TableController().getRelevantSocketClients(tableOrder.tableClaimId);

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
}