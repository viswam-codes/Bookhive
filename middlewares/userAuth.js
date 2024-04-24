const isLogOut = async (req, res, next) => {
    try {
        if (req.session.user) {
            // If user is already logged in, redirect to home page
            res.redirect("/");
        } else {
            // If user is not logged in, proceed to the next middleware
            next();
        }
    } catch (error) {
        console.log(error.message);
        // Handle error if necessary
    }
}

const isLogin = async (req, res, next) => {
    try {
        if (req.session.user) {
            // If user is logged in, proceed to the next middleware
            next();
        } else {
            // If user is not logged in, redirect to login page
            res.redirect("/login");
        }
    } catch (error) {
        console.log(error.message);
        // Handle error if necessary
    }
}

module.exports = {
    isLogOut,
    isLogin
}
