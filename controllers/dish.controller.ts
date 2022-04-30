import {
  Addon,
  Category,
  Dish,
  DishInterface,
  Option,
  OptionInterface,
  Tag
} from "../models";
import { ResponseType } from "../utils";
import { Request, Response } from "express";
import { DestroyOptions, UpdateOptions } from "sequelize";

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
          isSuccessful: true,
          type: ResponseType.SUCCESS,
          data: nodes
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
        message: error.message
      });
    }
  };

  public indexEmployee = async (req: Request, res: Response) => {
    try {
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
          isSuccessful: true,
          type: ResponseType.SUCCESS,
          data: nodes
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

  public create = async (req: Request, res: Response) => {
    try {
      const { categoryId } = req.params;
      const { tags, ...params } = req.body;

      await Dish.create<Dish>({ ...params, categoryId })
        .then((node: Dish) => {
          tags.forEach(async (tag) => {
            await Tag.create<Tag>({
              title: tag,
              dishId: node.id
            });
          });

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
      const { id } = req.params;
      const params: DishInterface = req.body;

      const update: UpdateOptions = {
        where: { id: id },
        limit: 1,
      };

      await Dish.update({ ...params }, update)
        .then(() => {
          Dish.findByPk(id)
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
      const options: DestroyOptions = {
        where: { id: id },
        limit: 1,
      };

      await Dish.findByPk(id)
        .then((node) => {
          if (node) {
            Dish.destroy(options)
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

  public toggleAvailability = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await Dish.findByPk(id)
        .then(async (node: Dish) => {
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
    } catch (error) {
      res.status(500).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: error
      });
    }
  };

  public toggleVisibility = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await Dish.findByPk(id)
        .then(async (node: Dish) => {
          if (node) {
            await node.update({ isVisible: !node.isVisible });
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
    } catch (error) {
      res.status(500).json({
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
        }
      });

      res.status(200).json({
        isSuccessful: true,
        type: ResponseType.SUCCESS,
        data: addons,
      });
    } catch (error) {
      res.status(500).json({
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

      await Dish.findOne({
        where: {
          id,
          categoryId
        },
      })
        .then(async (node: Dish) => {
          if (node) {
            await Addon.create({
              title,
              price,
              isOptional,
              isMultiple,
              dishId: id,
            })
              .then(async (node: Addon) => {
                if (options) {
                  await Promise.all(options.map(async (option: Option) => {
                    await Option.create({
                      title: option.title,
                      price: option.price,
                      addonId: node.id,
                    });
                  }));
                }

                res.status(200).json({
                  isSuccessful: true,
                  type: ResponseType.SUCCESS,
                  message: MESSAGE_ADDON_CREATE,
                  data: node,
                });
              })
          } else {
            res.status(404).json({
              isSuccessful: false,
              type: ResponseType.DANGER,
              message: MESSAGE_404
            });
          }
        });
    } catch (error) {
      res.status(500).json({
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

      await Dish.findOne({
        where: {
          id: dishId,
          categoryId
        },
      })
        .then(async (node: Dish) => {
          if (node) {
            await Addon.findOne({
              where: {
                id,
                dishId
              }
            })
              .then(async (addon: Addon) => {
                if (addon) {
                  await addon.update({
                    title,
                    price,
                    isOptional,
                    isMultiple,
                  })
                    .then(async () => {
                      if (options) {
                        await Promise.all(options.map(async (option: OptionInterface) => {
                          if (option.id) {
                            await Option.findOne({
                              where: {
                                id: option.id,
                                addonId: addon.id
                              }
                            })
                              .then(async (node: Option) => {
                                if (node) {
                                  if (option.isDeleted) {
                                    await node.destroy();
                                  } else {
                                    await node.update({
                                      name: option.title,
                                      price: option.price,
                                    });
                                  }
                                }
                              });
                          } else {
                            await Option.create({
                              title: option.title,
                              price: option.price,
                              addonId: addon.id,
                            });
                          }
                        }));
                      }
                      res.status(200).json({
                        isSuccessful: true,
                        type: ResponseType.SUCCESS,
                        message: MESSAGE_ADDON_UPDATE
                      });
                    });
                } else {
                  res.status(404).json({
                    isSuccessful: false,
                    type: ResponseType.DANGER,
                    message: MESSAGE_404
                  });
                }
              });
          } else {
            res.status(404).json({
              isSuccessful: false,
              type: ResponseType.DANGER,
              message: MESSAGE_404
            });
          }
        });
    } catch (error) {
      res.status(500).json({
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
        res.status(404).json({
          isSuccessful: false,
          type: ResponseType.DANGER,
          message: MESSAGE_404
        });
      }

      await Addon.findOne({
        where: {
          id,
          dishId
        }
      })
        .then(async (node: Addon) => {
          if (node) {
            await node.destroy();
            res.status(200).json({
              isSuccessful: true,
              type: ResponseType.SUCCESS,
              message: MESSAGE_ADDON_DELETE
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
}