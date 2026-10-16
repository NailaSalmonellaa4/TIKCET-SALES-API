exports.IsUser = (request, response, next) => {
    if (request.user && request.user.role === `user`) {
        next();
    } else {
        return response.json({
            success: false,
            auth: false,
            message: `Unauthorized Access`
        });
    }
}

exports.IsAdmin = (request, response, next) => {
    if (request.user && request.user.role === `admin`) {
        next();
    } else {
        return response.json({
            success: false,
            auth: false,
            message: `U are not an Admin BROH`
        });
    }
}

/**
 * Middleware fleksibel untuk membatasi akses berdasarkan role.
 * Menerima daftar role yang diizinkan.
 * Contoh penggunaan: allowRoles('admin', 'user') atau allowRoles('admin')
 */
exports.allowRoles = (...roles) => {
    return (request, response, next) => {
        if (!request.user || !request.user.role) {
            return response.status(401).json({
                success: false,
                auth: false,
                message: `User tidak terautentikasi`
            });
        }

        if (!roles.includes(request.user.role)) {
            return response.status(403).json({
                success: false,
                auth: false,
                message: `Akses ditolak! Role '${request.user.role}' tidak memiliki izin untuk mengakses resource ini`
            });
        }

        next();
    };
}