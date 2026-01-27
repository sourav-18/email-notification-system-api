const router=require('express').Router();
const authenticationMiddleware=require("../middlewares/authentication.middleware");
const organizationController=require('../controllers/organization.controller');



//organization 
router.post("/organizations",authenticationMiddleware.checkTokenFoAdmin,organizationController.createByAdmin);

module.exports = router;