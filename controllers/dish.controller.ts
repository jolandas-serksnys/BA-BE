import {
  Addon,
  Category,
  Dish,
  Option,
  OptionInterface,
  Tag
} from "../models";
import { ResponseType } from "../utils";
import { Request, Response } from "express";

const MESSAGE_CREATE = 'Dish was successfully created';
const MESSAGE_UPDATE = 'Dish was successfully updated';
const MESSAGE_DELETE = 'Dish was successfully deleted';
const MESSAGE_404 = 'Couldn\'t find requested dish';
const MESSAGE_ADDON_CREATE = 'Addon was successfully created';
const MESSAGE_ADDON_UPDATE = 'Addon was successfully updated';
const MESSAGE_ADDON_DELETE = 'Addon was successfully deleted';

export class DishController {
  public index = async (req: Request, res: Response) => {
    try {
      const { categoryId } = req.params;

      const dishes = await Dish.findAll({
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
      });

      res.json({
        isSuccessful: true,
        type: ResponseType.SUCCESS,
        data: dishes
      })
    } catch (error) {
      res.status(400).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: error.message
      });
    }
  };

  public indexEmployee = async (req: Request, res: Response) => {
    try {
      const { categoryId } = req.params;

      const dishes = await Dish.findAll({
        where: {
          categoryId
        },
        include: [
          {
            model: Tag,
            as: 'tags',
          }
        ]
      });

      res.json({
        isSuccessful: true,
        type: ResponseType.SUCCESS,
        data: dishes
      });
    } catch (error) {
      res.status(400).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: error
      });
    }
  };

  public create = async (req: Request, res: Response) => {
    try {
      const { categoryId } = req.params;
      const { tags, ...params } = req.body;

      const dish = await Dish.create({
        ...params,
        categoryId
      });

      if (tags) {
        await tags.forEach(async (tag) => {
          await Tag.create<Tag>({
            title: tag,
            dishId: dish.id
          });
        });
      }

      res.status(201).json({
        isSuccessful: true,
        type: ResponseType.SUCCESS,
        data: dish,
        message: MESSAGE_CREATE
      });
    } catch (error) {
      res.status(400).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: error
      });
    }
  };

  public get = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const dish = await Dish.findOne({
        where: {
          id
        },
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
      });

      if (!dish) {
        return res.status(404).json({
          isSuccessful: false,
          type: ResponseType.DANGER,
          message: MESSAGE_404
        });
      }

      res.json({
        isSuccessful: true,
        type: ResponseType.SUCCESS,
        data: dish
      });
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
      const { id, categoryId } = req.params;
      const params = req.body;

      const dish = await Dish.findOne({
        where: {
          id,
          categoryId
        }
      });

      if (!dish) {
        return res.status(404).json({
          isSuccessful: false,
          type: ResponseType.DANGER,
          message: MESSAGE_404
        });
      }

      await dish.update(params);

      res.json({
        isSuccessful: true,
        type: ResponseType.SUCCESS,
        data: dish,
        message: MESSAGE_UPDATE
      });
    } catch (error) {
      res.status(400).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: error
      });
    }
  };

  public delete = async (req: Request, res: Response) => {
    try {
      const { id, categoryId } = req.params;

      const dish = await Dish.findOne({
        where: {
          id,
          categoryId
        }
      });

      if (!dish) {
        return res.status(404).json({
          isSuccessful: false,
          type: ResponseType.DANGER,
          message: MESSAGE_404
        });
      }

      await dish.destroy();

      res.json({
        isSuccessful: true,
        type: ResponseType.SUCCESS,
        message: MESSAGE_DELETE
      });
    } catch (error) {
      res.status(400).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: error
      });
    }
  };

  public toggleAvailability = async (req: Request, res: Response) => {
    try {
      const { id, categoryId } = req.params;

      const dish = await Dish.findOne({
        where: {
          id,
          categoryId
        }
      });

      if (!dish) {
        return res.status(404).json({
          isSuccessful: false,

          type: ResponseType.DANGER,
          message: MESSAGE_404
        });
      }

      await dish.update({
        isAvailable: !dish.isAvailable
      });

      res.json({
        isSuccessful: true,
        type: ResponseType.SUCCESS,
        data: dish,
        message: MESSAGE_UPDATE
      });
    } catch (error) {
      res.status(400).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: error
      });
    }
  };

  public toggleVisibility = async (req: Request, res: Response) => {
    try {
      const { id, categoryId } = req.params;

      const dish = await Dish.findOne({
        where: {
          id,
          categoryId
        }
      });

      if (!dish) {
        return res.status(404).json({
          isSuccessful: false,

          type: ResponseType.DANGER,
          message: MESSAGE_404
        });
      }

      await dish.update({
        isVisible: !dish.isVisible
      });

      res.json({
        isSuccessful: true,
        type: ResponseType.SUCCESS,
        data: dish,
        message: MESSAGE_UPDATE
      });
    } catch (error) {
      res.status(400).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: error
      });
    }
  };

  public indexAddons = async (req: Request, res: Response) => {
    try {
      const { establishmentId, categoryId, id } = req.params;

      const category = await Category.findOne({
        where: { id: categoryId, establishmentId }
      });

      const dish = await Dish.findOne({
        where: { id, categoryId }
      });

      if (!dish || !category) {
        return res.status(404).json({
          isSuccessful: false,
          type: ResponseType.DANGER,
          message: MESSAGE_404
        });
      }

      const addons = await Addon.findAll({
        where: {
          dishId: id,
        },
        include: [{
          model: Option,
          as: 'options',
        }],
      });

      res.status(200).json({
        isSuccessful: true,
        type: ResponseType.SUCCESS,
        data: addons,
      });
    } catch (error) {
      res.status(400).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: error
      });
    }
  };

  public createAddon = async (req: Request, res: Response) => {
    try {
      const { id, categoryId } = req.params;
      const { title, price, isOptional, isMultiple, options } = req.body;

      const dish = await Dish.findOne({
        where: {
          id,
          categoryId
        },
      });

      if (!dish) {
        return res.status(404).json({
          isSuccessful: false,
          type: ResponseType.DANGER,
          message: MESSAGE_404
        });
      }

      const addon = await Addon.create({
        title,
        price,
        isOptional,
        isMultiple,
        dishId: id,
      });

      if (options) {
        await Promise.all(options.map(async (option: any) => {
          const optionCreated = await Option.create({
            title: option.title,
            price: option.price,
            addonId: addon.id,
          });
          return optionCreated;
        }));
      }

      res.status(201).json({
        isSuccessful: true,
        type: ResponseType.SUCCESS,
        data: addon.get({ plain: true }),
        message: MESSAGE_ADDON_CREATE
      });
    } catch (error) {
      res.status(400).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: error
      });
    }
  };

  public updateAddon = async (req: Request, res: Response) => {
    try {
      const { id, dishId, categoryId } = req.params;
      const { title, price, isOptional, isMultiple, options } = req.body;

      const dish = await Dish.findOne({
        where: {
          id: dishId,
          categoryId
        },
      });

      if (!dish) {
        return res.status(404).json({
          isSuccessful: false,
          type: ResponseType.DANGER,
          message: MESSAGE_404
        });
      }

      const addon = await Addon.findOne({
        where: {
          id,
          dishId
        },
      });

      if (!addon) {
        return res.status(404).json({
          isSuccessful: false,
          type: ResponseType.DANGER,
          message: MESSAGE_404
        });
      }

      await addon.update({
        title,
        price,
        isOptional,
        isMultiple,
        dishId,
      });

      if (options) {
        await Promise.all(options.map(async (option: OptionInterface) => {
          if (!option.id) {
            await Option.create({
              title: option.title,
              price: option.price,
              addonId: addon.id,
            });
          } else {
            const optionCreated = await Option.findOne({
              where: {
                id: option.id,
                addonId: addon.id,
              },
            });

            if (option.isDeleted) {
              await optionCreated.destroy();
            } else if (optionCreated) {
              await optionCreated.update({
                title: option.title,
                price: option.price,
              });
            }
          }
        }));
      }

      res.status(200).json({
        isSuccessful: true,
        type: ResponseType.SUCCESS,
        data: addon.get({ plain: true }),
        message: MESSAGE_ADDON_UPDATE
      });
    } catch (error) {
      res.status(400).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: error
      });
    }
  };

  public deleteAddon = async (req: Request, res: Response) => {
    try {
      const { categoryId, dishId, id } = req.params;

      const dish = await Dish.findOne({
        where: {
          id: dishId,
          categoryId
        }
      });

      if (!dish) {
        return res.status(404).json({
          isSuccessful: false,
          type: ResponseType.DANGER,
          message: MESSAGE_404
        });
      }

      const addon = await Addon.findOne({
        where: {
          id,
          dishId
        }
      });

      if (!addon) {
        return res.status(404).json({
          isSuccessful: false,
          type: ResponseType.DANGER,
          message: MESSAGE_404
        });
      }

      await addon.destroy();

      res.status(200).json({
        isSuccessful: true,
        type: ResponseType.SUCCESS,
        message: MESSAGE_ADDON_DELETE
      });
    } catch (error) {
      res.status(400).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: error
      });
    }
  };
}