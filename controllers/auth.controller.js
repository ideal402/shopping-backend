const authController = {};
const bcrypt = require("bcryptjs");
const User = require("../model/User");

authController.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("이메일 혹은 비밀번호를 확인해 주세요");
    }

    const isMatch = await bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({
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

module.exports = authController;
