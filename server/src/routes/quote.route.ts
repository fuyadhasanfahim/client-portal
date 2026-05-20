import { Router } from "express";
import QuoteControllers from "../controllers/quote.controller.js";

const router = Router();

router.get("/get-quotes", QuoteControllers.getQuotes);
router.post("/new-quote/:quoteStage", QuoteControllers.newQuote);
router.get("/get-quote/:quoteID", QuoteControllers.getQuoteByID);
router.put("/update-quote/:quoteID", QuoteControllers.updateQuote);
router.put("/deliver-quote", QuoteControllers.deliverQuote);
router.put("/review-quote", QuoteControllers.reviewQuote);
router.put("/complete-quote", QuoteControllers.completeQuote);
router.get("/get-quotes-by-status/:status", QuoteControllers.getQuotesByStatus);
router.get("/get-quotes-by-user", QuoteControllers.getQuotesByUserID);
router.get("/get-revisions/:quoteID", QuoteControllers.getRevision);

export const quoteRoute = router;
