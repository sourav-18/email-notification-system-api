const router=require('express').Router();
const notificationRouter=require('../routes/notification.route');

router.use("/notifications",notificationRouter);

module.exports = router;