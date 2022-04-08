import { Request, Response } from "express";
import { DestroyOptions, UpdateOptions } from "sequelize";
import { Employee, EmployeeType } from "../../models";

export class EmployeeController {
  public index(req: Request, res: Response) {
    Employee.findAll<Employee>({})
      .then((nodes: Array<Employee>) => res.json(nodes))
      .catch((err: Error) => res.status(500).json(err));
  }

  public create(req: Request, res: Response) {
    const params: EmployeeType = req.body;

    Employee.create<Employee>({ params })
      .then((Employee: Employee) => res.status(201).json(Employee))
      .catch((err: Error) => res.status(500).json(err));
  }

  public get(req: Request, res: Response) {
    const id: number = parseInt(req.params.id);

    Employee.findByPk<Employee>(id)
      .then((Employee: Employee | null) => {
        if (Employee) {
          res.json(Employee);
        } else {
          res.status(404).json({ errors: ["Employee not found"] });
        }
      })
      .catch((err: Error) => res.status(500).json(err));
  }

  public update(req: Request, res: Response) {
    const id: number = parseInt(req.params.id);
    const params: EmployeeType = req.body;

    const update: UpdateOptions = {
      where: { id: id },
      limit: 1,
    };

    Employee.update(params, update)
      .then(() => res.status(202).json({ data: "success" }))
      .catch((err: Error) => res.status(500).json(err));
  }

  public delete(req: Request, res: Response) {
    const id: number = parseInt(req.params.id);
    const options: DestroyOptions = {
      where: { id: id },
      limit: 1,
    };

    Employee.destroy(options)
      .then(() => res.status(204).json({ data: "success" }))
      .catch((err: Error) => res.status(500).json(err));
  }
}