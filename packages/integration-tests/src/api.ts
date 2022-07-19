import got from 'got';

import { logtoUrl } from '@/constants';

export default got.extend({ prefixUrl: new URL('/api', logtoUrl) });

export const managementApi = got.extend({
  prefixUrl: new URL('/api', logtoUrl),
  headers: {
    'development-user-id': 'integration-test-admin-user',
  },
});
