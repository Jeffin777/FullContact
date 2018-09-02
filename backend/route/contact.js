const express = require("express");

const ContactController = require('../controllers/contact');

const checkAuth = require("../middleware/check-auth");
const extractFile = require("../middleware/file");

const router = express.Router();

router.get("/", ContactController.getContacts);
router.get("/:id", checkAuth, ContactController.getContact);
router.get("/search/:id", ContactController.SearchContacts);
router.get("/enrich/:id", checkAuth, ContactController.EnrichApiSearch);
router.post("/create", checkAuth, extractFile, ContactController.createContact);
router.delete("/delete/:id", checkAuth, ContactController.deleteContact);
router.put("/update/:id", checkAuth, extractFile, ContactController.updateContact);

module.exports = router;
