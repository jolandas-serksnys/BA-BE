import { Model } from "sequelize";

export class BaseModel extends Model {
  declare id: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}