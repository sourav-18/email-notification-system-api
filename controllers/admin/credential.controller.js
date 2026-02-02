const organizationDb = require("../../db/mongo/organization.db")
const utilsConstant = require("../../utils/constant.utils");
const CustomError = require("../../errors/customError");
const responseUtil = require("../../utils/response.util");
const credentialValidation = require("../../validations/admin/credentials.validation");
const organizationCredentialsDb = require("../../db/mongo/organizationCredentials.mongo");

exports.list = async (req, res) => {

    const validation = credentialValidation.listQuery.validate(req.query);
    if (validation.error) {
        throw new CustomError({
            message: validation.error.message,
            statusCode: 400
        })
    }

    const { skipNumber, limitNumber } = utilsConstant.getPaginationValues(req.query.page, req.query.limit);
    const { status, sort, search } = req.query;

    const allowedSortFields = ["_id"];
    const sortOption = {};
    utilsConstant.setSortOptions(sort, allowedSortFields, sortOption);

    const filterOptions = {};

    if (search) {
        if (search.match(/^[0-9a-fA-F]{24}$/)) {
            filterOptions.$or = [
                { _id: search },
                { organizationId: search },
            ];
        } else {
            filterOptions.$or = [
                { emailUserName: { $regex: search, $options: 'i' } }
            ];
        }
    }

    if (status) {
        filterOptions.status = status;
    }

    let credentials = organizationCredentialsDb.find(filterOptions)
        .populate({ path: "organizationId", select: { name: 1 } })
        .sort(sortOption).skip(skipNumber).limit(limitNumber)
        .select({ organizationId: 1, emailUserName: 1, emailId: 1, createdAt: 1, status: 1 }).lean();

    let totalCount = organizationCredentialsDb.countDocuments(filterOptions);

    const promises = await Promise.all([credentials, totalCount]);

    credentials = promises[0];
    totalCount = promises[1];

    if (credentials.length === 0) {
        throw new CustomError({
            message: "credentials not found",
            statusCode: 404
        })
    }

    for (const item of credentials) {
        item.organizationName = item.organizationId?.name;
        delete item.organizationId;
    }

    return res.status(200).json(responseUtil.success({
        message: "credentials fetched successfully",
        data: {
            items: credentials,
            totalCount: totalCount
        }
    }))

}

exports.statusUpdate = async (req, res) => {

    const validation = credentialValidation.statusUpdateParams.validate(req.params);
    if (validation.error) {
        throw new CustomError({
            message: validation.error.message,
            statusCode: 400
        })
    }

    const adminId = req.headers.id;
    const updateDbRes = await organizationCredentialsDb.updateOne({ _id: req.params.id }, {
        $set: {
            status: req.params.status,
            updatedBy: adminId
        }
    });

    if (updateDbRes.matchedCount === 0) {
        throw new CustomError({
            message: "credentials not found",
            statusCode: 404
        })
    }

    return res.status(200).json(responseUtil.success({
        message: "credentials status update successfully",
        data: null
    }))

}