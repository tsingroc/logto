// Feat(tsingroc): 禁用修改custom-data接口以保证通过custom-data进行API鉴权的安全性
// import { arbitraryObjectGuard } from '@logto/schemas';
import { passwordRegEx } from '@logto/shared';
import { object, string } from 'zod';

import { encryptUserPassword } from '@/lib/user';
import koaGuard from '@/middleware/koa-guard';
import { findUserById, updateUserById } from '@/queries/user';

import { AuthedRouter } from './types';

export default function meRoutes<T extends AuthedRouter>(router: T) {
  router.get('/me/custom-data', async (ctx, next) => {
    const { customData } = await findUserById(ctx.auth);

    ctx.body = customData;

    return next();
  });

  // Feat(tsingroc): 禁用修改custom-data接口以保证通过custom-data进行API鉴权的安全性
  //   router.patch(
  //     '/me/custom-data',
  //     koaGuard({ body: object({ customData: arbitraryObjectGuard }) }),
  //     async (ctx, next) => {
  //       const {
  //         body: { customData },
  //       } = ctx.guard;

  //       await findUserById(ctx.auth);

  //       const user = await updateUserById(ctx.auth, {
  //         customData,
  //       });

  //       ctx.body = user.customData;

  //       return next();
  //     }
  //   );

  router.patch(
    '/me/password',
    koaGuard({ body: object({ password: string().regex(passwordRegEx) }) }),
    async (ctx, next) => {
      const {
        body: { password },
      } = ctx.guard;

      const { passwordEncrypted, passwordEncryptionMethod } = await encryptUserPassword(password);

      await updateUserById(ctx.auth, {
        passwordEncrypted,
        passwordEncryptionMethod,
      });

      ctx.status = 204;

      return next();
    }
  );
}
