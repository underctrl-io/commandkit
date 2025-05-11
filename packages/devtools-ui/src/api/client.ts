import { axiosClient } from './axios';
import { ClientUser } from './structures/client-user';
import { GuildResponse } from './types';

export class Client<Ready extends boolean = boolean> {
  public api = axiosClient;

  private _user: ClientUser | null = null;

  public get user(): Ready extends true ? ClientUser : ClientUser | null {
    return this._user as ClientUser;
  }

  public isReady(): this is Client<true> {
    return this._user !== null;
  }

  public logout() {
    localStorage.removeItem('access_token');
    this._user = null;
  }

  public async fetchMe(force = false) {
    if (this._user && !force) return this._user;

    const { data } = await this.api.get('/auth/@me');

    this._user = new ClientUser(this, data);

    return this._user;
  }

  public async fetchGuilds() {
    const { data } = await this.api.get<GuildResponse>('/guilds');
    return data;
  }

  public async login(username: string, password: string) {
    const { data } = await this.api.post('/auth/login', {
      username,
      password,
    });

    if (data.accessToken) {
      localStorage.setItem('access_token', data.accessToken);
    }

    this._user = new ClientUser(this, data.user);

    return data;
  }
}
