const router=require('express').Router();
const organizationController=require('../controllers/organization.controller');


router.post("/credentials",organizationController.addCredentials);
router.get("/credentials",organizationController.credentialList);
router.get("/credentials-for-filter",organizationController.credentialListForFilter);
router.patch("/credentials/:credentialId/status/:status",organizationController.credentialStatusUpdate);
router.put("/credentials/:credentialId",organizationController.editCredentials);

module.exports = router;