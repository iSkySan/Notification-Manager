import ClockService from "./ClockService";
import EmailService from "./EmailService";
import Scheduler from "./Scheduler";
import SmsService from "./SmsService";
import UserService, {Settings} from "./UserService";

export default class NotificationManager {
  constructor(private email: EmailService,
              private sms: SmsService,
              private userService: UserService,
              private clockService: ClockService,
              private weeklyScheduler: Scheduler,
              private dailyScheduler: Scheduler,
  ) {
    this.clockService.on('daily', () => this.notifyFrequency('daily'), (error) => {
      this.userService.cannotSendNotification(error);
    });
    this.clockService.on('weekly', () => this.notifyFrequency('weekly'), (error) => {
      this.userService.cannotSendNotification(error);
    });
  }

  private batchNotification: Map<'daily' | 'weekly', Scheduler> = new Map();


  sendNotification(userId: string, settings: Settings, message: string) {
    return Promise.all(
      [
        settings.notificationByEmail ? this.email.send(userId, message) : Promise.resolve(),
        settings.notificationBySms ? this.sms.send(userId, message) : Promise.resolve()
      ]
    ).then(() => {})
  }

  async notify(userId: string, message: string) {
    const settings = this.userService.getUserSettings(userId);
    if (settings.notificationEnabled) {
      switch (settings.notificationFrequency) {
        case "immediate":
          await this.sendNotification(userId, settings, message);
          break;
        case "daily":
          if (this.batchNotification.has('daily')) {
            this.batchNotification.get('daily')!.addTask(() => this.sendNotification(userId, settings, message));
          } else {
            this.batchNotification.set('daily', this.weeklyScheduler.addTask(() => this.sendNotification(userId, settings, message)))
          }
          break;
        case "weekly":
          if (this.batchNotification.has('weekly')) {
            this.batchNotification.get('weekly')!.addTask(() => this.sendNotification(userId, settings, message));
          } else {
            this.batchNotification.set('weekly', this.dailyScheduler.addTask(() => this.sendNotification(userId, settings, message)))
          }
          break;
      }
    }
  }

  async notifyFrequency(frequency: 'daily' | 'weekly') {
    const batch = this.batchNotification.get(frequency);
    if (batch) {
      await batch.run();
    }
  }
}
