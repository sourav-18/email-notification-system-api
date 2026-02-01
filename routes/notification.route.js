const router=require('express').Router();
const notificationController=require('../controllers/notification.controller');
const notificationHistoryController=require('../controllers/notificationHistory.controller');

router.post("/send",notificationController.send);
router.get("/histories",notificationHistoryController.list);
router.get("/histories/:id",notificationHistoryController.detailsById);
router.get("/queues",notificationController.list);
router.get("/queues/:id",notificationController.detailsById);
router.put("/queues/cancel/:id",notificationController.cancel);

module.exports = router;