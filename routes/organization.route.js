const router=require('express').Router();
const organizationController=require('../controllers/organization.controller');

router.post("/",organizationController.create);

module.exports = router;