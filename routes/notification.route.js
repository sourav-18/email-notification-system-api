const router=require('express').Router();
const notificationController=require('../controllers/notification.controller');
const notificationHistoryController=require('../controllers/notificationHistory.controller');

router.post("/send-immediate",notificationController.sendImmediate);
router.get("/histories",notificationHistoryController.list);

module.exports = router;