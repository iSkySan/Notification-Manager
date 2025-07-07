import {describe, expect, it, jest} from '@jest/globals'
import EmailService from "../src/EmailService";
import SmsService from "../src/SmsService";
import UserService from "../src/UserService";
import ClockService from "../src/ClockService";
import Scheduler from "../src/Scheduler";
import NotificationManager from "../src/NotificationManager";

describe('NotificationManager', () => {
    describe('sendNotification', () => {
        it('envoie un email et un sms si activés', async () => {
            const emailService = new EmailService({ getUserEmail: jest.fn() } as any);
            (emailService as any).send = jest.fn().mockImplementation(() => Promise.resolve());
            const userService = { getUserSettings: jest.fn(), cannotSendNotification: jest.fn() } as unknown as UserService;
            const smsService = new SmsService(userService);
            (smsService as any).send = jest.fn().mockImplementation(() => Promise.resolve());
            const clockService = { on: jest.fn() } as unknown as ClockService;
            const scheduler = { addTask: jest.fn().mockReturnValue({ addTask: jest.fn(), run: jest.fn() }) } as unknown as Scheduler;

            const notificationManager = new NotificationManager(
                emailService,
                smsService,
                userService,
                clockService,
                scheduler,
                scheduler
            );

            const userId = 'user1';
            const settings = {
                notificationEnabled: true,
                notificationByEmail: true,
                notificationBySms: true,
                notificationFrequency: "immediate" as "immediate"
            };
            const message = 'Ceci est un test';

            await notificationManager.sendNotification(userId, settings, message);

            expect(emailService.send).toHaveBeenCalledWith(userId, message);
            expect(smsService.send).toHaveBeenCalledWith(userId, message);

        });

        it('planifie une notification quotidienne', async () => {
            const emailService = new EmailService({ getUserEmail: jest.fn() } as any);
            (emailService as any).send = jest.fn().mockImplementation(() => Promise.resolve());
            // Utilisation d'un UserService réel avec un utilisateur daily
            const userService = new UserService();
            userService.addUser({
                id: 'user2',
                name: 'User 2',
                email: 'user2@email.com',
                phone: '0600000000',
                settings: {
                    notificationEnabled: true,
                    notificationByEmail: true,
                    notificationBySms: false,
                    notificationFrequency: "daily"
                },
                errors: []
            });
            const smsService = new SmsService(userService);
            (smsService as any).send = jest.fn().mockImplementation(() => Promise.resolve());
            const weeklyScheduler = { addTask: jest.fn().mockReturnValue({ addTask: jest.fn(), run: jest.fn() }) } as unknown as Scheduler;
            const dailyScheduler = { addTask: jest.fn().mockReturnValue({ addTask: jest.fn(), run: jest.fn() }) } as unknown as Scheduler;
            const clockService = { on: jest.fn() } as unknown as ClockService;

            const notificationManager = new NotificationManager(
                emailService,
                smsService,
                userService,
                clockService,
                weeklyScheduler,
                dailyScheduler
            );

            const userId = 'user2';
            const message = 'Notification quotidienne';

            await notificationManager.notify(userId, message);

            // Selon la logique du code, c'est weeklyScheduler.addTask qui est appelé pour daily
            expect(weeklyScheduler.addTask).toHaveBeenCalled();
        });

        it('planifie une notification hebdomadaire', async () => {
            const emailService = new EmailService({ getUserEmail: jest.fn() } as any);
            (emailService as any).send = jest.fn().mockImplementation(() => Promise.resolve());
            // Utilisation d'un UserService réel avec un utilisateur weekly
            const userService = new UserService();
            userService.addUser({
                id: 'user3',
                name: 'User 3',
                email: 'user3@email.com',
                phone: '0600000001',
                settings: {
                    notificationEnabled: true,
                    notificationByEmail: false,
                    notificationBySms: true,
                    notificationFrequency: "weekly"
                },
                errors: []
            });
            const smsService = new SmsService(userService);
            (smsService as any).send = jest.fn().mockImplementation(() => Promise.resolve());
            const weeklyScheduler = { addTask: jest.fn().mockReturnValue({ addTask: jest.fn(), run: jest.fn() }) } as unknown as Scheduler;
            const dailyScheduler = { addTask: jest.fn().mockReturnValue({ addTask: jest.fn(), run: jest.fn() }) } as unknown as Scheduler;
            const clockService = { on: jest.fn() } as unknown as ClockService;

            const notificationManager = new NotificationManager(
                emailService,
                smsService,
                userService,
                clockService,
                weeklyScheduler,
                dailyScheduler
            );

            const userId = 'user3';
            const message = 'Notification hebdomadaire';

            await notificationManager.notify(userId, message);

            // Selon la logique du code, c'est dailyScheduler.addTask qui est appelé pour weekly
            expect(dailyScheduler.addTask).toHaveBeenCalled();
        });

        it('appelle cannotSendNotification sur erreur daily/weekly', () => {
            const emailService = new EmailService({ getUserEmail: jest.fn() } as any);
            const userService = new UserService();
            userService.addUser({ id: 'u', name: 'u', errors: [] });
            const smsService = new SmsService(userService);
            // On va mocker clockService.on pour capturer les callbacks
            const onMock = jest.fn();
            const clockService = { on: onMock } as unknown as ClockService;
            const weeklyScheduler = { addTask: jest.fn() } as unknown as Scheduler;
            const dailyScheduler = { addTask: jest.fn() } as unknown as Scheduler;
            userService.cannotSendNotification = jest.fn();
            new NotificationManager(
                emailService,
                smsService,
                userService,
                clockService,
                weeklyScheduler,
                dailyScheduler
            );
            // Récupère les callbacks d'erreur passés à clockService.on
            const onCalls = onMock.mock.calls;
            // Simule l'appel du callback d'erreur avec un objet { userId, error }
            if (typeof onCalls[0][2] === 'function') {
                onCalls[0][2]({ userId: 'u', error: 'err1' });
            }
            if (typeof onCalls[1][2] === 'function') {
                onCalls[1][2]({ userId: 'u', error: 'err2' });
            }
            expect(userService.cannotSendNotification).toHaveBeenCalledWith({ userId: 'u', error: 'err1' });
            expect(userService.cannotSendNotification).toHaveBeenCalledWith({ userId: 'u', error: 'err2' });
        });

        it('ne fait rien si notificationEnabled est false', async () => {
            const emailService = new EmailService({ getUserEmail: jest.fn() } as any);
            const userService = new UserService();
            userService.addUser({
                id: 'user4', name: 'User 4', errors: [],
                settings: {
                    notificationEnabled: false,
                    notificationByEmail: true,
                    notificationBySms: true,
                    notificationFrequency: 'immediate'
                }
            });
            const smsService = new SmsService(userService);
            const clockService = { on: jest.fn() } as unknown as ClockService;
            const weeklyScheduler = { addTask: jest.fn() } as unknown as Scheduler;
            const dailyScheduler = { addTask: jest.fn() } as unknown as Scheduler;
            const notificationManager = new NotificationManager(
                emailService,
                smsService,
                userService,
                clockService,
                weeklyScheduler,
                dailyScheduler
            );
            const spy = jest.spyOn(notificationManager, 'sendNotification');
            await notificationManager.notify('user4', 'msg');
            expect(spy).not.toHaveBeenCalled();
        });

        it('ajoute une tâche si batchNotification.has(daily) est true', async () => {
            const emailService = new EmailService({ getUserEmail: jest.fn() } as any);
            const userService = new UserService();
            userService.addUser({
                id: 'user5', name: 'User 5', errors: [],
                settings: {
                    notificationEnabled: true,
                    notificationByEmail: true,
                    notificationBySms: false,
                    notificationFrequency: 'daily'
                }
            });
            const smsService = new SmsService(userService);
            const clockService = { on: jest.fn() } as unknown as ClockService;
            const weeklyScheduler = { addTask: jest.fn() } as unknown as Scheduler;
            const dailyScheduler = { addTask: jest.fn() } as unknown as Scheduler;
            const notificationManager = new NotificationManager(
                emailService,
                smsService,
                userService,
                clockService,
                weeklyScheduler,
                dailyScheduler
            );
            const fakeBatch = { addTask: jest.fn() };
            (notificationManager as any).batchNotification.set('daily', fakeBatch);
            await notificationManager.notify('user5', 'msg');
            expect(fakeBatch.addTask).toHaveBeenCalled();
        });

        it('ajoute une tâche si batchNotification.has(weekly) est true', async () => {
            const emailService = new EmailService({ getUserEmail: jest.fn() } as any);
            const userService = new UserService();
            userService.addUser({
                id: 'user6', name: 'User 6', errors: [],
                settings: {
                    notificationEnabled: true,
                    notificationByEmail: false,
                    notificationBySms: true,
                    notificationFrequency: 'weekly'
                }
            });
            const smsService = new SmsService(userService);
            const clockService = { on: jest.fn() } as unknown as ClockService;
            const weeklyScheduler = { addTask: jest.fn() } as unknown as Scheduler;
            const dailyScheduler = { addTask: jest.fn() } as unknown as Scheduler;
            const notificationManager = new NotificationManager(
                emailService,
                smsService,
                userService,
                clockService,
                weeklyScheduler,
                dailyScheduler
            );
            const fakeBatch = { addTask: jest.fn() };
            (notificationManager as any).batchNotification.set('weekly', fakeBatch);
            await notificationManager.notify('user6', 'msg');
            expect(fakeBatch.addTask).toHaveBeenCalled();
        });

        it('notifyFrequency ne fait rien si aucun batch', async () => {
            const emailService = new EmailService({ getUserEmail: jest.fn() } as any);
            const userService = new UserService();
            const smsService = new SmsService(userService);
            const clockService = { on: jest.fn() } as unknown as ClockService;
            const weeklyScheduler = { addTask: jest.fn() } as unknown as Scheduler;
            const dailyScheduler = { addTask: jest.fn() } as unknown as Scheduler;
            const notificationManager = new NotificationManager(
                emailService,
                smsService,
                userService,
                clockService,
                weeklyScheduler,
                dailyScheduler
            );
            // Pas de batch dans batchNotification
            await notificationManager.notifyFrequency('daily');
            await notificationManager.notifyFrequency('weekly');
            // Pas d'erreur attendue
        });
    });
});