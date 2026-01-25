const router=require('express').Router();
const notificationController=require('../controllers/notification.controller');

router.post("/send-immediate",notificationController.sendImmediate);

module.exports = router;