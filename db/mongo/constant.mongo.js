module.exports = {
    organization: {
        status: {
            active: 1,
            inactive: 2
        }
    },
    organizationCredentials: {
        status: {
            active: 1,
            inactive: 2
        }
    },
    notificationQueue: {
        priority: {
            immediate: 1,
            schedule: 2
        },
        status: {
            ideal: 1,
            processing: 2,
            error: 3,
            success: 4,
            failed: 5,
            cancel: 6,
        }
    }
}