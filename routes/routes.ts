import {
  TableController,
  EmployeeController,
  EstablishmentController,
  CategoryController,
  DishController
} from "../controllers";
import { AuthController } from "../controllers/authentication/authentication.controller";
import { environment as env } from "../environment";
import { checkDuplicate, verifyToken } from "../middleware";
import { OrderController } from "../controllers/order";

export class Routes {
  public authController: AuthController = new AuthController();
  public tablesController: TableController = new TableController();
  public employeeController: EmployeeController = new EmployeeController();
  public establishmentController: EstablishmentController = new EstablishmentController();
  public categoryController: CategoryController = new CategoryController();
  public dishController: DishController = new DishController();
  public orderController: OrderController = new OrderController();

  public routes(app): void {
    app.route(`${env.baseUrl}/`).get(this.tablesController.index);

    app.route(`${env.baseUrl}/user`).get(this.authController.user);
    app.route(`${env.baseUrl}/sign-in`).post(this.authController.customerSignIn);
    app.route(`${env.baseUrl}/e/sign-in`).post(this.authController.employeeSignIn);
    app.route(`${env.baseUrl}/e/sign-up`).post(checkDuplicate, this.authController.employeeSignUp);
    app.route(`${env.baseUrl}/e/update-account`).post(this.authController.employeeUpdateAccount);

    app.route(`${env.baseUrl}/table`)
      .get(this.tablesController.index)
      .post(verifyToken, this.tablesController.create);
    app.route(`${env.baseUrl}/table/check/:id`).get(this.tablesController.checkAvailability);
    app.route(`${env.baseUrl}/table/:id/check`).get(this.tablesController.checkAvailability);
    app.route(`${env.baseUrl}/table/claimed`).get(this.tablesController.getClaimed);
    app.route(`${env.baseUrl}/table/:id`)
      .get(this.tablesController.get)
      .put(verifyToken, this.tablesController.update)
      .delete(verifyToken, this.tablesController.delete);
    app.route(`${env.baseUrl}/table/:id/toggle-availability`)
      .post(verifyToken, this.tablesController.toggleAvailability);

    app.route(`${env.baseUrl}/employee`)
      .get(verifyToken, this.employeeController.index)
      .post(verifyToken, this.employeeController.create);
    app.route(`${env.baseUrl}/employee/:id`)
      .get(verifyToken, this.employeeController.get)
      .put(verifyToken, this.employeeController.update)
      .delete(verifyToken, this.employeeController.delete);

    app.route(`${env.baseUrl}/establishment`)
      .get(this.establishmentController.index)
      .post(verifyToken, this.establishmentController.create);
    app.route(`${env.baseUrl}/establishment/:id`)
      .get(this.establishmentController.get)
      .put(verifyToken, this.establishmentController.update)
      .delete(verifyToken, this.establishmentController.delete);

    app.route(`${env.baseUrl}/category`)
      .get(this.categoryController.index)
      .post(verifyToken, this.categoryController.create);
    app.route(`${env.baseUrl}/category/:id`)
      .get(this.categoryController.get)
      .put(verifyToken, this.categoryController.update)
      .delete(verifyToken, this.categoryController.delete);

    app.route(`${env.baseUrl}/category/:categoryId/dish`)
      .get(this.dishController.index)
      .post(verifyToken, this.dishController.create);
    app.route(`${env.baseUrl}/category/:categoryId/dish/:id`)
      .get(this.dishController.get)
      .put(verifyToken, this.dishController.update)
      .delete(verifyToken, this.dishController.delete);
    app.route(`${env.baseUrl}/category/:categoryId/dish/:id/toggle-availability`)
      .post(verifyToken, this.dishController.toggleAvailability);
    app.route(`${env.baseUrl}/category/:categoryId/dish/:id/toggle-visibility`)
      .post(verifyToken, this.dishController.toggleVisibility);

    app.route(`${env.baseUrl}/order`)
      .post(this.orderController.processOrder);
    app.route(`${env.baseUrl}/order/price`)
      .post(this.orderController.calculatePrice);
    app.route(`${env.baseUrl}/order/table`)
      .post(this.orderController.getTableOrder);
    app.route(`${env.baseUrl}/order/:id/cancel`)
      .post(this.orderController.cancel);
    app.route(`${env.baseUrl}/order/active`)
      .get(this.orderController.getActiveOrders);
    app.route(`${env.baseUrl}/order/:id/status`)
      .post(this.orderController.updateStatus);
  }
}