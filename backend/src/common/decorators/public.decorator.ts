/**
 * Public Decorator
 * Marks endpoints that don't require authentication
 * Used for webhook endpoints and public APIs
 */

import { SetMetadata } from '@nestjs/common';

export const PUBLIC_KEY = 'isPublic';

export const Public = () => SetMetadata(PUBLIC_KEY, true);

export default Public;
