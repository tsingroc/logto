import { ConnectorDto, ConnectorType } from '@logto/schemas';

import api from '@/api';

const headers = {
  'development-user-id': 'integration-test-admin-user',
};

const facebookConnectorId = 'facebook-universal';

const enableConnector = async (connectorId: string) =>
  api.patch({
    url: `connectors/${connectorId}/enabled`,
    headers,
    json: { enabled: true },
  });

const deleteConnector = async (connectorId: string) =>
  api.patch({
    url: `connectors/${connectorId}/enabled`,
    headers,
    json: { enabled: false },
  });

// TODO: TEMP comment
describe('list connectors and get details before setting up', () => {
  it('should succeed to get all connectors and they are all disabled', async () => {
    const response = await api.get({ url: 'connectors', headers });
    expect(response).toHaveProperty('statusCode', 200);

    expect(() => {
      const connectorDtos = JSON.parse(response.body) as ConnectorDto[];
      expect(
        connectorDtos.every((connectorDto: ConnectorDto) => !connectorDto.enabled)
      ).toBeTruthy();
    }).not.toThrow();
  });

  it('should succeed to get connector details', async () => {
    const response = await api.get({ url: `connectors/${facebookConnectorId}`, headers });
    expect(response).toHaveProperty('statusCode', 200);

    expect(() => {
      const connectorDto = JSON.parse(response.body) as ConnectorDto;
      expect(connectorDto.enabled).toBeFalsy();
    });
  });
});

describe('set up connectors', () => {
  describe('set up social connectors', () => {
    it('should succeed to update the social connector config and enable it', async () => {
      const config = {
        clientId: 'application_foo',
        clientSecret: 'secret_bar',
      };

      const patchConfigResponse = await api.patch({
        url: `connectors/${facebookConnectorId}`,
        headers,
        json: {
          config,
        },
      });
      expect(patchConfigResponse).toHaveProperty('statusCode', 200);
      expect(() => {
        const patchedConnectorDto = JSON.parse(patchConfigResponse.body) as ConnectorDto;
        expect(patchedConnectorDto.config).toEqual(config);
      }).not.toThrow();

      const enabledResponse = await enableConnector(facebookConnectorId);
      expect(enabledResponse).toHaveProperty('statusCode', 200);
      expect(() => {
        const enabledConnectorDto = JSON.parse(enabledResponse.body) as ConnectorDto;
        expect(enabledConnectorDto.enabled).toBeTruthy();
      }).not.toThrow();
    });
  });

  describe('set up sms connectors', () => {
    const aliyunSmsConnectorId = 'aliyun-short-message-service';
    const twilioSmsConnectorId = 'twilio-short-message-service';

    it('should succeed to update the first sms connector config and enable it', async () => {
      const config = {
        signName: '<sign-name>',
        templates: [
          {
            usageType: 'SignIn',
            templateCode: '<template-code>',
          },
          {
            usageType: 'Register',
            templateCode: '<template-code>',
          },
          {
            usageType: 'Test',
            templateCode: '<template-code>',
          },
        ],
        accessKeyId: '<access-key-id>',
        accessKeySecret: '<access-key-secret>',
      };

      const patchConfigResponse = await api.patch({
        url: `connectors/${aliyunSmsConnectorId}`,
        headers,
        json: {
          config,
        },
      });
      expect(patchConfigResponse).toHaveProperty('statusCode', 200);
      expect(() => {
        const patchedConnectorDto = JSON.parse(patchConfigResponse.body) as ConnectorDto;
        expect(patchedConnectorDto.config).toEqual(config);
      }).not.toThrow();

      const enabledResponse = await enableConnector(aliyunSmsConnectorId);
      expect(enabledResponse).toHaveProperty('statusCode', 200);
      expect(() => {
        const enabledConnectorDto = JSON.parse(enabledResponse.body) as ConnectorDto;
        expect(enabledConnectorDto.enabled).toBeTruthy();
      }).not.toThrow();
    });

    it('changing sms connector should succeed to update another sms connector config, enable it and auto-disable the original one', async () => {
      const config = {
        authToken: '<auth-token>',
        templates: [
          {
            content: 'This is for sign-in purposes only. Your passcode is {{code}}.',
            usageType: 'SignIn',
          },
          {
            content: 'This is for registering purposes only. Your passcode is {{code}}.',
            usageType: 'Register',
          },
          {
            content: 'This is for testing purposes only. Your passcode is {{code}}.',
            usageType: 'Test',
          },
        ],
        accountSID: '<account-sid>',
        fromMessagingServiceSID: '<from-messaging-service-sid>',
      };

      const patchConfigResponse = await api.patch({
        url: `connectors/${twilioSmsConnectorId}`,
        headers,
        json: { config },
      });
      expect(patchConfigResponse).toHaveProperty('statusCode', 200);
      expect(() => {
        const patchedConnectorDto = JSON.parse(patchConfigResponse.body) as ConnectorDto;
        expect(patchedConnectorDto.config).toEqual(config);
      }).not.toThrow();

      const enabledResponse = await enableConnector(twilioSmsConnectorId);
      expect(enabledResponse).toHaveProperty('statusCode', 200);
      expect(() => {
        const enabledConnectorDto = JSON.parse(enabledResponse.body) as ConnectorDto;
        expect(enabledConnectorDto.enabled).toBeTruthy();
      }).not.toThrow();

      const response = await api.get({ url: 'connectors', headers });
      expect(response).toHaveProperty('statusCode', 200);
      expect(() => {
        const connectorDtos = JSON.parse(response.body) as ConnectorDto[];
        // There should be one and only one enabled sms connector after changing sms connector.
        expect(
          connectorDtos
            .filter((connector) => connector.type === ConnectorType.SMS)
            .every((connector) => connector.id === twilioSmsConnectorId || !connector.enabled)
        ).toBeTruthy();
      });
    });
  });

  describe('set up email connectors', () => {
    const aliyunEmailConnectorId = 'aliyun-direct-mail';
    const sendgridEmailConnectorId = 'sendgrid-email-service';

    it('should succeed to update the first email connector config and enable it', async () => {
      const config = {
        accessKeyId: '<your-access-key-id>',
        accessKeySecret: '<your-access-key-secret>',
        accountName: '<noreply@logto.io>',
        fromAlias: '<OPTIONAL-logto>',
        templates: [
          {
            subject: '<register-template-subject>',
            content: '<Logto: Your passcode is {{code}}. (regitser template)>',
            usageType: 'Register',
          },
          {
            subject: '<sign-in-template-subject>',
            content: '<Logto: Your passcode is {{code}}. (sign-in template)>',
            usageType: 'SignIn',
          },
          {
            subject: '<test-template-subject>',
            content: '<Logto: Your passcode is {{code}}. (test template)>',
            usageType: 'Test',
          },
        ],
      };

      const patchConfigResponse = await api.patch({
        url: `connectors/${aliyunEmailConnectorId}`,
        headers,
        json: {
          config,
        },
      });
      expect(patchConfigResponse).toHaveProperty('statusCode', 200);
      expect(() => {
        const patchedConnectorDto = JSON.parse(patchConfigResponse.body) as ConnectorDto;
        expect(patchedConnectorDto.config).toEqual(config);
      }).not.toThrow();

      const enabledResponse = await enableConnector(aliyunEmailConnectorId);
      expect(enabledResponse).toHaveProperty('statusCode', 200);
      expect(() => {
        const enabledConnectorDto = JSON.parse(enabledResponse.body) as ConnectorDto;
        expect(enabledConnectorDto.enabled).toBeTruthy();
      }).not.toThrow();
    });

    it('changing email connector should succeed to update another email connector config, enable it and auto-disable the original one', async () => {
      const config = {
        apiKey: '<api-key>',
        fromEmail: '<noreply@logto.test.io>',
        fromName: '<OPTIONAL-logto>',
        templates: [
          {
            usageType: 'SignIn',
            type: 'text/plain',
            subject: 'Logto SignIn Template',
            content: 'This is for sign-in purposes only. Your passcode is {{code}}.',
          },
          {
            usageType: 'Register',
            type: 'text/plain',
            subject: 'Logto Register Template',
            content: 'This is for registering purposes only. Your passcode is {{code}}.',
          },
          {
            usageType: 'Test',
            type: 'text/plain',
            subject: 'Logto Test Template',
            content: 'This is for testing purposes only. Your passcode is {{code}}.',
          },
        ],
      };
      const patchConfigResponse = await api.patch({
        url: `connectors/${sendgridEmailConnectorId}`,
        headers,
        json: { config },
      });
      expect(patchConfigResponse).toHaveProperty('statusCode', 200);
      expect(() => {
        const patchedConnectorDto = JSON.parse(patchConfigResponse.body) as ConnectorDto;
        expect(patchedConnectorDto.config).toEqual(config);
      }).not.toThrow();

      const enabledResponse = await enableConnector(sendgridEmailConnectorId);
      expect(enabledResponse).toHaveProperty('statusCode', 200);
      expect(() => {
        const enabledConnectorDto = JSON.parse(enabledResponse.body) as ConnectorDto;
        expect(enabledConnectorDto.enabled).toBeTruthy();
      }).not.toThrow();

      const response = await api.get({ url: 'connectors', headers });
      expect(response).toHaveProperty('statusCode', 200);
      expect(() => {
        const connectorDtos = JSON.parse(response.body) as ConnectorDto[];
        // There should be one and only one enabled email connector after changing email connector.
        expect(
          connectorDtos
            .filter((connector) => connector.type === ConnectorType.Email)
            .every((connector) => connector.id === sendgridEmailConnectorId || !connector.enabled)
        ).toBeTruthy();
      });
    });
  });

  describe('delete (i.e. disable) connectors', () => {
    it('should succeed to disable connector', async () => {
      const response = await api.get({ url: `connectors/${facebookConnectorId}`, headers });
      expect(response).toHaveProperty('statusCode', 200);
      expect(() => {
        const connectorDto = JSON.parse(response.body) as ConnectorDto;
        expect(connectorDto.enabled).toBeTruthy();
      });
      const deleteResponse = await deleteConnector(facebookConnectorId);
      expect(deleteResponse).toHaveProperty('statusCode', 200);
      expect(() => {
        const connectorDto = JSON.parse(deleteResponse.body) as ConnectorDto;
        expect(connectorDto.enabled).toBeFalsy();
      });
    });
  });

  describe('send test sms/email passcode', () => {
    it('should succeed to send sms passcode', () => {
      // TODO
    });

    it('should succeed to send email passcode', () => {
      // TODO
    });
  });
});
