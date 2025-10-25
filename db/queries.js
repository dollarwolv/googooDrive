const prisma = require("./prisma");

async function createUser(username, hashedPassword) {
  try {
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });
    return user;
  } catch (error) {
    console.error("failed to create new user");
    throw new Error("Failed to create user");
  }
}

module.exports = {
  createUser,
};
