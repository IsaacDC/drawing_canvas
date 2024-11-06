const adminAuthMiddleware = async (req, res, next) => {
  if (req.session.admin === true) {
    return next();
  } else {
    res.redirect("/login");
  }
};
module.exports = { adminAuthMiddleware };
