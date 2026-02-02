const organizationDb = require("../../db/mongo/organization.db")
const utilsConstant = require("../../utils/constant.utils");
const CustomError = require("../../errors/customError");
const responseUtil = require("../../utils/response.util");
const organizationValidation = require("../../validations/organization.validation");
const uuidUtils = require("../../utils/uuid.util");
const mailUtil = require("../../utils/mail.util");
const bcryptUtil = require("../../utils/bcrypt.util");
const serverEnvUtil = require("../../utils/env.util");
const organizationCredentialsDb = require("../../db/mongo/organizationCredentials.mongo");

exports.list = async (req, res) => {

    const validation = organizationValidation.listQuery.validate(req.params);
    if (validation.error) {
        throw new CustomError({
            message: validation.error.message,
            statusCode: 400
        })
    }

    const { skipNumber, limitNumber } = utilsConstant.getPaginationValues(req.query.page, req.query.limit);
    const { status, sort, search } = req.query;

    const allowedSortFields = ["_id", "lastLoginTime", "createdAt"];
    const sortOption = {};
    utilsConstant.setSortOptions(sort, allowedSortFields, sortOption);

    const filterOptions = {};

    if (search) {
        if (search.match(/^[0-9a-fA-F]{24}$/)) {
            filterOptions._id = search;
        } else {
            filterOptions.$or = [
                { emailId: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } },
            ];
        }
    }

    if (status) {
        filterOptions.status = status;
    }

    let organizations = organizationDb.find(filterOptions)
        .sort(sortOption).skip(skipNumber).limit(limitNumber)
        .select({ name: 1, logoUrl: 1, emailId: 1, createdAt: 1, lastLoginTime: 1, status: 1 })

    let totalCount = organizationDb.countDocuments(filterOptions);

    const promises = await Promise.all([organizations, totalCount]);

    organizations = promises[0];
    totalCount = promises[1];

    if (organizations.length === 0) {
        throw new CustomError({
            message: "organizations not found",
            statusCode: 404
        })
    }

    return res.status(200).json(responseUtil.success({
        message: "organizations fetched successfully",
        data: {
            items: organizations,
            totalCount: totalCount
        }
    }))



}

exports.create = async (req, res) => {
    const validation = organizationValidation.createBody.validate(req.body);
    if (validation.error) {
        throw new CustomError({
            message: validation.error.message,
            statusCode: 400
        })
    }

    const { name, emailId, password } = req.body;
    const isNameAlreadyExist = await organizationDb.findOne({ emailId: emailId });

    if (isNameAlreadyExist) {
        throw new CustomError({
            message: "email already exist",
            statusCode: 400
        })
    }

    const hashedPassword = await bcryptUtil.encryptPassword(password);

    if (!hashedPassword) {
        throw new CustomError({
            message: "Could not create organization",
            statusCode: 500
        })
    }

    await organizationDb.create({
        name: name,
        emailId: emailId,
        secretKey: uuidUtils.getRandomId(),
        password: hashedPassword
    })

    if (serverEnvUtil.SERVER_ENVIRONMENT == "prod")
        mailUtil.sendOrganizationPassword(emailId, password);

    return res.status(201).json(responseUtil.success({
        message: "organization crate successfully",
        data: null
    }))

}

exports.statusUpdate = async (req, res) => {

    const validation = organizationValidation.statusUpdateParams.validate(req.params);
    if (validation.error) {
        throw new CustomError({
            message: validation.error.message,
            statusCode: 400
        })
    }

    const adminId = req.headers.id;
    const updateDbRes = await organizationDb.updateOne({ _id: req.params.id }, {
        $set: {
            status: req.params.status,
            updatedBy: adminId
        }
    });

    if (updateDbRes.matchedCount === 0) {
        throw new CustomError({
            message: "Organization not found",
            statusCode: 404
        })
    }

    return res.status(200).json(responseUtil.success({
        message: "Organization status update successfully",
        data: null
    }))

}


