const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const User = sequelize.define("user", {
  id: { type: DataTypes.STRING, primaryKey: true, unique: true },
  password: { type: DataTypes.STRING },
});

const File = sequelize.define("file", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  filename: { type: DataTypes.STRING },
  extension: { type: DataTypes.STRING },
  mime_type: { type: DataTypes.STRING },
  size: { type: DataTypes.BIGINT },
});

User.hasMany(File);
File.belongsTo(User);

module.exports = {
  User,
  File,
};
