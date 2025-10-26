const { Router } = require("express");
const userRouter = Router();
const prisma = require("../db/prisma");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const supabase = require("../db/supabase");
const fs = require("fs");

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

userRouter.get("/:userId/folders/:folderId/", async (req, res) => {
  const userId = parseInt(req.params.userId);
  const folderId = parseInt(req.params.folderId);

  const folder = await prisma.folder.findUnique({
    where: {
      id: folderId,
    },
  });

  const files = await prisma.file.findMany({
    where: {
      folderId,
    },
  });
  res.render("folder", { folder, files, userId, folderId });
});

userRouter.get("/:userId/folders/:folderId/files/new", (req, res) => {
  const userId = parseInt(req.params.userId);
  const folderId = parseInt(req.params.folderId);
  res.render("new-file.ejs", { userId, folderId });
});

userRouter.post(
  "/:userId/folders/:folderId/files/new",
  upload.single("file"),
  async (req, res) => {
    const folderId = parseInt(req.params.folderId);
    const userId = parseInt(req.params.userId);
    const { originalname, mimetype, filename, path, size } = req.file;

    const fileBuffer = fs.readFileSync(path);

    // upload to supabase
    const { data, error } = await supabase.storage
      .from("files")
      .upload(`user_${userId}/${originalname}`, fileBuffer, {
        contentType: mimetype,
        upsert: true,
      });

    if (error) {
      console.error(error);
      return res.status(500).send("Failed to upload file.");
    }

    // get file url
    const { data: publicUrlData } = supabase.storage
      .from("files")
      .getPublicUrl(`user_${userId}/${originalname}`);

    const { publicUrl } = publicUrlData;

    // save file data
    const file = await prisma.file.create({
      data: {
        originalName: originalname,
        mimeType: mimetype,
        filename: filename,
        path: path,
        sizeBytes: size,
        folderId,
        url: publicUrl,
      },
    });

    // delete the file
    fs.unlinkSync(path);

    res.redirect(`/users/${userId}/folders/${folderId}/`);
  }
);
module.exports = userRouter;
