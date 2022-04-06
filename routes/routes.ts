import {
  TableController,
  EmployeeController,
  EstablishmentController,
  CategoryController,
  DishController
} from "../controllers";
import { AuthController } from "../controllers/authentication/authentication.controller";
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
    app.route(`${process.env.BASE_URL}/`).get(this.tablesController.index);

    app.route(`${process.env.BASE_URL}/user`).get(this.authController.user);
    app.route(`${process.env.BASE_URL}/sign-in`).post(this.authController.customerSignIn);
    app.route(`${process.env.BASE_URL}/e/sign-in`).post(this.authController.employeeSignIn);
    app.route(`${process.env.BASE_URL}/e/sign-up`).post(checkDuplicate, this.authController.employeeSignUp);
    app.route(`${process.env.BASE_URL}/e/update-account`).post(this.authController.employeeUpdateAccount);

    app.route(`${process.env.BASE_URL}/table`)
      .get(this.tablesController.index)
      .post(verifyToken, this.tablesController.create);
    app.route(`${process.env.BASE_URL}/table/check/:id`).get(this.tablesController.checkAvailability);
    app.route(`${process.env.BASE_URL}/table/:id/check`).get(this.tablesController.checkAvailability);
    app.route(`${process.env.BASE_URL}/table/claimed`).get(this.tablesController.getClaimed);
    app.route(`${process.env.BASE_URL}/table/:id`)
      .get(this.tablesController.get)
      .put(verifyToken, this.tablesController.update)
      .delete(verifyToken, this.tablesController.delete);
    app.route(`${process.env.BASE_URL}/table/:id/toggle-availability`)
      .post(verifyToken, this.tablesController.toggleAvailability);

    app.route(`${process.env.BASE_URL}/employee`)
      .get(verifyToken, this.employeeController.index)
      .post(verifyToken, this.employeeController.create);
    app.route(`${process.env.BASE_URL}/employee/:id`)
      .get(verifyToken, this.employeeController.get)
      .put(verifyToken, this.employeeController.update)
      .delete(verifyToken, this.employeeController.delete);

    app.route(`${process.env.BASE_URL}/establishment`)
      .get(this.establishmentController.index)
      .post(verifyToken, this.establishmentController.create);
    app.route(`${process.env.BASE_URL}/establishment/:id`)
      .get(this.establishmentController.get)
      .put(verifyToken, this.establishmentController.update)
      .delete(verifyToken, this.establishmentController.delete);

    app.route(`${process.env.BASE_URL}/category`)
      .get(this.categoryController.index)
      .post(verifyToken, this.categoryController.create);
    app.route(`${process.env.BASE_URL}/category/:id`)
      .get(this.categoryController.get)
      .put(verifyToken, this.categoryController.update)
      .delete(verifyToken, this.categoryController.delete);

    app.route(`${process.env.BASE_URL}/category/:categoryId/dish`)
      .get(this.dishController.index)
      .post(verifyToken, this.dishController.create);
    app.route(`${process.env.BASE_URL}/category/:categoryId/dish/:id`)
      .get(this.dishController.get)
      .put(verifyToken, this.dishController.update)
      .delete(verifyToken, this.dishController.delete);
    app.route(`${process.env.BASE_URL}/category/:categoryId/dish/:id/toggle-availability`)
      .post(verifyToken, this.dishController.toggleAvailability);
    app.route(`${process.env.BASE_URL}/category/:categoryId/dish/:id/toggle-visibility`)
      .post(verifyToken, this.dishController.toggleVisibility);

    app.route(`${process.env.BASE_URL}/order`)
      .post(this.orderController.processOrder);
    app.route(`${process.env.BASE_URL}/order/price`)
      .post(this.orderController.calculatePrice);
    app.route(`${process.env.BASE_URL}/order/table`)
      .post(this.orderController.getTableOrder);
    app.route(`${process.env.BASE_URL}/order/:id/cancel`)
      .post(this.orderController.cancel);
    app.route(`${process.env.BASE_URL}/order/active`)
      .get(this.orderController.getActiveOrders);
    app.route(`${process.env.BASE_URL}/order/:id/status`)
      .post(this.orderController.updateStatus);
  }
}