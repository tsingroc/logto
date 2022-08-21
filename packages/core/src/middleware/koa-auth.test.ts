import { UserRole } from '@logto/schemas';
import { jwtVerify } from 'jose';
import { Context } from 'koa';
import { IRouterParamContext } from 'koa-router';

import envSet from '@/env-set';
import RequestError from '@/errors/RequestError';
import { createContextWithRouteParameters } from '@/utils/test-utils';

import koaAuth, { WithAuthContext } from './koa-auth';

jest.mock('jose', () => ({
  jwtVerify: jest.fn(() => ({ payload: { sub: 'fooUser', role_names: ['admin'] } })),
}));

describe('koaAuth middleware', () => {
  const baseCtx = createContextWithRouteParameters();

  const ctx: WithAuthContext<Context & IRouterParamContext> = {
    ...baseCtx,
    auth: '',
  };

  const unauthorizedError = new RequestError({ code: 'auth.unauthorized', status: 401 });
  const jwtSubMissingError = new RequestError({ code: 'auth.jwt_sub_missing', status: 401 });
  const authHeaderMissingError = new RequestError({
    code: 'auth.authorization_header_missing',
    status: 401,
  });
  const tokenNotSupportedError = new RequestError(
    {
      code: 'auth.authorization_token_type_not_supported',
      status: 401,
    },
    { supportedTypes: ['Bearer'] }
  );
  const forbiddenError = new RequestError({ code: 'auth.forbidden', status: 403 });

  const next = jest.fn();

  beforeEach(() => {
    ctx.auth = '';
    ctx.request = baseCtx.request;
    jest.resetModules();
  });

  it('should read DEVELOPMENT_USER_ID from env variable first if not production and not integration test', async () => {
    const spy = jest
      .spyOn(envSet, 'values', 'get')
      .mockReturnValue({ ...envSet.values, developmentUserId: 'foo' });

    await koaAuth()(ctx, next);
    expect(ctx.auth).toEqual('foo');

    spy.mockRestore();
  });

  it('should read `development-user-id` from headers if not production and not integration test', async () => {
    const mockCtx = {
      ...ctx,
      request: {
        ...ctx.request,
        headers: { ...ctx.request.headers, 'development-user-id': 'foo' },
      },
    };

    await koaAuth()(mockCtx, next);
    expect(mockCtx.auth).toEqual('foo');
  });

  it('should read DEVELOPMENT_USER_ID from env variable first if is in production and integration test', async () => {
    const spy = jest.spyOn(envSet, 'values', 'get').mockReturnValue({
      ...envSet.values,
      developmentUserId: 'foo',
      isProduction: true,
      isIntegrationTest: true,
    });

    await koaAuth()(ctx, next);
    expect(ctx.auth).toEqual('foo');

    spy.mockRestore();
  });

  it('should read `development-user-id` from headers if is in production and integration test', async () => {
    const spy = jest.spyOn(envSet, 'values', 'get').mockReturnValue({
      ...envSet.values,
      isProduction: true,
      isIntegrationTest: true,
    });

    const mockCtx = {
      ...ctx,
      request: {
        ...ctx.request,
        headers: { ...ctx.request.headers, 'development-user-id': 'foo' },
      },
    };

    await koaAuth()(mockCtx, next);
    expect(mockCtx.auth).toEqual('foo');

    spy.mockRestore();
  });

  it('should set user auth with given sub returned from accessToken', async () => {
    ctx.request = {
      ...ctx.request,
      headers: {
        authorization: 'Bearer access_token',
      },
    };
    await koaAuth()(ctx, next);
    expect(ctx.auth).toEqual('fooUser');
  });

  it('expect to throw if authorization header is missing', async () => {
    await expect(koaAuth()(ctx, next)).rejects.toMatchError(authHeaderMissingError);
  });

  it('expect to throw if authorization header token type not recognized ', async () => {
    ctx.request = {
      ...ctx.request,
      headers: {
        authorization: 'dummy access_token',
      },
    };

    await expect(koaAuth()(ctx, next)).rejects.toMatchError(tokenNotSupportedError);
  });

  it('expect to throw if jwt sub is missing', async () => {
    const mockJwtVerify = jwtVerify as jest.Mock;
    mockJwtVerify.mockImplementationOnce(() => ({ payload: {} }));

    ctx.request = {
      ...ctx.request,
      headers: {
        authorization: 'Bearer access_token',
      },
    };

    await expect(koaAuth()(ctx, next)).rejects.toMatchError(jwtSubMissingError);
  });

  it('expect to throw if jwt role_names is missing', async () => {
    const mockJwtVerify = jwtVerify as jest.Mock;
    mockJwtVerify.mockImplementationOnce(() => ({ payload: { sub: 'fooUser' } }));

    ctx.request = {
      ...ctx.request,
      headers: {
        authorization: 'Bearer access_token',
      },
    };

    await expect(koaAuth(UserRole.Admin)(ctx, next)).rejects.toMatchError(forbiddenError);
  });

  it('expect to throw if jwt role_names does not include admin', async () => {
    const mockJwtVerify = jwtVerify as jest.Mock;
    mockJwtVerify.mockImplementationOnce(() => ({
      payload: { sub: 'fooUser', role_names: ['foo'] },
    }));

    ctx.request = {
      ...ctx.request,
      headers: {
        authorization: 'Bearer access_token',
      },
    };

    await expect(koaAuth(UserRole.Admin)(ctx, next)).rejects.toMatchError(forbiddenError);
  });

  it('expect to throw unauthorized error if unknown error occurs', async () => {
    const mockJwtVerify = jwtVerify as jest.Mock;
    mockJwtVerify.mockImplementationOnce(() => {
      throw new Error('unknown error');
    });
    ctx.request = {
      ...ctx.request,
      headers: {
        authorization: 'Bearer access_token',
      },
    };

    await expect(koaAuth()(ctx, next)).rejects.toMatchError(
      new RequestError({ code: 'auth.unauthorized', status: 401 }, new Error('unknown error'))
    );
  });
});
