const CustomError = require("../../errors/customError");
const adminValidation = require("../../validations/admin.validation");
const responseUtil = require("../../utils/response.util");
const adminDb = require("../../db/mongo/admin.db");
const jwt = require("jsonwebtoken");
const envUtil = require("../../utils/env.util");
const constantUtils = require("../../utils/constant.utils");
const bcryptUtil=require("../../utils/bcrypt.util");

exports.login = async (req, res) => {

    const validation = adminValidation.login.validate(req.body);
    if (validation.error) {
        throw new CustomError({
            message: validation.error.message,
            statusCode: 400
        })
    }

    const { emailId, password } = req.body;

    const adminDbRes = await adminDb.findOne({ emailId: emailId })
        .select({ _id: 1, name: 1, emailId: 1, password: 1, profilePic: 1 });
        if (adminDbRes === null || await bcryptUtil.comparePassword(password,adminDbRes.password)===false) {
        throw new CustomError({
            message: "Invalid emailId or password",
            statusCode: 401
        })
    }

    const token = jwt.sign({
        id: adminDbRes._id,
        role: constantUtils.keys.roles.admin
    }, envUtil.JWT_SECRET_KEY, { expiresIn: envUtil.JWT_EXPIRE_IN });

    if (!token) {
        throw new CustomError({
            message: "Could not generate token",
            statusCode: 500
        })
    }

    await adminDb.updateOne({ _id: adminDbRes._id }, {
        $set: { lastLoginTime: Date.now() }
    });

    return res.status(200).json(responseUtil.success({
        message: "Login successful",
        data: {
            id: adminDbRes._id,
            name: adminDbRes.name,
            emailId: adminDbRes.emailId,
            token: token,
        }
    }))
}  