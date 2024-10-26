const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");

router.post("/login", authController.login);
router.get("/me", authController.authenticate, userController.gerUser);

module.exports = router;
