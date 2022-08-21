import { User } from '@logto/schemas';
import { Provider } from 'oidc-provider';

import { mockUser } from '@/__mocks__';
import RequestError from '@/errors/RequestError';
import { createRequester } from '@/utils/test-utils';

import sessionPasswordlessRoutes from './passwordless';

const insertUser = jest.fn(async (..._args: unknown[]) => ({ id: 'id' }));
const findUserById = jest.fn(async (): Promise<User> => mockUser);
const updateUserById = jest.fn(async (..._args: unknown[]) => ({ id: 'id' }));

jest.mock('@/lib/user', () => ({
  generateUserId: () => 'user1',
  updateLastSignInAt: async (...args: unknown[]) => updateUserById(...args),
  insertUser: async (...args: unknown[]) => insertUser(...args),
}));

jest.mock('@/queries/user', () => ({
  findUserById: async () => findUserById(),
  findUserByPhone: async () => ({ id: 'id' }),
  findUserByEmail: async () => ({ id: 'id' }),
  updateUserById: async (...args: unknown[]) => updateUserById(...args),
  hasUser: async (username: string) => username === 'username1',
  hasUserWithPhone: async (phone: string) => phone === '13000000000',
  hasUserWithEmail: async (email: string) => email === 'a@a.com',
}));

const sendPasscode = jest.fn(async () => ({ connector: { id: 'connectorIdValue' } }));
jest.mock('@/lib/passcode', () => ({
  createPasscode: async () => ({ id: 'id' }),
  sendPasscode: async () => sendPasscode(),
  verifyPasscode: async (_a: unknown, _b: unknown, code: string) => {
    if (code !== '1234') {
      throw new RequestError('passcode.code_mismatch');
    }
  },
}));

const interactionResult = jest.fn(async () => 'redirectTo');
const interactionDetails: jest.MockedFunction<() => Promise<unknown>> = jest.fn(async () => ({}));

jest.mock('oidc-provider', () => ({
  Provider: jest.fn(() => ({
    interactionDetails,
    interactionResult,
  })),
}));

afterEach(() => {
  interactionResult.mockClear();
});

describe('sessionPasswordlessRoutes', () => {
  const sessionRequest = createRequester({
    anonymousRoutes: sessionPasswordlessRoutes,
    provider: new Provider(''),
    middlewares: [
      async (ctx, next) => {
        ctx.addLogContext = jest.fn();
        ctx.log = jest.fn();

        return next();
      },
    ],
  });

  describe('POST /session/sign-in/passwordless/sms/send-passcode', () => {
    beforeAll(() => {
      interactionDetails.mockResolvedValueOnce({
        jti: 'jti',
      });
    });
    it('should call sendPasscode', async () => {
      const response = await sessionRequest
        .post('/session/sign-in/passwordless/sms/send-passcode')
        .send({ phone: '13000000000' });
      expect(response.statusCode).toEqual(204);
      expect(sendPasscode).toHaveBeenCalled();
    });
    it('throw error if phone does not exist', async () => {
      const response = await sessionRequest
        .post('/session/sign-in/passwordless/sms/send-passcode')
        .send({ phone: '13000000001' });
      expect(response.statusCode).toEqual(422);
    });
  });

  describe('POST /session/sign-in/passwordless/sms/verify-passcode', () => {
    it('assign result and redirect', async () => {
      const response = await sessionRequest
        .post('/session/sign-in/passwordless/sms/verify-passcode')
        .send({ phone: '13000000000', code: '1234' });
      expect(response.statusCode).toEqual(200);
      expect(response.body).toHaveProperty('redirectTo');
      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ login: { accountId: 'id' } }),
        expect.anything()
      );
    });
    it('throw error if phone does not exist', async () => {
      const response = await sessionRequest
        .post('/session/sign-in/passwordless/sms/verify-passcode')
        .send({ phone: '13000000001', code: '1234' });
      expect(response.statusCode).toEqual(422);
    });
    it('throw error if verifyPasscode failed', async () => {
      const response = await sessionRequest
        .post('/session/sign-in/passwordless/sms/verify-passcode')
        .send({ phone: '13000000000', code: '1231' });
      expect(response.statusCode).toEqual(400);
    });
  });

  describe('POST /session/sign-in/passwordless/email/send-passcode', () => {
    beforeAll(() => {
      interactionDetails.mockResolvedValue({
        jti: 'jti',
      });
    });
    it('should call sendPasscode', async () => {
      const response = await sessionRequest
        .post('/session/sign-in/passwordless/email/send-passcode')
        .send({ email: 'a@a.com' });
      expect(response.statusCode).toEqual(204);
      expect(sendPasscode).toHaveBeenCalled();
    });
    it('throw error if email does not exist', async () => {
      const response = await sessionRequest
        .post('/session/sign-in/passwordless/email/send-passcode')
        .send({ email: 'b@a.com' });
      expect(response.statusCode).toEqual(422);
    });
  });

  describe('POST /session/sign-in/passwordless/email/verify-passcode', () => {
    it('assign result and redirect', async () => {
      const response = await sessionRequest
        .post('/session/sign-in/passwordless/email/verify-passcode')
        .send({ email: 'a@a.com', code: '1234' });
      expect(response.statusCode).toEqual(200);
      expect(response.body).toHaveProperty('redirectTo');
      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ login: { accountId: 'id' } }),
        expect.anything()
      );
    });
    it('throw error if email does not exist', async () => {
      const response = await sessionRequest
        .post('/session/sign-in/passwordless/email/send-passcode')
        .send({ email: 'b@a.com' });
      expect(response.statusCode).toEqual(422);
    });
    it('throw error if verifyPasscode failed', async () => {
      const response = await sessionRequest
        .post('/session/sign-in/passwordless/email/verify-passcode')
        .send({ email: 'a@a.com', code: '1231' });
      expect(response.statusCode).toEqual(400);
    });
  });

  describe('POST /session/register/passwordless/sms/send-passcode', () => {
    beforeAll(() => {
      interactionDetails.mockResolvedValueOnce({
        jti: 'jti',
      });
    });

    it('should call sendPasscode', async () => {
      const response = await sessionRequest
        .post('/session/register/passwordless/sms/send-passcode')
        .send({ phone: '13000000001' });
      expect(response.statusCode).toEqual(204);
      expect(sendPasscode).toHaveBeenCalled();
    });

    it('throw error if phone not valid (charactors other than digits)', async () => {
      const response = await sessionRequest
        .post('/session/register/passwordless/sms/send-passcode')
        .send({ phone: '1300000000a' });
      expect(response.statusCode).toEqual(400);
    });

    it('throw error if phone not valid (without digits)', async () => {
      const response = await sessionRequest
        .post('/session/register/passwordless/sms/send-passcode')
        .send({ phone: 'abcdefg' });
      expect(response.statusCode).toEqual(400);
    });

    it('throw error if phone exists', async () => {
      const response = await sessionRequest
        .post('/session/register/passwordless/sms/send-passcode')
        .send({ phone: '13000000000' });
      expect(response.statusCode).toEqual(422);
    });
  });

  describe('POST /session/register/passwordless/sms/verify-passcode', () => {
    it('assign result and redirect', async () => {
      const response = await sessionRequest
        .post('/session/register/passwordless/sms/verify-passcode')
        .send({ phone: '13000000001', code: '1234' });
      expect(response.statusCode).toEqual(200);
      expect(response.body).toHaveProperty('redirectTo');
      expect(insertUser).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'user1', primaryPhone: '13000000001' })
      );
      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ login: { accountId: 'user1' } }),
        expect.anything()
      );
    });

    it('throw error if phone is invalid (characters other than digits)', async () => {
      const response = await sessionRequest
        .post('/session/register/passwordless/sms/verify-passcode')
        .send({ phone: '1300000000a', code: '1234' });
      expect(response.statusCode).toEqual(400);
    });

    it('throw error if phone not valid (without digits)', async () => {
      const response = await sessionRequest
        .post('/session/register/passwordless/sms/verify-passcode')
        .send({ phone: 'abcdefg', code: '1234' });
      expect(response.statusCode).toEqual(400);
    });

    it('throw error if phone exists', async () => {
      const response = await sessionRequest
        .post('/session/register/passwordless/sms/verify-passcode')
        .send({ phone: '13000000000', code: '1234' });
      expect(response.statusCode).toEqual(422);
    });

    it('throw error if verifyPasscode failed', async () => {
      const response = await sessionRequest
        .post('/session/register/passwordless/sms/verify-passcode')
        .send({ phone: '13000000001', code: '1231' });
      expect(response.statusCode).toEqual(400);
    });
  });

  describe('POST /session/register/passwordless/email/send-passcode', () => {
    beforeAll(() => {
      interactionDetails.mockResolvedValueOnce({
        jti: 'jti',
      });
    });

    it('should call sendPasscode', async () => {
      const response = await sessionRequest
        .post('/session/register/passwordless/email/send-passcode')
        .send({ email: 'b@a.com' });
      expect(response.statusCode).toEqual(204);
      expect(sendPasscode).toHaveBeenCalled();
    });

    it('throw error if email not valid', async () => {
      const response = await sessionRequest
        .post('/session/register/passwordless/email/send-passcode')
        .send({ email: 'aaa.com' });
      expect(response.statusCode).toEqual(400);
    });

    it('throw error if email exists', async () => {
      const response = await sessionRequest
        .post('/session/register/passwordless/email/send-passcode')
        .send({ email: 'a@a.com' });
      expect(response.statusCode).toEqual(422);
    });
  });

  describe('POST /session/register/passwordless/email/verify-passcode', () => {
    it('assign result and redirect', async () => {
      const response = await sessionRequest
        .post('/session/register/passwordless/email/verify-passcode')
        .send({ email: 'b@a.com', code: '1234' });
      expect(response.statusCode).toEqual(200);
      expect(response.body).toHaveProperty('redirectTo');
      expect(insertUser).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'user1', primaryEmail: 'b@a.com' })
      );
      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ login: { accountId: 'user1' } }),
        expect.anything()
      );
    });

    it('throw error if email not valid', async () => {
      const response = await sessionRequest
        .post('/session/sign-in/passwordless/email/send-passcode')
        .send({ email: 'aaa.com' });
      expect(response.statusCode).toEqual(400);
    });

    it('throw error if email exist', async () => {
      const response = await sessionRequest
        .post('/session/sign-in/passwordless/email/send-passcode')
        .send({ email: 'b@a.com' });
      expect(response.statusCode).toEqual(422);
    });

    it('throw error if verifyPasscode failed', async () => {
      const response = await sessionRequest
        .post('/session/sign-in/passwordless/email/verify-passcode')
        .send({ email: 'a@a.com', code: '1231' });
      expect(response.statusCode).toEqual(400);
    });
  });
});
