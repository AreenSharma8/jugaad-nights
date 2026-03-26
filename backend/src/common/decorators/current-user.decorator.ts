/**
 * Current User Decorator
 * Injects the current authenticated user into route handlers
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return null;
    }

    // Return specific property if requested, otherwise return entire user object
    return data ? user?.[data] : user;
  }
);

export default CurrentUser;
