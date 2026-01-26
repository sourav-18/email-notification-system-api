const router=require('express').Router();
const organizationController=require('../controllers/organization.controller');

router.post("/organizations/login",organizationController.login);

module.exports = router;