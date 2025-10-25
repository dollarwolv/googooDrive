const { Router } = require("express");
const signupRouter = Router();

signupRouter.get("/", (req, res) => {
  res.render("sign-up", { title: "Sign Up" });
});

signupRouter.post("/", async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.createUser(username, hashedPassword);
    res.send("user created successfully", user);
  } catch (error) {
    console.error("an error occurred while creating the user.");
    throw new Error("User creation error");
  }
});

module.exports = signupRouter;
