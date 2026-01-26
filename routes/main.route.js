const router=require('express').Router();
const notificationRouter=require('../routes/notification.route');
const organizationRouter=require('../routes/organization.route');
const authRouter=require('../routes/auth.route');

router.use("/auth",authRouter);
router.use("/notifications",notificationRouter);
router.use("/organizations",organizationRouter);

module.exports = router;