import { fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { sendRegisterEmailPasscode } from '@/apis/register';
import { sendSignInEmailPasscode } from '@/apis/sign-in';

import EmailPasswordless from './EmailPasswordless';

jest.mock('@/apis/sign-in', () => ({
  sendSignInEmailPasscode: jest.fn(async () => 0),
}));
jest.mock('@/apis/register', () => ({
  sendRegisterEmailPasscode: jest.fn(async () => 0),
}));

describe('<EmailPasswordless/>', () => {
  test('render', () => {
    const { queryByText, container } = renderWithPageContext(
      <MemoryRouter>
        <EmailPasswordless type="sign-in" />
      </MemoryRouter>
    );
    expect(container.querySelector('input[name="email"]')).not.toBeNull();
    expect(queryByText('action.continue')).not.toBeNull();
  });

  test('render with terms settings enabled', () => {
    const { queryByText } = renderWithPageContext(
      <MemoryRouter>
        <SettingsProvider>
          <EmailPasswordless type="sign-in" />
        </SettingsProvider>
      </MemoryRouter>
    );
    expect(queryByText('description.terms_of_use')).not.toBeNull();
  });

  test('required email with error message', () => {
    const { queryByText, container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <EmailPasswordless type="sign-in" />
      </MemoryRouter>
    );
    const submitButton = getByText('action.continue');

    fireEvent.click(submitButton);
    expect(queryByText('invalid_email')).not.toBeNull();
    expect(sendSignInEmailPasscode).not.toBeCalled();

    const emailInput = container.querySelector('input[name="email"]');

    if (emailInput) {
      fireEvent.change(emailInput, { target: { value: 'foo' } });
      expect(queryByText('invalid_email')).not.toBeNull();

      fireEvent.change(emailInput, { target: { value: 'foo@logto.io' } });
      expect(queryByText('invalid_email')).toBeNull();
    }
  });

  test('should call sign-in method properly', async () => {
    const { container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <SettingsProvider>
          <EmailPasswordless type="sign-in" />
        </SettingsProvider>
      </MemoryRouter>
    );
    const emailInput = container.querySelector('input[name="email"]');

    if (emailInput) {
      fireEvent.change(emailInput, { target: { value: 'foo@logto.io' } });
    }
    const termsButton = getByText('description.agree_with_terms');
    fireEvent.click(termsButton);

    const submitButton = getByText('action.continue');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(sendSignInEmailPasscode).toBeCalledWith('foo@logto.io');
    });
  });

  test('should call register method properly', async () => {
    const { container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <SettingsProvider>
          <EmailPasswordless type="register" />
        </SettingsProvider>
      </MemoryRouter>
    );
    const emailInput = container.querySelector('input[name="email"]');

    if (emailInput) {
      fireEvent.change(emailInput, { target: { value: 'foo@logto.io' } });
    }
    const termsButton = getByText('description.agree_with_terms');
    fireEvent.click(termsButton);

    const submitButton = getByText('action.continue');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(sendRegisterEmailPasscode).toBeCalledWith('foo@logto.io');
    });
  });
});
