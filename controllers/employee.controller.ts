import { Employee, EmployeeInterface, SignUpCode } from "../models";
import { ResponseType } from "../utils";
import { generateCode } from "../utils/codeGenerator";
import { Request, Response } from "express";

const MESSAGE_202 = "Employee updated successfully";
const MESSAGE_204 = "Employee deleted successfully";
const MESSAGE_404 = "Employee not found";
const MESSAGE_204_SIGNUP = "Signup code deleted successfully";

export class EmployeeController {
  public index = async (req: Request, res: Response) => {
    try {
      const { establishmentId } = req.params;

      const nodes = await Employee.findAll<Employee>({
        where: {
          establishmentId
        },
      });

      res.json({
        isSuccessful: true,
        type: ResponseType.SUCCESS,
        data: nodes
      })
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
      const { establishmentId, id } = req.params;

      const employee = await Employee.findOne<Employee>({
        where: {
          id,
          establishmentId
        },
        attributes: ['id', 'firstName', 'lastName', 'email', 'role']

      });

      if (employee) {
        res.json({
          isSuccessful: true,
          type: ResponseType.SUCCESS,
          data: employee
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
      const { establishmentId, id } = req.params;
      const params: EmployeeInterface = req.body;

      await Employee.update(params, {
        where: {
          id,
          establishmentId
        },
        limit: 1,
      })
        .then(() => res.status(200).json({
          isSuccessful: true,
          type: ResponseType.SUCCESS,
          message: MESSAGE_202
        }));
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
      const { establishmentId, id } = req.params;

      await Employee.destroy({
        where: {
          id,
          establishmentId
        },
        limit: 1,
      });

      res.status(200).json({
        isSuccessful: true,
        type: ResponseType.SUCCESS,
        message: MESSAGE_204
      })

    } catch (error) {
      res.status(400).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: error
      });
    }
  };

  public indexSignUpCodes = async (req: Request, res: Response) => {
    try {
      const { establishmentId } = req.params;

      const nodes = await SignUpCode.findAll<SignUpCode>({
        where: {
          establishmentId,
          isClaimed: false
        },
      });

      return res.json({
        isSuccessful: true,
        type: ResponseType.SUCCESS,
        data: nodes
      });
    } catch (error) {
      res.status(400).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: error
      });
    }
  };

  public createSignUpCode = async (req: Request, res: Response) => {
    try {
      const { establishmentId } = req.params;
      const { role } = req.body;

      const code = generateCode(6);

      const newCode = await SignUpCode.create({
        establishmentId,
        code,
        role
      });

      res.status(201).json({
        isSuccessful: true,
        type: ResponseType.SUCCESS,
        data: newCode
      });
    } catch (error) {
      res.status(400).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: error
      });
    }
  };

  public deleteSignUpCode = async (req: Request, res: Response) => {
    try {
      const { establishmentId, id } = req.params;

      await SignUpCode.destroy({
        where: {
          id,
          establishmentId
        },
        limit: 1,
      })
        .then(() => res.status(200).json({
          isSuccessful: true,
          type: ResponseType.SUCCESS,
          message: MESSAGE_204_SIGNUP
        }));
    } catch (error) {
      res.status(400).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: error
      });
    }
  };
}