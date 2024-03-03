const ApiError = require("../error/ApiError");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/models");

const generateJwt = (id) => {
  return jwt.sign({ id: id }, process.env.SECRET_KEY, {
    expiresIn: "10m",
  });
};
class UserController {
  async signup(req, res, next) {
    try {
      const { id, password } = req.body;
      if (!id || !password) {
        return next(ApiError.badRequest("Некоректный логин или пароль"));
      }
      const condidate = await User.findOne({ where: { id: id } });
      if (condidate) {
        return next(
          ApiError.badRequest("Такой логин уже есть , придумайте новый")
        );
      }
      const hashedPassword = await bcrypt.hash(password, 5);
      const user = await User.create({ id: id, password: hashedPassword });
      const token = generateJwt(id);
      return res.json({ token });
    } catch (e) {
      next(ApiError.badRequest(e.massage));
    }
  }
  async signin(req, res, next) {
    try {
      const { id, password } = req.body;
      const user = await User.findOne({ where: { id } });
      if (!user) {
        return next(ApiError.internal("Пользователь не найден"));
      }
      let comparePassword = bcrypt.compareSync(password, user.password);
      if (!comparePassword) {
        return next(ApiError.internal("Неверный пароль"));
      }
      const token = generateJwt(id);
      return res.json({ token });
    } catch (e) {
      next(ApiError.badRequest(e.massage));
    }
  }
  async signinNewToken(req, res) {
    const token = generateJwt(req.user.id);
    return res.json({ token });
  }
  async info(req, res, next) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "Не авторизован" });
      }
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      return res.json({ id: decoded.id });
    } catch (e) {
      return res.status(401).json({ message: "Не авторизован" });
    }
  }
  async logout(req, res) {
    try {
      res.clearCookie("token");
      return res.sendStatus(200);
    } catch (e) {
      return res.status(500).json({ message: "Ошибка при выходе" });
    }
  }
}

module.exports = new UserController();
