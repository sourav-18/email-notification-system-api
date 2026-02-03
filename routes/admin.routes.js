const router=require('express').Router();
const authenticationMiddleware=require("../middlewares/authentication.middleware");
const organizationController=require('../controllers/admin/organization.controller');
const credentialController=require('../controllers/admin/credential.controller');
const notificationController=require("../controllers/admin/notification.controller");
const adminController=require("../controllers/admin/admin.controller");



//admin
router.get("/profile",adminController.profileDetails);

//organization 
router.post("/organizations",organizationController.create);
router.get("/organizations",organizationController.list);
router.patch("/organizations/:id/status/:status",organizationController.statusUpdate);

//credentials

router.get("/organizations/credentials",credentialController.list);
router.patch("/organizations/credentials/:id/status/:status",credentialController.statusUpdate);

//Notifications
router.get("/notifications/histories",notificationController.historyList);
router.get("/notifications/histories/:id",notificationController.historyDetailsById);
router.get("/notifications/queues",notificationController.queueList);
router.get("/notifications/queues/:id",notificationController.queueDetailsById);



module.exports = router;