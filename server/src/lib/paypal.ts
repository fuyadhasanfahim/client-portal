import paypal from "paypal-rest-sdk";
import envConfig from "../config/env.config.js";

const { paypal_client_id, paypal_client_secret, node_env } = envConfig;

paypal.configure({
    mode: node_env === "development" ? "test" : "sandbox",
    client_id: paypal_client_id!,
    client_secret: paypal_client_secret!,
});
