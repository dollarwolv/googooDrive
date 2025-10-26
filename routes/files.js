const { Router } = require("express");
const fileRouter = Router();
const prisma = require("../db/prisma");

fileRouter.get("/:fileId/download", async (req, res) => {
  const fileId = parseInt(req.params.fileId);
  const { url, originalName } = await prisma.file.findFirst({
    where: {
      id: fileId,
    },
    select: {
      url: true,
      originalName: true,
    },
  });
  res.download(url, (filename = originalName));
});

module.exports = fileRouter;
