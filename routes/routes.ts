import {
  AuthController,
  TableController,
  EmployeeController,
  EstablishmentController,
  CategoryController,
  DishController,
  OrderController,
  TableClaimController
} from "../controllers";
import { checkDuplicate, isAdmin, isEmployee, verifyToken } from "../middleware";

export class Routes {
  public authController: AuthController = new AuthController();
  public tablesController: TableController = new TableController();
  public tableClaimController: TableClaimController = new TableClaimController();
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
    app.route(`${process.env.BASE_URL}/establishment/:establishmentId/sign-in`)
      .post(this.authController.customerSignIn);
    app.route(`${process.env.BASE_URL}/claimed`)
      .get([verifyToken], this.tableClaimController.getClaimed);
    app.route(`${process.env.BASE_URL}/toggle-access-requests`)
      .post([verifyToken], this.tableClaimController.toggleAccessRequests);

    app.route(`${process.env.BASE_URL}/employee/sign-in`)
      .post(this.authController.employeeSignIn);
    app.route(`${process.env.BASE_URL}/establishment/:establishmentId/employee/sign-up`)
      .post(checkDuplicate, this.authController.employeeSignUp);
    app.route(`${process.env.BASE_URL}/employee/update-account`)
      .post([verifyToken, isEmployee], this.authController.employeeUpdateAccount);
    app.route(`${process.env.BASE_URL}/employee/update-password`)
      .post([verifyToken, isEmployee], this.authController.employeeUpdatePassword);

    app.route(`${process.env.BASE_URL}/establishment/:establishmentId/employee`)
      .get([verifyToken, isAdmin], this.employeeController.index);
    app.route(`${process.env.BASE_URL}/establishment/:establishmentId/employee/:id`)
      .get([verifyToken, isAdmin], this.employeeController.get)
      .put([verifyToken, isAdmin], this.employeeController.update)
      .delete([verifyToken, isAdmin], this.employeeController.delete);

    app.route(`${process.env.BASE_URL}/establishment/:establishmentId/sign-up-code`)
      .get([verifyToken, isAdmin], this.employeeController.indexSignUpCodes)
      .post([verifyToken, isAdmin], this.employeeController.createSignUpCode);

    app.route(`${process.env.BASE_URL}/establishment/:establishmentId/sign-up-code/:id`)
      .delete([verifyToken, isAdmin], this.employeeController.deleteSignUpCode);

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
      .get(this.tableClaimController.checkAvailability);
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
    app.route(`${process.env.BASE_URL}/establishment/:establishmentId/category/:categoryId/dish/all`)
      .get(this.dishController.indexEmployee);
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
    app.route(`${process.env.BASE_URL}/order/table/:id/toggle`)
      .post([verifyToken, isEmployee], this.orderController.toggleTableOrderClaim);
    app.route(`${process.env.BASE_URL}/order/:id/cancel`)
      .post(verifyToken, this.orderController.cancel);
    app.route(`${process.env.BASE_URL}/order/active`)
      .post([verifyToken, isEmployee], this.orderController.getActiveOrders);
    app.route(`${process.env.BASE_URL}/order/:id/status`)
      .post([verifyToken, isEmployee], this.orderController.updateStatus);
    app.route(`${process.env.BASE_URL}/order/receipts`)
      .get([verifyToken], this.orderController.getOrderReceipts);
    app.route(`${process.env.BASE_URL}/order/receipt/user`)
      .get([verifyToken], this.orderController.getCustomerReceipt);

    app.route(`${process.env.BASE_URL}/claim/:id/toggle-seats-limit`)
      .post([verifyToken, isEmployee], this.tableClaimController.toggleSeatsLimitBypass);
  }
}