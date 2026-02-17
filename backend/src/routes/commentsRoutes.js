import express from "express"
import { createCommentsUsingRedditScrapper } from "../controllers/commentsController.js";

const router = express.Router();

router.post("/scrape", createCommentsUsingRedditScrapper);

export default router