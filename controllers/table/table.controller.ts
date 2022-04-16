import { Request, Response } from "express";
import { config } from "../../config";
import { Table, TableInterface, TableClaim, Customer, Establishment, TableClaimStatus } from "../../models";
import { ResponseType } from "../../utils";
import { AuthController } from "../authentication";
import * as jwt from 'jsonwebtoken';
import app from "../../app";
import { generateCode } from "../../utils/codeGenerator";

const MESSAGE_CREATE = 'Table was successfully created';
const MESSAGE_UPDATE = 'Table was successfully updated';
const MESSAGE_DELETE = 'Table was successfully deleted';
const MESSAGE_CLAIMED = 'Successfully signed in';
const MESSAGE_SEATS_TAKEN = 'All the seats are already taken at this table';
const MESSAGE_404 = 'Couldn\'t find requested table';
const MESSAGE_USER_ERROR = 'Something went wrong trying to authenticate';
const MESSAGE_REQUESTS_TOGGLED_ON = 'Requests to join this table have been enabled';
const MESSAGE_REQUESTS_TOGGLED_OFF = 'Requests to join this table have been disabled';
const MESSAGE_REQUEST_NEEDED = 'You have to request access to this table first';
const MESSAGE_REQUEST_CODE_INCORRECT = 'The code you entered is incorrect';
const MESSAGE_SEATS_LIMIT_ON = 'Seats limit has been enabled';
const MESSAGE_SEATS_LIMIT_OFF = 'Seats limit has been disabled';

export class TableController {
  public index = async (req: Request, res: Response) => {
    const { establishmentId } = req.params;
    const establishment = await Establishment.findByPk(establishmentId);

    if (!establishment) {
      return res.status(404).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: MESSAGE_404
      });
    }

    await Table.findAll<Table>({
      where: {
        establishmentId,
      },
    })
      .then((nodes: Array<Table>) => res.json({
        isSuccessful: true,
        type: ResponseType.SUCCESS,
        data: nodes
      }))
      .catch((error: Error) => res.status(500).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: error
      }));
  };

  public create = async (req: Request, res: Response) => {
    const { establishmentId } = req.params;
    const establishment = await Establishment.findByPk(establishmentId);

    if (!establishment) {
      return res.status(404).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: MESSAGE_404
      });
    }

    const params: TableInterface = req.body;

    await Table.create<Table>({
      ...params,
      establishmentId
    })
      .then(async (node: Table) => {
        if (params.useId) {
          await node.update({ number: parseInt(node.getDataValue('id'), 10) + 1000 });
        }

        res.status(201).json({
          isSuccessful: true,
          type: ResponseType.SUCCESS,
          data: node,
          message: MESSAGE_CREATE
        })
      })
      .catch((error: Error) => res.status(500).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: error
      }));
  }

  public get = async (req: Request, res: Response) => {
    const { establishmentId, id } = req.params;

    await Table.findOne<Table>({
      where: {
        id,
        establishmentId
      }
    })
      .then((node: Table | null) => {
        if (node) {
          res.json({
            isSuccessful: true,
            type: ResponseType.SUCCESS,
            data: node
          });
        } else {
          res.status(404).json({
            isSuccessful: false,
            type: ResponseType.DANGER,
            message: MESSAGE_404
          });
        }
      })
      .catch((error: Error) => res.status(500).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: error
      }));
  };

  public update = async (req: Request, res: Response) => {
    const { establishmentId, id } = req.params;
    const params: TableInterface = req.body;

    const node = await Table.findOne({
      where: {
        id,
        establishmentId
      }
    });

    if (!node) {
      return res.status(404).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: MESSAGE_404
      });
    }

    await node.update(params)
      .then(() => {
        res.status(202).json({
          isSuccessful: true,
          type: ResponseType.SUCCESS,
          data: node,
          message: MESSAGE_UPDATE
        })
      })
      .catch((error: Error) => res.status(500).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: error
      }));
  };

  public delete = async (req: Request, res: Response) => {
    const { establishmentId, id } = req.params;

    await Table.findOne({
      where: {
        id,
        establishmentId
      }
    }).then(async (node: Table | null) => {
      if (!node) {
        return res.status(404).json({
          isSuccessful: false,
          type: ResponseType.DANGER,
          message: MESSAGE_404
        });
      }

      await node.destroy({})
        .then(() => res.status(200).json({
          isSuccessful: true,
          type: ResponseType.SUCCESS,
          data: node, message: MESSAGE_DELETE
        }))
        .catch((error: Error) => res.status(500).json({
          isSuccessful: false,
          type: ResponseType.DANGER,
          message: error
        }));
    });
  };

  public toggleAvailability = async (req: Request, res: Response) => {
    const { establishmentId, id } = req.params;

    await Table.findOne({
      where: {
        id,
        establishmentId
      }
    })
      .then(async (node) => {
        if (node) {
          await node.update({ isAvailable: !node.isAvailable });
          res.status(200).json({
            isSuccessful: true,
            type: ResponseType.SUCCESS,
            data: node,
            message: MESSAGE_UPDATE
          });
        } else {
          res.status(404).json({
            isSuccessful: false,
            type: ResponseType.DANGER,
            message: MESSAGE_404
          });
        }
      })
      .catch((error: Error) => res.status(500).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: error
      }));
  };

  public checkAvailability = async (req: Request, res: Response) => {
    const { establishmentId, id } = req.params;

    const table = await Table.findOne({
      where: {
        id,
        establishmentId,
        isAvailable: true
      }
    });

    if (!table) {
      return res.status(404).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: MESSAGE_404
      });
    }

    let tableClaim = await TableClaim.findOne({
      where: {
        tableId: id,
        status: TableClaimStatus.ACTIVE
      }
    });

    if (tableClaim) {
      const customers = await Customer.findAll({
        where: {
          tableClaimId: tableClaim.id
        }
      });

      const seatsTaken = customers.length;

      if (!tableClaim.allowSeatsBypass && seatsTaken >= table.seats) {
        return res.status(400).json({
          isSuccessful: false,
          type: ResponseType.DANGER,
          message: MESSAGE_SEATS_TAKEN
        });
      }

      if (tableClaim.requestsEnabled) {
        return res.status(200).json({
          isSuccessful: true,
          type: ResponseType.WARNING,
          data: {
            ...table.get({ plain: true }),
            seatsTaken,
            requestsEnabled: true
          },
          message: MESSAGE_REQUEST_NEEDED
        });
      }

      return res.status(200).json({
        isSuccessful: true,
        type: ResponseType.SUCCESS,
        data: {
          ...table.get({ plain: true }),
          seatsTaken
        }
      });
    }

    return res.status(200).json({
      isSuccessful: true,
      type: ResponseType.SUCCESS,
      data: table.get({ plain: true })
    });
  };

  public claim = async (table: Table, req: Request, res: Response) => {
    const { displayName, requestCode } = req.body;

    let tableClaim = await TableClaim.findOne({
      where: {
        tableId: table.id,
        status: TableClaimStatus.ACTIVE
      }
    });

    if (tableClaim) {
      if (tableClaim.requestsEnabled && tableClaim.requestCode !== requestCode) {
        return res.status(400).json({
          isSuccessful: false,
          type: ResponseType.DANGER,
          message: MESSAGE_REQUEST_CODE_INCORRECT
        });
      }

      const customers = await Customer.findAll({
        where: {
          tableClaimId: tableClaim.id
        }
      });

      const seatsTaken = customers.length;

      if (!tableClaim.allowSeatsBypass && seatsTaken >= table.seats) {
        return res.status(400).json({
          isSuccessful: false,
          type: ResponseType.DANGER,
          message: MESSAGE_SEATS_TAKEN
        });
      }
    } else {
      const requestCode = generateCode(6);

      tableClaim = await TableClaim.create({
        tableId: table.id,
        status: TableClaimStatus.ACTIVE,
        requestsEnabled: false,
        requestCode
      });
    }

    const customer = await Customer.create({
      displayName,
      tableClaimId: tableClaim.id
    });

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

    const claimClients = await this.getRelevantSocketClients(tableClaim.id);

    claimClients.forEach((client) => {
      app.io.to(client.id).emit('joined', true);
    });
  };

  public toggleAccessRequests = async (req: Request, res: Response) => {
    const { userId } = req.body;

    const customer = await Customer.findByPk(userId);
    const tableClaim = await TableClaim.findByPk(customer.getDataValue('tableClaimId'));

    if (!tableClaim || !customer) {
      return res.status(404).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: MESSAGE_404
      });
    }

    if (tableClaim) {
      const requestCode = generateCode(6);

      await tableClaim.update({
        requestsEnabled: !tableClaim.getDataValue('requestsEnabled'),
        requestCode
      })
        .then(() => {
          res.status(200).json({
            isSuccessful: true,
            type: ResponseType.SUCCESS,
            message: tableClaim.requestsEnabled
              ? MESSAGE_REQUESTS_TOGGLED_ON : MESSAGE_REQUESTS_TOGGLED_OFF
          });
        });
    } else {
      res.status(404).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: MESSAGE_404
      });
    }

    const claimClients = await this.getRelevantSocketClients(tableClaim.id);

    claimClients.forEach((client) => {
      app.io.to(client.id).emit('joined', true);
    });
  };

  public getClaimed = async (req: Request, res: Response) => {
    const { userId } = req.body;

    if (!userId) {
      return res.status(401).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: MESSAGE_USER_ERROR
      });
    }

    await Customer.findByPk<Customer>(userId)
      .then(async (customer) => {
        if (!customer) {
          return res.status(401).json({
            isSuccessful: false,
            type: ResponseType.DANGER,
            message: MESSAGE_USER_ERROR
          });
        }

        const tableClaim = await TableClaim.findOne<TableClaim>({
          where: {
            id: customer.tableClaimId
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
            isSuccessful: false,
            type: ResponseType.DANGER,
            message: MESSAGE_USER_ERROR
          });
        }

        const ownerId = tableClaim.getDataValue('customers')[0].getDataValue('id');
        const isOwner = ownerId === customer.getDataValue('id');
        const table = await Table.findByPk<Table>(tableClaim.getDataValue('tableId'));

        res.status(200).json({
          isSuccessful: true,
          type: ResponseType.SUCCESS,
          data: {
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
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: error
      }));
  };

  public getRelevantSocketClients = async (tableClaimId) => {
    const sockets = await app.io.fetchSockets();

    const relevantSockets = sockets.map((s) => ({
      claimId: s.handshake.query.tableClaim,
      isEmployee: s.handshake.query.isEmployee,
      id: s.id
    })).filter((c) =>
      Number(c.claimId) === Number(tableClaimId)
      || c.isEmployee === 'true'
    );

    return relevantSockets;
  };

  public toggleSeatsLimitBypass = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const tableClaim = await TableClaim.findByPk(id);

      await tableClaim.update({
        allowSeatsBypass: !tableClaim.allowSeatsBypass
      });

      const claimClients = await new TableController().getRelevantSocketClients(tableClaim.id);

      claimClients.forEach((client) => {
        app.io.to(client.id).emit('status', true);
      });

      res.status(200).json({
        isSuccessful: true,
        type: ResponseType.SUCCESS,
        message: !tableClaim.allowSeatsBypass
          ? MESSAGE_SEATS_LIMIT_ON
          : MESSAGE_SEATS_LIMIT_OFF,
        data: {
          allowSeatsBypass: tableClaim.allowSeatsBypass
        }
      });
    } catch (error) {
      res.status(400).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        data: error
      });
    }
  }
};