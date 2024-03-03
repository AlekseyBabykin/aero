const { File } = require("../models/models");
const ApiError = require("../error/ApiError");
const multer = require("multer");
const uuid = require("uuid");
const path = require("path");
const fs = require("fs");

const upload = multer({ dest: "uploads/" });

class FileController {
  async upload(req, res, next) {
    try {
      const { userId } = req.body;
      const { filename } = req.files;

      let fileOriginName = uuid.v4() + filename.name.split(".").pop();
      filename.mv(path.resolve(__dirname, "..", "static", fileOriginName));

      const file = await File.create({
        userId,
        filename: fileOriginName,
        extension: filename.name.split(".").pop(),
        mime_type: filename.mimetype,
        size: filename.size,
      });
      return res.json({ message: "Файл успешно сохранен" });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async list(req, res, next) {
    try {
      let { list_size, page } = req.query;
      page = page || 1;
      list_size = list_size || 10;
      let offset = page * list_size - list_size;
      let listFiles = await File.findAndCountAll({ list_size, offset });
      return res.json(listFiles);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const file = await File.findOne({ where: { id } });
      if (!file) {
        next(ApiError.badRequest("Файл не найден"));
      }
      const filePath = path.resolve(__dirname, "..", "static", file.filename);
      fs.unlink(filePath, (err) => {
        if (err) {
          return next(
            ApiError.internal({ message: "Ошибка приудалении файла" })
          );
        }
      });
      await file.destroy();
      return res.json({ message: "Файл успешно удален" });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async infoFile(req, res, next) {
    try {
      const { id } = req.params;
      const file = await File.findOne({ where: { id } });
      if (!file) {
        next(ApiError.badRequest("Файл не найден"));
      }
      return res.json({ message: "Вот Ваш файл", file });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async download(req, res, next) {
    try {
      const { id } = req.params;
      const file = await File.findOne({
        where: { id },
      });
      if (!file) {
        next(ApiError.badRequest("Файл не найден"));
      }
      const filePath = path.resolve(__dirname, "..", "static", file.filename);
      res.download(filePath, file.filename);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      const { filename } = req.files;
      console.log(filename);
      const file = await File.findOne({ where: { id } });
      if (!file) {
        next(ApiError.badRequest("Файл не найден"));
      }
      const filePath = path.resolve(__dirname, "..", "static", file.filename);
      fs.unlink(filePath, (err) => {
        if (err) {
          return next(
            ApiError.internal({ message: "Ошибка при удалении файла" })
          );
        }
      });
      let fileOriginName = uuid.v4() + filename.name.split(".").pop();
      filename.mv(path.resolve(__dirname, "..", "static", fileOriginName));

      file.userId = userId;
      file.filename = fileOriginName;
      file.extension = filename.name.split(".").pop();
      file.mime_type = filename.mimetype;
      file.size = filename.size;
      await file.save();

      return res.json({ message: "Файл успешно обновлен" }, file);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
}

module.exports = new FileController();
