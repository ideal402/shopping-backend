const authController = {};
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const { OAuth2Client } = require("google-auth-library");
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
require("dotenv").config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

authController.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("이메일 혹은 비밀번호를 확인해 주세요");
    }

    const isMatch = await bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: "fail",
        error: "이메일 혹은 비밀번호를 확인해 주세요",
      });
    }
    const token = await user.generateToken();

    return res.status(200).json({ status: "success", user, token });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

authController.google = async (req, res) => {
  try {
    const { token } = req.body;
    const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const { email, name } = ticket.getPayload();

    let user = await User.findOne({ email: email });
    if (!user) {
      const randomPassword = generateRandomPassword(10);
      const salt = await bcrypt.genSalt(10);
      const newPassword = await bcrypt.hash(randomPassword, salt);
      user = new User({ email: email, password: newPassword, name: name });
      await user.save();
    }

    const sessionToken = await user.generateToken();

    return res.status(200).json({ status: "success", user, sessionToken });

  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

authController.authenticate = async (req, res, next) => {
  try {
    const tokenString = req.headers.authorization;
    if (!tokenString) {
      throw new Error("토큰을 찾지 못하였습니다.");
    }

    const token = tokenString.replace("Bearer ", "");

    jwt.verify(token, JWT_SECRET_KEY, (error, payload) => {
      if (error) throw new Error("잘못된 토큰");
      req.userId = payload._id;
    });

    next();
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

authController.checkAdmin = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (user.level !== "admin") throw new Error("no permission");

    next();
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

function generateRandomPassword(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomPassword = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomPassword += characters.charAt(randomIndex);
  }
  return randomPassword;
}

module.exports = authController;
