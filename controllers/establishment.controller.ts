import { Request, Response } from "express";
import { DestroyOptions, UpdateOptions } from "sequelize";
import { Establishment, EstablishmentInterface } from "../models";
import { ResponseType } from "../utils";

const MESSAGE_CREATE = 'Establishment was successfully created';
const MESSAGE_UPDATE = 'Establishment was successfully updated';
const MESSAGE_DELETE = 'Establishment was successfully deleted';
const MESSAGE_404 = 'Couldn\'t find requested establishment';

export class EstablishmentController {
  public index(req: Request, res: Response) {
    Establishment.findAll<Establishment>({})
      .then((nodes: Array<Establishment>) => res.json({
        isSuccessful: true, type: ResponseType.SUCCESS, data: nodes
      }))
      .catch((error: Error) => res.status(500).json({
        isSuccessful: false, type: ResponseType.DANGER, message: error
      }));
  }

  public create(req: Request, res: Response) {
    const params: EstablishmentInterface = req.body;

    Establishment.create<Establishment>({ ...params })
      .then((node: Establishment) => res.status(201).json({
        isSuccessful: true, type: ResponseType.SUCCESS, data: node, message: MESSAGE_CREATE
      }))
      .catch((error: Error) => res.status(500).json({
        isSuccessful: false, type: ResponseType.DANGER, message: error
      }));
  }

  public get(req: Request, res: Response) {
    const id: number = parseInt(req.params.id);

    Establishment.findByPk<Establishment>(id)
      .then((node: Establishment | null) => {
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
  }

  public update(req: Request, res: Response) {
    const id: number = parseInt(req.params.id);
    const params: EstablishmentInterface = req.body;

    const update: UpdateOptions = {
      where: { id: id },
      limit: 1,
    };

    Establishment.update({ ...params }, update)
      .then(() => {
        Establishment.findByPk(id)
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
  }

  public delete(req: Request, res: Response) {
    const id: number = parseInt(req.params.id);
    const options: DestroyOptions = {
      where: { id: id },
      limit: 1,
    };

    Establishment.findByPk(id)
      .then((node) => {
        if (node) {
          Establishment.destroy(options)
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
  }
}