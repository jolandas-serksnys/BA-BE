import { Request, Response } from 'express';
import { UpdateOptions } from 'sequelize';
import { Establishment, EstablishmentInterface } from '../models';
import { ResponseType } from '../utils';

const MESSAGE_UPDATE = 'Establishment was successfully updated';
const MESSAGE_404 = 'Couldn\'t find requested establishment';

export class EstablishmentController {
  public get = async (req: Request, res: Response) => {
    try {
      const id: number = parseInt(req.params.id);

      Establishment.findByPk<Establishment>(id)
        .then((node: Establishment | null) => {
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
    } catch (error) {
      res.status(500).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: error
      });
    }
  };

  public update = async (req: Request, res: Response) => {
    try {
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
    } catch (error) {
      res.status(500).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: error
      });
    }
  };
}