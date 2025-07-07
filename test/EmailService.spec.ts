import {describe, expect, it, jest} from '@jest/globals'
import EmailService from '../src/EmailService'

describe('EmailService', () => {
    it('should send email successfully', async () => {
        jest.useFakeTimers();
        const mockUserService = {
            getUserEmail: jest.fn().mockReturnValue('test@gmail.com'),
            users: [],
            addUser: jest.fn(),
            getUserPhoneNumber: jest.fn(),
            getUserSettings: jest.fn(),
            cannotSendNotification: jest.fn()
        };
        const emailService = new EmailService(mockUserService as any);
        const userId = '123';
        const body = 'Hello, this is a test email.';
        const promise = emailService.send(userId, body);
        jest.advanceTimersByTime(10000);
        await promise;
        expect(mockUserService.getUserEmail).toHaveBeenCalledWith(userId);
        jest.useRealTimers();
    });
});