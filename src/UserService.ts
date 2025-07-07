export type Settings = {
  notificationEnabled: boolean;
  notificationByEmail: boolean;
  notificationBySms: boolean;
  notificationFrequency: 'immediate' | 'daily' | 'weekly';
}

type User = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  settings?: Settings;
  errors: string[];
}

export default class UserService {
  private users: { [id: string]: User } = {};
  
  addUser(user: User) {
    this.users[user.id] = user;
  }

  getUserPhoneNumber(userId: string): string | null {
    const user = this.users[userId];
    if (!user) return null;
    return user.phone || null;
  }
  
  getUserEmail(userId: string): string | null {
    const user = this.users[userId];
    if (!user) return null;
    return user.email || null;
  }

  getUserSettings(userId: string): Settings | null {
    const user = this.users[userId];
    if (!user) return null;
    return user.settings || {
      notificationEnabled: true,
      notificationByEmail: true,
      notificationBySms: false,
      notificationFrequency: 'immediate'
    };
  }

  cannotSendNotification({userId, error}: { userId: string, error: string }): void {
    const user = this.users[userId];
    if (user) {
      user.errors.push(error);
    }
  }
}
