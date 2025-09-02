exports.sanitizeUser=(user)=>{
    return {
        _id: user._id,
        email: user.email,
        name: user.name,
        roles: user.roles || ['user'],
        isVerified: user.isVerified,
        isAdmin: user.isAdmin,
        sellerType: user.sellerType,
        sellerVerificationStatus: user.sellerVerificationStatus,
        active: user.active,
        createdAt: user.createdAt
    }
}