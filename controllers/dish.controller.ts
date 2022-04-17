import { Dish, DishInterface } from "../models";
import { Addon } from "../models/menu/addon";
import { Option } from "../models/menu/option";
import { Tag } from "../models/menu/tag";
import { ResponseType } from "../utils";
import { Request, Response } from "express";
import { DestroyOptions, UpdateOptions } from "sequelize";

const MESSAGE_CREATE = 'Dish was successfully created';
const MESSAGE_UPDATE = 'Dish was successfully updated';
const MESSAGE_DELETE = 'Dish was successfully deleted';
const MESSAGE_404 = 'Couldn\'t find requested dish';

export class DishController {
  public index = async (req: Request, res: Response) => {
    const { categoryId } = req.params;

    await Dish.findAll({
      where: {
        categoryId,
        isVisible: true
      },
      include: [
        {
          model: Tag,
          as: 'tags',
        }
      ]
    })
      .then((nodes: Array<Dish>) => res.json({
        isSuccessful: true, type: ResponseType.SUCCESS, data: nodes
      }))
      .catch((error: Error) => res.status(500).json({
        isSuccessful: false, type: ResponseType.DANGER, message: error
      }));
  }

  public indexEmployee = async (req: Request, res: Response) => {
    const { categoryId } = req.params;

    await Dish.findAll({
      where: {
        categoryId
      },
      include: [
        {
          model: Tag,
          as: 'tags',
        }
      ]
    })
      .then((nodes: Array<Dish>) => res.json({
        isSuccessful: true, type: ResponseType.SUCCESS, data: nodes
      }))
      .catch((error: Error) => res.status(500).json({
        isSuccessful: false, type: ResponseType.DANGER, message: error
      }));
  }

  public create = async (req: Request, res: Response) => {
    const { categoryId } = req.params;
    const { tags, ...params } = req.body;

    await Dish.create<Dish>({ ...params, categoryId: categoryId })
      .then((node: Dish) => {
        tags.forEach(async (tag) => {
          await Tag.create<Tag>({
            title: tag,
            dishId: node.id
          });
        });

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

    await Dish.findByPk<Dish>(
      id,
      {
        include: [
          {
            model: Addon,
            as: 'addons',
            include: [
              {
                model: Option,
                as: 'options'
              }
            ]
          },
          {
            model: Tag,
            as: 'tags',
          }
        ]
      })
      .then((node: Dish | null) => {
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

  public update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const params: DishInterface = req.body;

    const update: UpdateOptions = {
      where: { id: id },
      limit: 1,
    };

    await Dish.update({ ...params }, update)
      .then(() => {
        Dish.findByPk(id)
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

  public delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    const options: DestroyOptions = {
      where: { id: id },
      limit: 1,
    };

    await Dish.findByPk(id)
      .then((node) => {
        if (node) {
          Dish.destroy(options)
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

  public toggleAvailability = async (req: Request, res: Response) => {
    const { id } = req.params;

    await Dish.findByPk(id)
      .then(async (node: Dish) => {
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
  }

  public toggleVisibility = async (req: Request, res: Response) => {
    const { id } = req.params;

    await Dish.findByPk(id)
      .then(async (node: Dish) => {
        if (node) {
          await node.update({ isVisible: !node.isVisible });
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
  }
}