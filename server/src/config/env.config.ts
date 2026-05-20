import dotenv from "dotenv";
import path from "path";

dotenv.config({
    path: path.join(process.cwd(), ".env"),
});

const envConfig = {
    node_env: process.env.NODE_ENV,
    port: process.env.PORT,
    database_url: process.env.DATABASE_URL,
    frontend_url: process.env.FRONTEND_URL,
    auth_secret: process.env.AUTH_SECRET,
    email_user: process.env.EMAIL_USER,
    email_password: process.env.EMAIL_PASS,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    stripe_secret_key: process.env.STRIPE_SECRET_KEY,
    stripe_publishable_key: process.env.STRIPE_PUBLISHABLE_KEY,
    stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
    paypal_mode: process.env.PAYPAL_MODE,
    paypal_client_id: process.env.PAYPAL_CLIENT_ID,
    paypal_client_secret: process.env.PAYPAL_CLIENT_SECRET,
    paypal_api_base_url: process.env.PAYPAL_API_BASE_URL,
    aws_secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
    aws_access_key_id: process.env.AWS_ACCESS_KEY_ID,
    aws_region: process.env.AWS_REGION,
    aws_bucket: process.env.AWS_S3_BUCKET,
    aws_prefix: process.env.AWS_S3_PREFIX,
};

export default envConfig;
