const User = require("../model/User");
const bcrypt = require("bcryptjs");

const userController = {};

userController.createUser = async (req, res) => {
  try {
    let { name, email, password, level } = req.body;
    const user = await User.findOne({ email: email });

    if (user) {
      throw new Error("이미 가입된 메일주소입니다.");
    }
    const salt = await bcrypt.genSaltSync(10);
    password = await bcrypt.hashSync(password, salt);
    const newUser = new User({
      name,
      email,
      password,
      level: level ? level : "customer",
    });
    await newUser.save();

    return res.status(200).json({ status: "success" });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

userController.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("이메일 혹은 비밀번호를 확인해 주세요");
    }

    const isMatch = await bcrypt.compareSync(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ status: "fail", error: "이메일 혹은 비밀번호를 확인해 주세요" });
    }

    return res.status(200).json({ status: "success" });

  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};
 
module.exports = userController;
