const Router = require("express");
const router = new Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/signin", userController.signin);
router.post("/signin/new_token", userController.signinNewToken);
router.post("/signup", userController.signup);
router.get("/info", authMiddleware, userController.info);
router.get("/logout", userController.logout);

module.exports = router;
