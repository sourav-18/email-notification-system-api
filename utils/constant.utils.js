exports.keys={
    roles:{
        admin:'admin',
        organization:'organization',
    }
}

exports.getPaginationValues=(page,limit)=>{
    const pageNumber=page && page>0 ? parseInt(page):1;
    const limitNumber=limit && limit>0 ? parseInt(limit):10;
    const skipNumber=(pageNumber-1)*limitNumber;
    return {skipNumber,limitNumber};
}

exports.setSortOptions=(sort,allowedSortFields,sortOption)=>{
     if (sort) {
        const sortFields = sort.split(",");
        for (const field of sortFields) {
            const order = field.startsWith("-") ? -1 : 1;
            const fieldName = field.replace(/^-+/, "");
            if (allowedSortFields.includes(fieldName)) {
                sortOption[fieldName] = order;
            }
        }
    }
}