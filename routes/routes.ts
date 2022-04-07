import {
  TableController,
  EmployeeController,
  EstablishmentController,
  CategoryController,
  DishController
} from "../controllers";
import { AuthController } from "../controllers/authentication/authentication.controller";
import { checkDuplicate, isAdmin, isEmployee, verifyToken } from "../middleware";
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
    app.route(`${process.env.BASE_URL}/`)
      .get(this.tablesController.index);

    app.route(`${process.env.BASE_URL}/user`)
      .get(this.authController.user);
    app.route(`${process.env.BASE_URL}/sign-in`)
      .post(this.authController.customerSignIn);
    app.route(`${process.env.BASE_URL}/claimed`)
      .get([verifyToken], this.tablesController.getClaimed);

    app.route(`${process.env.BASE_URL}/e/sign-in`)
      .post(this.authController.employeeSignIn);
    app.route(`${process.env.BASE_URL}/e/sign-up`)
      .post(checkDuplicate, this.authController.employeeSignUp);
    app.route(`${process.env.BASE_URL}/e/update-account`)
      .post([verifyToken, isAdmin], this.authController.employeeUpdateAccount);

    app.route(`${process.env.BASE_URL}/employee`)
      .get([verifyToken, isAdmin], this.employeeController.index)
      .post([verifyToken, isAdmin], this.employeeController.create);
    app.route(`${process.env.BASE_URL}/employee/:id`)
      .get([verifyToken, isAdmin], this.employeeController.get)
      .put([verifyToken, isAdmin], this.employeeController.update)
      .delete([verifyToken, isAdmin], this.employeeController.delete);

    app.route(`${process.env.BASE_URL}/establishment`)
      .get([verifyToken, isAdmin], this.establishmentController.index)
      .post([verifyToken, isAdmin], this.establishmentController.create);
    app.route(`${process.env.BASE_URL}/establishment/:id`)
      .get(this.establishmentController.get)
      .put([verifyToken, isAdmin], this.establishmentController.update)
      .delete([verifyToken, isAdmin], this.establishmentController.delete);

    app.route(`${process.env.BASE_URL}/establishment/:establishmentId/table`)
      .get(this.tablesController.index)
      .post([verifyToken, isAdmin], this.tablesController.create);
    app.route(`${process.env.BASE_URL}/establishment/:establishmentId/table/:id/check-availability`)
      .get(this.tablesController.checkAvailability);
    app.route(`${process.env.BASE_URL}/establishment/:establishmentId/table/:id`)
      .get(this.tablesController.get)
      .put([verifyToken, isAdmin], this.tablesController.update)
      .delete([verifyToken, isAdmin], this.tablesController.delete);
    app.route(`${process.env.BASE_URL}/establishment/:establishmentId/table/:id/toggle-availability`)
      .post([verifyToken, isAdmin], this.tablesController.toggleAvailability);

    app.route(`${process.env.BASE_URL}/establishment/:establishmentId/category`)
      .get(this.categoryController.index)
      .post([verifyToken, isAdmin], this.categoryController.create);
    app.route(`${process.env.BASE_URL}/establishment/:establishmentId/category/:id`)
      .get(this.categoryController.get)
      .put([verifyToken, isAdmin], this.categoryController.update)
      .delete([verifyToken, isAdmin], this.categoryController.delete);

    app.route(`${process.env.BASE_URL}/establishment/:establishmentId/category/:categoryId/dish`)
      .get(this.dishController.index)
      .post([verifyToken, isAdmin], this.dishController.create);
    app.route(`${process.env.BASE_URL}/establishment/:establishmentId/category/:categoryId/dish/:id`)
      .get(this.dishController.get)
      .put([verifyToken, isAdmin], this.dishController.update)
      .delete([verifyToken, isAdmin], this.dishController.delete);
    app.route(`${process.env.BASE_URL}/establishment/:establishmentId/category/:categoryId/dish/:id/toggle-availability`)
      .post([verifyToken, isAdmin], this.dishController.toggleAvailability);
    app.route(`${process.env.BASE_URL}/establishment/:establishmentId/category/:categoryId/dish/:id/toggle-visibility`)
      .post([verifyToken, isAdmin], this.dishController.toggleVisibility);

    app.route(`${process.env.BASE_URL}/order`)
      .post(verifyToken, this.orderController.processOrder);
    app.route(`${process.env.BASE_URL}/order/price`)
      .post(verifyToken, this.orderController.calculatePrice);
    app.route(`${process.env.BASE_URL}/order/table`)
      .post(verifyToken, this.orderController.getTableOrder);
    app.route(`${process.env.BASE_URL}/order/:id/cancel`)
      .post(verifyToken, this.orderController.cancel);
    app.route(`${process.env.BASE_URL}/order/active`)
      .get([verifyToken, isEmployee], this.orderController.getActiveOrders);
    app.route(`${process.env.BASE_URL}/order/:id/status`)
      .post([verifyToken, isEmployee], this.orderController.updateStatus);
  }
}