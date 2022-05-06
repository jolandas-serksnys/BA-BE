import {
  Category
} from "../models";
import { ResponseType } from "../utils";
import { Request, Response } from "express";

const MESSAGE_CREATE = 'Category was successfully created';
const MESSAGE_UPDATE = 'Category was successfully updated';
const MESSAGE_DELETE = 'Category was successfully deleted';
const MESSAGE_404 = 'Couldn\'t find requested category';

export class CategoryController {
  public index = async (req: Request, res: Response) => {
    try {
      const { establishmentId } = req.params;

      const categories = await Category.findAll({
        where: {
          establishmentId
        }
      });

      return res.status(200).json({
        isSuccessful: true,
        type: ResponseType.SUCCESS,
        data: categories
      })
    } catch (error) {
      return res.status(500).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: error
      })
    }
  };

  public create = async (req: Request, res: Response) => {
    try {
      const { title, description, isVisible } = req.body;
      const { establishmentId } = req.params;

      await Category.create<Category>({ title, description, isVisible, establishmentId })
        .then((node: Category) => res.status(201).json({
          isSuccessful: true,
          type: ResponseType.SUCCESS,
          data: node,
          message: MESSAGE_CREATE
        }))
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

  public get = async (req: Request, res: Response) => {
    try {
      const { id, establishmentId } = req.params;

      await Category.findOne<Category>({
        where: {
          id,
          establishmentId
        }
      })
        .then((node: Category | null) => {
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
      const { id, establishmentId } = req.params;
      const { title, description, isVisible } = req.body;

      await Category.update({ title, description, isVisible }, {
        where: {
          id,
          establishmentId
        },
        limit: 1,
      })
        .then(() => {
          Category.findByPk(id)
            .then((node) => res.status(200).json({
              isSuccessful: true,
              type: ResponseType.SUCCESS,
              data: node,
              message: MESSAGE_UPDATE
            }))
            .catch((error: Error) => res.status(500).json({
              isSuccessful: false,
              type: ResponseType.DANGER,
              message: error
            }));
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

  public delete = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await Category.findByPk(id)
        .then((node) => {
          if (node) {
            Category.destroy({
              where: {
                id
              },
              limit: 1,
            })
              .then(() => res.status(200).json({
                isSuccessful: true,
                type: ResponseType.SUCCESS,
                data: node,
                message: MESSAGE_DELETE
              }))
              .catch((error: Error) => res.status(500).json({
                isSuccessful: false,
                type: ResponseType.DANGER,
                message: error
              }));
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
}