const router=require('express').Router();
const organizationController=require('../controllers/organization.controller');
const credentialController=require('../controllers/credential.controller');


router.get("/profile",organizationController.profileDetails);
router.post("/credentials",credentialController.add);
router.get("/credentials",credentialController.list);
router.get("/credentials-for-filter",credentialController.listForFilter);
router.patch("/credentials/:credentialId/status/:status",credentialController.statusUpdate);
router.put("/credentials/:credentialId",credentialController.edit);

module.exports = router;