const router=require('express').Router();
const notificationRouter=require('../routes/notification.route');
const organizationRouter=require('../routes/organization.route');
const authRouter=require('../routes/auth.route');
const authenticationMiddleware=require("../middlewares/authentication.middleware");

router.use("/auth",authRouter);
router.use("/notifications",authenticationMiddleware.checkTokenForOrganization,notificationRouter);
router.use("/organizations",authenticationMiddleware.checkTokenForOrganization,organizationRouter);

module.exports = router;