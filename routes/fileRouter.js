const Router = require("express");
const fileController = require("../controllers/fileController");
const authMiddleware = require("../middleware/authMiddleware");
const router = new Router();

router.post("/upload", authMiddleware, fileController.upload);
router.get("/list", authMiddleware, fileController.list);
router.get("/:id", authMiddleware, fileController.infoFile);
router.get("/download/:id", authMiddleware, fileController.download);
router.delete("/delete/:id", authMiddleware, fileController.delete);
router.put("/file/update/:id", authMiddleware, fileController.update);

module.exports = router;
