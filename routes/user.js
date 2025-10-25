const { Router } = require("express");
const userRouter = Router();
const prisma = require("../db/prisma");

userRouter.get("/:id/folders", async (req, res) => {
  const id = parseInt(req.params.id);
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    return res.status(404).send("User not found");
  }

  const folders = await prisma.folder.findMany({
    where: {
      userId: id,
    },
  });
  res.render("user", { folders: folders, user: user });
});

module.exports = userRouter;
