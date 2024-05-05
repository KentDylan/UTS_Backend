module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated() && req.user.name === "admin") {
      return next();
    }
    req.flash("error_msg", "Only admin can view that resource.");
    res.redirect("/profile");
    console.log("hi")
  },
  // forwardAuthenticated: function (req, res, next) {
  //   if (!req.isAuthenticated()) {
  //     return next();
  //   }
  //   res.redirect("/dashboard");
  // },
};
