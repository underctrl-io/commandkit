import type { Client } from '../client';

export interface ClientUserData {
  id: string;
  bot: boolean;
  system: boolean;
  flags: number;
  username: string;
  globalName: string | null;
  discriminator: string;
  avatar: string;
  avatarDecoration: string | null;
  avatarDecorationData: string | null;
  verified: boolean;
  mfaEnabled: boolean;
  createdTimestamp: number;
  defaultAvatarURL: string;
  tag: string;
  avatarURL: string;
  displayAvatarURL: string;
}

export class ClientUser {
  public constructor(
    public readonly client: Client,
    public readonly data: ClientUserData,
  ) {}
}
