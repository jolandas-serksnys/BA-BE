import { Request, Response } from 'express';
import { Establishment, EstablishmentInterface } from '../models';
import { ResponseType } from '../utils';

const MESSAGE_UPDATE = 'Establishment was successfully updated';
const MESSAGE_404 = 'Couldn\'t find requested establishment';

export class EstablishmentController {
  public get = async (req: Request, res: Response) => {
    try {
      const id: number = parseInt(req.params.id);

      const establishment = await Establishment.findByPk<Establishment>(id);

      if (establishment) {
        res.status(200).json({
          isSuccessful: true,
          type: ResponseType.SUCCESS,
          data: establishment
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
        message: error
      });
    }
  };

  public update = async (req: Request, res: Response) => {
    try {
      const id: number = parseInt(req.params.id);
      const params: EstablishmentInterface = req.body;

      const establishment = await Establishment.findByPk<Establishment>(id);

      if (establishment) {
        await Establishment.update(params, {
          where: { id },
          limit: 1,
        });

        res.status(200).json({
          isSuccessful: true,
          type: ResponseType.SUCCESS,
          data: establishment,
          message: MESSAGE_UPDATE
        })
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
        message: error
      });
    }
  };
}