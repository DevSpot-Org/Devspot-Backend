const yup = require("yup");

const envSchema = yup.object({
  // Core
  APP_ENV: yup.string().oneOf(["local", "development", "production", "staging"]).required(),
  NODE_ENV: yup.string().oneOf(["development", "production", "test"]).required(),
  NEXT_PUBLIC_BASE_SITE_URL: yup.string().required(),
  NEXT_PUBLIC_PROTOCOL: yup
    .string()
    .matches(/^https?:\/\//)
    .required(),

  // Supabase
  SUPABASE_URL: yup.string().url().required(),
  SUPABASE_SERVICE_ROLE_KEY: yup.string().required(),
  SUPABASE_ANON_KEY: yup.string().required(),
  SUPABASE_JWT_SECRET: yup.string().required(),

  // GitHub
  NEXT_PUBLIC_GITHUB_TOKEN: yup.string().required(),

  // OAuth
  DEVTO_CLIENT_ID: yup.string().required(),
  DEVTO_CLIENT_SECRET: yup.string().required(),
  DRIBBLE_CLIENT_ID: yup.string().required(),
  DRIBBLE_CLIENT_SECRET: yup.string().required(),
  COURSERA_APP_ID: yup.string().required(),
  COURSERA_CLIENT_API_KEY: yup.string().required(),
  COURSERA_CLIENT_SECRET: yup.string().required(),
  STACKOVERFLOW_CLIENT_ID: yup.string().required(),
  STACKOVERFLOW_CLIENT_SECRET: yup.string().required(),
  STACKOVERFLOW_API_KEY: yup.string().required(),
  SPOTIFY_CLIENT_ID: yup.string().required(),
  SPOTIFY_CLIENT_SECRET: yup.string().required(),
  LINKEDIN_CLIENT_ID: yup.string().optional(),
  LINKEDIN_CLIENT_SECRET: yup.string().optional(),
  GOOGLE_CLIENT_ID: yup.string().required(),
  GOOGLE_CLIENT_SECRET: yup.string().required(),

  // Novu
  NOVU_API_KEY: yup.string().required(),
  NEXT_PUBLIC_NOVU_SUBSCRIBER_ID: yup.string().required(),
  NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER: yup.string().required(),

  // Emails
  LOOPS_API_KEY: yup.string().required(),
  FALLBACK_CSV_ENDPOINT: yup.string().url().required(),

  // Staking
  NEXT_PUBLIC_PAYMENT_NETWORK: yup.string().required(),
  NEXT_PUBLIC_CHAIN_ADDRESS: yup.string().required(),
  NEXT_PUBLIC_PAY_TO_ADDRESS: yup.string().required(),
  NEXT_PUBLIC_ENABLE_TESTNETS: yup.boolean().required(),
  CDP_API_KEY_ID: yup.string().uuid().required(),
  CDP_API_KEY_SECRET: yup.string().required(),
  NEXT_PUBLIC_RAINBOW_PROJECT_ID: yup.string().required(),

  // Discord
  DISCORD_BOT_TOKEN: yup.string().required(),
  DISCORD_GUILD_ID: yup.string().required(),
});

// Validate
function validateEnv() {
  try {
    return envSchema.validateSync(process.env, {
      abortEarly: false,
      stripUnknown: true,
    });
  } catch (err) {
    console.error("❌ Invalid environment variables:");
    err.inner.forEach((e) => {
      console.error(`- ${e.message}`);
    });
    process.exit(1); // Stop app
  }
}

const env = validateEnv();

module.exports = { env, envSchema };
