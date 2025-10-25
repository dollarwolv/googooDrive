const { Router } = require("express");
const userRouter = Router();
const prisma = require("../db/prisma");

userRouter.get("/:id/folders", async (req, res) => {
  const id = parseInt(req.params.id);

  if (id != res.locals.currentUser.id) {
    return res.status(403).send("You don't have access to this page.");
  }

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

userRouter.get("/:id/folders/new", async (req, res) => {
  const id = parseInt(req.params.id);
  if (id != res.locals.currentUser.id) {
    return res.status(403).send("You don't have access to this page.");
  }

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });
  if (!user) {
    return res.status(404).send("User not found");
  }
  res.render("new-folder", { user });
});

userRouter.post("/:id/folders/new", async (req, res) => {
  const id = parseInt(req.params.id);
  if (id != res.locals.currentUser.id) {
    return res.status(403).send("You can't do that.");
  }
  const { name } = req.body;
  const folder = await prisma.folder.create({
    data: {
      userId: id,
      name,
    },
  });
  res.redirect(`/users/${id}/folders`);
});

module.exports = userRouter;
