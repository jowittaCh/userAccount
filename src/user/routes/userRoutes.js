const express = require('express');
const myRoutes = express.Router();
const userController= require("../controllers/userControllers");


myRoutes.use("/signUp",userController.signUp);
myRoutes.use("/signIn",userController.signIn);
myRoutes.use("/updateInfo",userController.updateInfo);
myRoutes.use("/userInfo",userController.userInfo);
myRoutes.use("/deleteAcc",userController.deleteAcc);
myRoutes.use("/getAccessToken",userController.getAccess);
myRoutes.use("/changePassword",userController.changePassword);

module.exports = myRoutes;