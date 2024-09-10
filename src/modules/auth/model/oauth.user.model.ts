import { Provider } from '@prisma/client';

export interface OauthUser {
  provider: Provider;
  providerId: string;
}
