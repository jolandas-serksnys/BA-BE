import { Request, Response } from "express";
import { DestroyOptions, UpdateOptions } from "sequelize";
import { database } from "../../config";
import { Category, CategoryInterface, Dish, Employee } from "../../models";
import { Tag } from "../../models/menu/tag";
import { ResponseType } from "../../utils";
import { AuthController } from "../authentication";

const MESSAGE_CREATE = 'Category was successfully created';
const MESSAGE_UPDATE = 'Category was successfully updated';
const MESSAGE_DELETE = 'Category was successfully deleted';
const MESSAGE_404 = 'Couldn\'t find requested category';

export class CategoryController {
  public index = async (req: Request, res: Response) => {
    const { establishmentId } = req.params;

    const categories = await Category.findAll({
      where: {
        establishmentId
      }
    });

    return res.json({
      isSuccessful: true,
      type: ResponseType.SUCCESS,
      data: categories
    })
  }

  public create = async (req: Request, res: Response) => {
    const params: CategoryInterface = req.body;

    const { userId } = req.body;
    const user = await Employee.findByPk(userId);

    params.establishmentId = user.getDataValue('establishmentId');

    await Category.create<Category>({ ...params })
      .then((node: Category) => res.status(201).json({
        isSuccessful: true, type: ResponseType.SUCCESS, data: node, message: MESSAGE_CREATE
      }))
      .catch((error: Error) => res.status(500).json({
        isSuccessful: false, type: ResponseType.DANGER, message: error
      }));
  }

  public get = async (req: Request, res: Response) => {
    const { id } = req.params;

    await Category.findByPk<Category>(id)
      .then((node: Category | null) => {
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
    const params: CategoryInterface = req.body;

    const update: UpdateOptions = {
      where: { id: id },
      limit: 1,
    };

    await Category.update({ ...params }, update)
      .then(() => {
        Category.findByPk(id)
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

    await Category.findByPk(id)
      .then((node) => {
        if (node) {
          Category.destroy(options)
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