import { Request, Response } from "express";
import { Employee, EmployeeType, SignUpCode } from "../../models";
import { ResponseType } from "../../utils";
import { generateCode } from "../../utils/codeGenerator";

const MESSAGE_202 = "Employee updated successfully";
const MESSAGE_204 = "Employee deleted successfully";
const MESSAGE_404 = "Employee not found";
const MESSAGE_204_SIGNUP = "Signup code deleted successfully";

export class EmployeeController {
  public index = async (req: Request, res: Response) => {
    const { establishmentId } = req.params;

    const nodes = await Employee.findAll<Employee>({
      where: {
        establishmentId
      },
    });

    return res.json({
      isSuccessful: true,
      type: ResponseType.SUCCESS,
      data: nodes
    })
  }

  public get = async (req: Request, res: Response) => {
    const { establishmentId, id } = req.params;

    await Employee.findOne<Employee>({
      where: {
        id,
        establishmentId
      }
    })
      .then((Employee: Employee | null) => {
        if (Employee) {
          res.json({
            isSuccessful: true,
            type: ResponseType.SUCCESS,
            data: Employee
          });
        } else {
          res.status(404).json({
            isSuccessful: false,
            type: ResponseType.DANGER,
            message: MESSAGE_404
          });
        }
      })
      .catch((err: Error) => res.status(500).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: err.message
      }));
  }

  public update = async (req: Request, res: Response) => {
    const { establishmentId, id } = req.params;
    const params: EmployeeType = req.body;

    await Employee.update(params, {
      where: {
        id,
        establishmentId
      },
      limit: 1,
    })
      .then(() => res.status(202).json({
        isSuccessful: true,
        type: ResponseType.SUCCESS,
        message: MESSAGE_202
      }))
      .catch((err: Error) => res.status(500).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: err.message
      }));
  }

  public delete = async (req: Request, res: Response) => {
    const { establishmentId, id } = req.params;

    await Employee.destroy({
      where: {
        id,
        establishmentId
      },
      limit: 1,
    })
      .then(() => res.status(204).json({
        isSuccessful: true,
        type: ResponseType.SUCCESS,
        message: MESSAGE_204
      }))
      .catch((err: Error) => res.status(500).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: err.message
      }));
  }

  public indexSignUpCodes = async (req: Request, res: Response) => {
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
  }

  public createSignUpCode = async (req: Request, res: Response) => {
    const { establishmentId } = req.params;
    const { role } = req.body;

    const code = generateCode(6);

    const newCode = await SignUpCode.create({
      establishmentId,
      code,
      role
    });

    return res.json({
      isSuccessful: true,
      type: ResponseType.SUCCESS,
      data: newCode
    });
  }

  public deleteSignUpCode = async (req: Request, res: Response) => {
    const { establishmentId, id } = req.params;

    await SignUpCode.destroy({
      where: {
        id,
        establishmentId
      },
      limit: 1,
    })
      .then(() => res.status(204).json({
        isSuccessful: true,
        type: ResponseType.SUCCESS,
        message: MESSAGE_204_SIGNUP
      }))
      .catch((err: Error) => res.status(500).json({
        isSuccessful: false,
        type: ResponseType.DANGER,
        message: err.message
      }));
  }

}