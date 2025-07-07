import SmsService from '../src/SmsService';
import UserService from '../src/UserService';
import {describe, expect, it, jest} from '@jest/globals'

describe('SmsService', () => {
  it('résout la promesse si le numéro existe', async () => {
    const userService = new UserService();
    userService.addUser({ id: '1', name: 'Test', phone: '0600000000', errors: [] });
    const smsService = new SmsService(userService);
    // On mock setTimeout pour exécuter immédiatement
    jest.useFakeTimers();
    const promise = smsService.send('1', 'hello');
    jest.runAllTimers();
    await expect(promise).resolves.toBeUndefined();
    jest.useRealTimers();
  });

  it('rejette la promesse si le numéro est absent', async () => {
    const userService = new UserService();
    userService.addUser({ id: '2', name: 'NoPhone', errors: [] });
    const smsService = new SmsService(userService);
    jest.useFakeTimers();
    const promise = smsService.send('2', 'fail');
    jest.runAllTimers();
    await expect(promise).rejects.toBe('phone number not found');
    jest.useRealTimers();
  });

  it('rejette la promesse si l\'utilisateur est inconnu', async () => {
    const userService = new UserService();
    const smsService = new SmsService(userService);
    jest.useFakeTimers();
    const promise = smsService.send('404', 'fail');
    jest.runAllTimers();
    await expect(promise).rejects.toBe('phone number not found');
    jest.useRealTimers();
  });
});

