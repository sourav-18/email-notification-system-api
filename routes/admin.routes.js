const router=require('express').Router();
const authenticationMiddleware=require("../middlewares/authentication.middleware");
const organizationController=require('../controllers/admin/organization.controller');




//organization 
router.post("/organizations",authenticationMiddleware.checkTokenFoAdmin,organizationController.create);
router.get("/organizations",authenticationMiddleware.checkTokenFoAdmin,organizationController.list);
router.put("/organizations/:id/status/:status",authenticationMiddleware.checkTokenFoAdmin,organizationController.statusUpdate);


module.exports = router;