import fs from 'fs/promises';
import path from 'path';

import { MiddlewareType } from 'koa';
import proxy from 'koa-proxies';
import { IRouterParamContext } from 'koa-router';

import envSet, { MountedApps } from '@/env-set';
import serveStatic from '@/middleware/koa-serve-static';

export default function koaSpaProxy<StateT, ContextT extends IRouterParamContext, ResponseBodyT>(
  packagePath = 'ui',
  port = 5001,
  prefix = ''
): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  type Middleware = MiddlewareType<StateT, ContextT, ResponseBodyT>;

  const distributionPath = path.join('..', packagePath, 'dist');

  const spaProxy: Middleware = envSet.values.isProduction
    ? serveStatic(distributionPath)
    : proxy('*', {
        target: `http://localhost:${port}`,
        changeOrigin: true,
        logs: true,
        rewrite: (requestPath) => {
          // Static files
          if (requestPath.includes('.')) {
            return '/' + path.join(prefix, requestPath);
          }

          // In-app routes
          return requestPath;
        },
      });

  return async (ctx, next) => {
    const requestPath = ctx.request.path;

    // Route has been handled by one of mounted apps
    if (
      !prefix &&
      Object.values(MountedApps).some((app) => app !== prefix && requestPath.startsWith(`/${app}`))
    ) {
      return next();
    }

    if (!envSet.values.isProduction) {
      return spaProxy(ctx, next);
    }

    const spaDistributionFiles = await fs.readdir(distributionPath);

    if (!spaDistributionFiles.some((file) => requestPath.startsWith('/' + file))) {
      ctx.request.path = '/';
    }

    return spaProxy(ctx, next);
  };
}
