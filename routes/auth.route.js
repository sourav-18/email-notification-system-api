const router=require('express').Router();
const organizationController=require('../controllers/organization.controller');
const adminController=require('../controllers/admin/admin.controller');

router.post("/organizations/login",organizationController.login);
router.post("/admins/login",adminController.login);

module.exports = router;