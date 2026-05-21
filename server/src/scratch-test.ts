import { connect } from "mongoose";
import envConfig from "./config/env.config.js";
import { OrderModel } from "./models/order.model.js";
import RevisionModel from "./models/revision.model.js";

async function run() {
    try {
        console.log("Connecting to:", envConfig.database_url);
        await connect(envConfig.database_url as string);
        console.log("Connected successfully!");

        // 1. Fetch recent orders
        const orders = await OrderModel.find({}).sort({ createdAt: -1 }).limit(10).lean();
        console.log("\n=== RECENT ORDERS ===");
        orders.forEach(o => {
            console.log(`Order ID: ${o.orderID}`);
            console.log(`  Title: ${o.title}`);
            console.log(`  Status: ${o.status}`);
            console.log(`  isRevision: ${o.isRevision}`);
            console.log(`  Payment ID: ${o.paymentID}`);
            console.log(`  User: ${o.user?.userID} (${o.user?.email})`);
        });

        // 2. Fetch all revisions
        const revisions = await RevisionModel.find({}).lean();
        console.log("\n=== REVISIONS IN DATABASE ===");
        revisions.forEach(r => {
            console.log(`Revision ID: ${r._id}`);
            console.log(`  Order ID: ${r.orderID}`);
            console.log(`  Quote ID: ${r.quoteID}`);
            console.log(`  Status: ${r.status}`);
            console.log(`  Messages Count: ${r.messages?.length || 0}`);
            if (r.messages && r.messages.length > 0) {
                console.log(`  Latest Message: "${r.messages[r.messages.length - 1].message}"`);
            }
        });

        process.exit(0);
    } catch (err) {
        console.error("Error occurred:", err);
        process.exit(1);
    }
}

run();
