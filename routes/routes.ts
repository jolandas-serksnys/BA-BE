import {
  AuthController,
  CategoryController,
  DishController,
  EmployeeController,
  EstablishmentController,
  OrderController,
  TableClaimController,
  TableController
} from "../controllers";
import {
  checkDuplicate,
  isAdmin,
  isEmployee,
  verifyToken
} from "../middleware";

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
    app.route(`/api/`)
      .get(this.tablesController.index);

    app.route(`/api/user`)
      .get([verifyToken], this.authController.getUser);
    app.route(`/api/establishment/:establishmentId/sign-in`)
      .post(this.authController.customerSignIn);
    app.route(`/api/claimed`)
      .get([verifyToken], this.tableClaimController.getClaimed);
    app.route(`/api/toggle-access-requests`)
      .post([verifyToken], this.tableClaimController.toggleAccessRequests);
    app.route(`/api/assistance`)
      .post([verifyToken], this.tableClaimController.requestAssistance);
    app.route(`/api/establishment/:establishmentId/table/:id/check-availability`)
      .get(this.tableClaimController.checkAvailability);
    app.route(`/api/order/table/:id/toggle`)
      .post([verifyToken, isEmployee], this.orderController.toggleTableOrderClaim);

    app.route(`/api/employee/sign-in`)
      .post(this.authController.employeeSignIn);
    app.route(`/api/establishment/:establishmentId/employee/sign-up`)
      .post(checkDuplicate, this.authController.employeeSignUp);
    app.route(`/api/employee/update-account`)
      .post([verifyToken, isEmployee], this.authController.employeeUpdateAccount);
    app.route(`/api/employee/update-password`)
      .post([verifyToken, isEmployee], this.authController.employeeUpdatePassword);

    app.route(`/api/establishment/:establishmentId/employee`)
      .get([verifyToken, isAdmin], this.employeeController.index);
    app.route(`/api/establishment/:establishmentId/employee/:id`)
      .get([verifyToken, isAdmin], this.employeeController.get)
      .put([verifyToken, isAdmin], this.employeeController.update)
      .delete([verifyToken, isAdmin], this.employeeController.delete);

    app.route(`/api/establishment/:establishmentId/sign-up-code`)
      .get([verifyToken, isAdmin], this.employeeController.indexSignUpCodes)
      .post([verifyToken, isAdmin], this.employeeController.createSignUpCode);

    app.route(`/api/establishment/:establishmentId/sign-up-code/:id`)
      .delete([verifyToken, isAdmin], this.employeeController.deleteSignUpCode);

    app.route(`/api/establishment/:id`)
      .get([verifyToken], this.establishmentController.get)
      .put([verifyToken, isAdmin], this.establishmentController.update);

    app.route(`/api/establishment/:establishmentId/table`)
      .get([verifyToken], this.tablesController.index)
      .post([verifyToken, isAdmin], this.tablesController.create);
    app.route(`/api/establishment/:establishmentId/table/:id`)
      .get([verifyToken], this.tablesController.get)
      .put([verifyToken, isAdmin], this.tablesController.update)
      .delete([verifyToken, isAdmin], this.tablesController.delete);
    app.route(`/api/establishment/:establishmentId/table/:id/toggle-availability`)
      .post([verifyToken, isAdmin], this.tablesController.toggleAvailability);

    app.route(`/api/establishment/:establishmentId/category`)
      .get([verifyToken], this.categoryController.index)
      .post([verifyToken, isAdmin], this.categoryController.create);
    app.route(`/api/establishment/:establishmentId/category/:id`)
      .get([verifyToken], this.categoryController.get)
      .put([verifyToken, isAdmin], this.categoryController.update)
      .delete([verifyToken, isAdmin], this.categoryController.delete);

    app.route(`/api/establishment/:establishmentId/category/:categoryId/dish`)
      .get([verifyToken], this.dishController.index)
      .post([verifyToken, isAdmin], this.dishController.create);
    app.route(`/api/establishment/:establishmentId/category/:categoryId/dish/all`)
      .get([verifyToken, isEmployee], this.dishController.indexEmployee);
    app.route(`/api/establishment/:establishmentId/category/:categoryId/dish/:id`)
      .get([verifyToken], this.dishController.get)
      .put([verifyToken, isAdmin], this.dishController.update)
      .delete([verifyToken, isAdmin], this.dishController.delete);
    app.route(`/api/establishment/:establishmentId/category/:categoryId/dish/:id/toggle-availability`)
      .post([verifyToken, isAdmin], this.dishController.toggleAvailability);
    app.route(`/api/establishment/:establishmentId/category/:categoryId/dish/:id/toggle-visibility`)
      .post([verifyToken, isAdmin], this.dishController.toggleVisibility);
    app.route(`/api/establishment/:establishmentId/category/:categoryId/dish/:id/addon`)
      .get([verifyToken, isAdmin], this.dishController.indexAddons)
      .post([verifyToken, isAdmin], this.dishController.createAddon);
    app.route(`/api/establishment/:establishmentId/category/:categoryId/dish/:dishId/addons/:id`)
      .put([verifyToken, isAdmin], this.dishController.updateAddon)
      .delete([verifyToken, isAdmin], this.dishController.deleteAddon);

    app.route(`/api/order`)
      .post(verifyToken, this.orderController.processOrder);
    app.route(`/api/order/price`)
      .post(verifyToken, this.orderController.calculatePrice);
    app.route(`/api/order/table`)
      .post(verifyToken, this.orderController.getTableOrder);
    app.route(`/api/order/:id/cancel`)
      .post(verifyToken, this.orderController.cancelCustomerOrder);
    app.route(`/api/order/active`)
      .post([verifyToken, isEmployee], this.orderController.getActiveOrders);
    app.route(`/api/order/receipt/customer`)
      .get([verifyToken], this.orderController.getCustomerReceipt);
    app.route(`/api/order/receipt/total`)
      .get([verifyToken], this.orderController.getTableReceiptTotal);
    app.route(`/api/order/:id/status`)
      .post([verifyToken, isEmployee], this.orderController.updateStatus);
    app.route(`/api/order/receipts`)
      .get([verifyToken], this.orderController.getReceipts);

    app.route(`/api/claim/:id/toggle-seats-limit`)
      .post([verifyToken, isEmployee], this.tableClaimController.toggleSeatsLimitBypass);
    app.route(`/api/establishment/:establishmentId/assistance-requests`)
      .get([verifyToken, isEmployee], this.tableClaimController.getAssistanceRequests);
    app.route(`/api/establishment/:establishmentId/assistance-requests/:id/dismiss`)
      .post([verifyToken, isEmployee], this.tableClaimController.dismissAssistanceRequest);
  }
}