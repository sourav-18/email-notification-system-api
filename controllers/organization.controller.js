const organizationDb = require("../db/mongo/organization.db");
const CustomError = require("../errors/customError");
const responseUtil = require("../utils/response.util");
const organizationValidation = require("../validations/orginization.validation");

exports.create = async (req, res) => {
    const validation = organizationValidation.createBody.validate(req.body);
    if (validation.error) {
        throw new CustomError({
            message: validation.error.message,
            statusCode: 400
        })
    }

    const { name, description, logoUrl } = req.body;
    const isNameAlreadyExist = await organizationDb.findOne({ name: name });

    if (isNameAlreadyExist) {
        throw new CustomError({
            message: "name already exist",
            statusCode: 400
        })
    }

    await organizationDb.create({
        name: name,
        description: description,
        logoUrl: logoUrl
    })

    return res.status(201).json(responseUtil.success({
        message: "organization crate successfully",
        data: null
    }))

}