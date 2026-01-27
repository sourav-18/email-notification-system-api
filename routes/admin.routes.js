const router=require('express').Router();
const authenticationMiddleware=require("../middlewares/authentication.middleware");
const organizationController=require('../controllers/organization.controller');



//organization 
router.post("/organizations",authenticationMiddleware.checkTokenForOrganization,organizationController.create);

module.exports = router;