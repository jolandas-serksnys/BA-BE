import { Request, Response } from "express";
import { DestroyOptions, UpdateOptions } from "sequelize";
import { config } from "../../config";
import { Table, TableInterface, TableClaim, Customer } from "../../models";
import { ResponseType } from "../../utils";
import { AuthController } from "../authentication";
import * as jwt from 'jsonwebtoken';
import app from "../../app";
import { CustomerOrder, TableOrder, TableOrderStatus } from "../../models/order";

const MESSAGE_CREATE = 'Table was successfully created';
const MESSAGE_UPDATE = 'Table was successfully updated';
const MESSAGE_DELETE = 'Table was successfully deleted';
const MESSAGE_CLAIMED = 'Successfully signed in';
const MESSAGE_NOT_AVAILABLE = 'This table is currently unavailable';
const MESSAGE_REQUESTS_OFF = 'The people at this table have dissabled any new join requests';
const MESSAGE_SEATS_TAKEN = 'All the seats are already taken at this table';
const MESSAGE_404 = 'Couldn\'t find requested table';
const MESSAGE_USER_ERROR = 'Something went wrong trying to authenticate';

export class TableController {
  public index = async (req: Request, res: Response) => {
    await Table.findAll<Table>({})
      .then((nodes: Array<Table>) => res.json({
        isSuccessful: true, type: ResponseType.SUCCESS, data: nodes
      }))
      .catch((error: Error) => res.status(500).json({
        isSuccessful: false, type: ResponseType.DANGER, message: error
      }));
  };

  public create = async (req: Request, res: Response) => {
    const params: TableInterface = req.body;

    await Table.create<Table>({ ...params })
      .then(async (node: Table) => {
        if (params.useId) {
          await node.update({ number: parseInt(node.getDataValue('id'), 10) + 1000 });
        }

        res.status(201).json({
          isSuccessful: true, type: ResponseType.SUCCESS, data: node, message: MESSAGE_CREATE
        })
      })
      .catch((error: Error) => res.status(500).json({
        isSuccessful: false, type: ResponseType.DANGER, message: error
      }));
  }

  public get = async (req: Request, res: Response) => {
    const { id } = req.params;

    await Table.findByPk<Table>(id)
      .then((node: Table | null) => {
        if (node) {
          res.json({
            isSuccessful: true, type: ResponseType.SUCCESS, data: node
          });
        } else {
          res.status(404).json({
            isSuccessful: false, type: ResponseType.DANGER, message: MESSAGE_404
          });
        }
      })
      .catch((error: Error) => res.status(500).json({
        isSuccessful: false, type: ResponseType.DANGER, message: error
      }));
  };

  public update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const params: TableInterface = req.body;

    const update: UpdateOptions = {
      where: { id: id },
      limit: 1,
    };

    const table = await Table.findByPk(id);

    if (!table) {
      return res.status(404).json({
        isSuccessful: false, type: ResponseType.DANGER, message: MESSAGE_404
      });
    }

    await Table.update({ ...params }, update)
      .then(() => {
        Table.findByPk(id)
          .then((node) => res.status(202).json({
            isSuccessful: true, type: ResponseType.SUCCESS, data: node, message: MESSAGE_UPDATE
          }))
          .catch((error: Error) => res.status(500).json({
            isSuccessful: false, type: ResponseType.DANGER, message: error
          }));
      })
      .catch((error: Error) => res.status(500).json({
        isSuccessful: false, type: ResponseType.DANGER, message: error
      }));
  };

  public delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    const options: DestroyOptions = {
      where: { id: id },
      limit: 1,
    };

    await Table.findByPk(id)
      .then((node) => {
        if (node) {
          Table.destroy(options)
            .then(() => res.status(200).json({
              isSuccessful: true, type: ResponseType.SUCCESS, data: node, message: MESSAGE_DELETE
            }))
            .catch((error: Error) => res.status(500).json({
              isSuccessful: false, type: ResponseType.DANGER, message: error
            }));
        } else {
          res.status(404).json({
            isSuccessful: false, type: ResponseType.DANGER, message: MESSAGE_404
          });
        }
      })
      .catch((error: Error) => res.status(500).json({
        isSuccessful: false, type: ResponseType.DANGER, message: error
      }));
  };

  public toggleAvailability = async (req: Request, res: Response) => {
    const { id } = req.params;

    await Table.findByPk(id)
      .then(async (node) => {
        if (node) {
          await node.update({ isAvailable: !node.isAvailable });
          res.status(200).json({
            isSuccessful: true, type: ResponseType.SUCCESS, data: node, message: MESSAGE_UPDATE
          });
        } else {
          res.status(404).json({
            isSuccessful: false, type: ResponseType.DANGER, message: MESSAGE_404
          });
        }
      })
      .catch((error: Error) => res.status(500).json({
        isSuccessful: false, type: ResponseType.DANGER, message: error
      }));
  };

  public checkAvailability = async (req: Request, res: Response) => {
    const id: number = parseInt(req.params.id);

    await Table.findByPk<Table>(id)
      .then((table) => {
        if (!table) {
          res.status(404).json({
            isSuccessful: false, type: ResponseType.DANGER, message: MESSAGE_404
          });
        } else if (!table.isAvailable) {
          res.status(200).json({
            isSuccessful: false, type: ResponseType.DANGER, message: MESSAGE_NOT_AVAILABLE
          });
        } else {
          TableClaim.findOne<TableClaim>({
            where: { tableId: id },
            include: {
              model: Customer,
              as: 'customers'
            }
          })
            .then((tableClaim) => {
              if (tableClaim) {
                const seatsTaken = tableClaim.getDataValue('customers').length;
                if (!tableClaim || (tableClaim && tableClaim.getDataValue('requestsEnabled') && seatsTaken < table.getDataValue('seats'))) {
                  res.status(200).json({
                    isSuccessful: true, type: ResponseType.SUCCESS, data: { ...table.get({ plain: true }), seatsTaken }
                  });
                } else if (tableClaim && !tableClaim.getDataValue('requestsEnabled')) {
                  res.status(400).json({
                    isSuccessful: false, type: ResponseType.DANGER, message: MESSAGE_REQUESTS_OFF
                  });
                } else if (tableClaim && tableClaim.getDataValue('customers').length >= table.getDataValue('seats')) {
                  res.status(400).json({
                    isSuccessful: false, type: ResponseType.DANGER, message: MESSAGE_SEATS_TAKEN
                  });
                } else {
                  res.status(400).json({
                    isSuccessful: false, type: ResponseType.DANGER, message: MESSAGE_NOT_AVAILABLE
                  });
                }
              } else {
                res.status(200).json({
                  isSuccessful: true, type: ResponseType.SUCCESS, data: table
                });
              }
            });
        }
      })
      .catch((error: Error) => res.status(500).json({
        isSuccessful: false, type: ResponseType.DANGER, message: error
      }));
  };

  public claim = async (table: Table, req: Request, res: Response) => {
    const { displayName } = req.body;

    let tableClaimId;

    await TableClaim.findOne({
      where: {
        tableId: table.getDataValue('id')
      },
      include: {
        model: Customer,
        as: 'customers'
      }
    })
      .then((tableClaim) => {
        if (tableClaim) {
          if (tableClaim.getDataValue('requestsEnabled')
            && tableClaim.getDataValue('customers').length < table.getDataValue('seats')) {

            tableClaimId = tableClaim.getDataValue('id');
            Customer.create({
              tableClaimId: tableClaimId,
              displayName: displayName
            })
              .then((customer) => {
                const tokenBody = { ...customer.get({ plain: true }), isEmployee: false };
                const accessToken = jwt.sign(tokenBody, config.secret, {
                  expiresIn: 4320 // 12 hours
                });

                res.status(201).json({
                  isSuccessful: true,
                  type: ResponseType.SUCCESS,
                  message: MESSAGE_CLAIMED,
                  data: {
                    user: customer,
                    accessToken: accessToken
                  }
                });
              })
              .catch((error: Error) => res.status(500).json({
                isSuccessful: false, type: ResponseType.DANGER, message: error
              }));
          } else {
            res.status(400).json({
              isSuccessful: false, type: ResponseType.DANGER, message: MESSAGE_SEATS_TAKEN
            });
          }
        } else {
          TableClaim.create({
            tableId: table.getDataValue('id')
          })
            .then((newTableClaim) => {
              tableClaimId = newTableClaim.getDataValue('id');

              Customer.create({
                tableClaimId: newTableClaim.getDataValue('id'),
                displayName: displayName
              })
                .then((customer) => {
                  const tokenBody = { ...customer.get({ plain: true }), isEmployee: false };
                  const accessToken = jwt.sign(tokenBody, config.secret, {
                    expiresIn: 4320 // 12 hours
                  });

                  res.status(201).json({
                    isSuccessful: true, type: ResponseType.SUCCESS, data: {
                      user: customer,
                      accessToken: accessToken
                    }
                  });
                })
                .catch((error: Error) => res.status(500).json({
                  isSuccessful: false, type: ResponseType.DANGER, message: error
                }));
            });
        }
      });

    const claimClients = await this.getSocketsByClaimId(tableClaimId);

    claimClients.forEach((client) => {
      app.io.to(client.id).emit('joined', true);
    });
  };

  public getClaimed = async (req: Request, res: Response) => {
    const { userId } = await new AuthController().getUser(req);

    if (!userId) {
      return res.status(401).json({
        isSuccessful: false, type: ResponseType.DANGER, message: MESSAGE_USER_ERROR
      });
    }

    Customer.findByPk<Customer>(userId)
      .then(async (customer) => {
        if (!customer) {
          return res.status(401).json({
            isSuccessful: false, type: ResponseType.DANGER, message: MESSAGE_USER_ERROR
          });
        }

        const tableClaim = await TableClaim.findOne<TableClaim>({
          where: {
            id: customer.getDataValue('tableClaimId')
          },
          include: {
            model: Customer,
            attributes: ['id', 'displayName'],
            order: [['createdAt', 'id']],
            as: 'customers'
          }
        });

        if (!tableClaim) {
          return res.status(401).json({
            isSuccessful: false, type: ResponseType.DANGER, message: MESSAGE_USER_ERROR
          });
        }


        const ownerId = tableClaim.getDataValue('customers')[0].getDataValue('id');
        const isOwner = ownerId === customer.getDataValue('id');
        const table = await Table.findByPk<Table>(tableClaim.getDataValue('tableId'));

        res.status(200).json({
          isSuccessful: true, type: ResponseType.SUCCESS, data: {
            table,
            tableClaim: {
              ...tableClaim.get({ plain: true }),
              ownerId,
              isOwner
            }
          }
        });
      })
      .catch((error: Error) => res.status(500).json({
        isSuccessful: false, type: ResponseType.DANGER, message: error
      }));
  };

  public getSocketsByClaimId = async (tableClaimId) => {
    const sockets = await app.io.fetchSockets();
    return sockets.map((s) => ({
      claimId: s.handshake.query.tableClaim,
      isEmployee: s.handshake.query.isEmployee,
      id: s.id
    })).filter((c) =>
      c.claimId == tableClaimId
      || c.isEmployee
    );
  };
};