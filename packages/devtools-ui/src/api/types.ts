export interface GuildResponse {
  guilds: Array<{
    id: string;
    name: string;
    icon: string | null;
    features: string[];
    commands: unknown[];
    members: unknown[];
    channels: string[];
    bans: unknown[];
    roles: string[];
    stageInstances: unknown[];
    invites: unknown[];
    scheduledEvents: unknown[];
    autoModerationRules: unknown[];
    soundboardSounds: unknown[];
    shardId: number;
    splash: string | null;
    banner: string | null;
    description: string | null;
    verificationLevel: number;
    vanityURLCode: string | null;
    nsfwLevel: number;
    premiumSubscriptionCount: number;
    discoverySplash: string | null;
    memberCount: number;
    large: boolean;
    premiumProgressBarEnabled: boolean;
    applicationId: string | null;
    afkTimeout: number;
    afkChannelId: string | null;
    systemChannelId: string | null;
    premiumTier: number;
    widgetEnabled: boolean | null;
    widgetChannelId: string | null;
    explicitContentFilter: number;
    mfaLevel: number;
    joinedTimestamp: number;
    defaultMessageNotifications: number;
    systemChannelFlags: number;
    maximumMembers: number;
    maximumPresences: number | null;
    maxVideoChannelUsers: number;
    maxStageVideoChannelUsers: number;
    approximateMemberCount: number | null;
    approximatePresenceCount: number | null;
    vanityURLUses: number | null;
    rulesChannelId: string | null;
    publicUpdatesChannelId: string | null;
    preferredLocale: string;
    safetyAlertsChannelId: string | null;
    ownerId: string;
    emojis: string[];
    stickers: string[];
    incidentsData: unknown | null;
    createdTimestamp: number;
    nameAcronym: string;
    iconURL: string | null;
    splashURL: string | null;
    discoverySplashURL: string | null;
    bannerURL: string | null;
  }>;
}

export interface FeatureFlag {
  key: string;
  description: string | null;
  hasIdentify: boolean;
}
