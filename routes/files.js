const { Router } = require("express");
const fileRouter = Router();
const prisma = require("../db/prisma");

fileRouter.get("/:fileId/download", async (req, res) => {
  const fileId = parseInt(req.params.fileId);
  const { path, originalName } = await prisma.file.findFirst({
    where: {
      id: fileId,
    },
    select: {
      path: true,
      originalName: true,
    },
  });
  res.download(path, (filename = originalName));
});

module.exports = fileRouter;
