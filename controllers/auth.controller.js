const authController = {};
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
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

authController.checkAdmin = async(req,res,next) =>{
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    
    if(user.level !== "admin") throw new Error("no permission");

    next()
    
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
}
module.exports = authController;
