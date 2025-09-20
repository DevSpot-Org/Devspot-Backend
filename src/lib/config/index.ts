import { env } from "./env";

type INodeEnv = "local" | "development" | "production" | "staging";

export const config = Object.freeze({
  app: {
    environment: env.APP_ENV as INodeEnv,
    nodeEnv: env.NODE_ENV,
    baseUrl: env.NEXT_PUBLIC_BASE_SITE_URL,
    protocol: env.NEXT_PUBLIC_PROTOCOL,
  },

  supabase: {
    url: env.SUPABASE_URL,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    anonKey: env.SUPABASE_ANON_KEY,
    jwtSecret: env.SUPABASE_JWT_SECRET,
  },

  github: {
    token: env.NEXT_PUBLIC_GITHUB_TOKEN,
  },

  oauth: {
    devto: {
      clientId: env.DEVTO_CLIENT_ID,
      clientSecret: env.DEVTO_CLIENT_SECRET,
    },
    dribbble: {
      clientId: env.DRIBBLE_CLIENT_ID,
      clientSecret: env.DRIBBLE_CLIENT_SECRET,
    },
    coursera: {
      appId: env.COURSERA_APP_ID,
      clientApiKey: env.COURSERA_CLIENT_API_KEY,
      clientSecret: env.COURSERA_CLIENT_SECRET,
    },
    stackoverflow: {
      clientId: env.STACKOVERFLOW_CLIENT_ID,
      clientSecret: env.STACKOVERFLOW_CLIENT_SECRET,
      apiKey: env.STACKOVERFLOW_API_KEY,
    },
    spotify: {
      clientId: env.SPOTIFY_CLIENT_ID,
      clientSecret: env.SPOTIFY_CLIENT_SECRET,
    },
    linkedin: {
      clientId: env.LINKEDIN_CLIENT_ID,
      clientSecret: env.LINKEDIN_CLIENT_SECRET,
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },

  novu: {
    apiKey: env.NOVU_API_KEY,
    subscriberId: env.NEXT_PUBLIC_NOVU_SUBSCRIBER_ID,
    appIdentifier: env.NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER,
  },

  email: {
    loopsApiKey: env.LOOPS_API_KEY,
    fallbackCsvEndpoint: env.FALLBACK_CSV_ENDPOINT,
  },

  staking: {
    paymentNetwork: env.NEXT_PUBLIC_PAYMENT_NETWORK,
    chainAddress: env.NEXT_PUBLIC_CHAIN_ADDRESS,
    payToAddress: env.NEXT_PUBLIC_PAY_TO_ADDRESS,
    enableTestnets: env.NEXT_PUBLIC_ENABLE_TESTNETS,
    cdpApiKeyId: env.CDP_API_KEY_ID,
    cdpApiKeySecret: env.CDP_API_KEY_SECRET,
    rainbowProjectId: env.NEXT_PUBLIC_RAINBOW_PROJECT_ID,
  },

  discord: {
    botToken: env.DISCORD_BOT_TOKEN,
    guildId: env.DISCORD_GUILD_ID,
  },
});
