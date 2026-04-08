const express = require("express");
const captiveController = require("../controllers/captiveController");

const router = express.Router();

router.post("/register", captiveController.register);
router.get("/status/:id", captiveController.getStatus);
router.post("/authorize/:id", captiveController.authorize);

module.exports = router;
