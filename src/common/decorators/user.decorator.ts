import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { JwtPayload } from 'src/auth/model/payload.jwt.model';

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user as JwtPayload;
});
