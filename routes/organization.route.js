const router=require('express').Router();
const organizationController=require('../controllers/organization.controller');


router.post("/add-credential",organizationController.addCredentials);

module.exports = router;