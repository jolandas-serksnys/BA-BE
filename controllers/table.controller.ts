import { Establishment, Table, TableInterface } from "../models";
import { ResponseType } from "../utils";
import { Request, Response } from "express";

const MESSAGE_CREATE = 'Table was successfully created';
const MESSAGE_UPDATE = 'Table was successfully updated';
const MESSAGE_DELETE = 'Table was successfully deleted';
const MESSAGE_404 = 'Couldn\'t find requested table';

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
  };

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
};