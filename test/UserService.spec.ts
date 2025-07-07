import UserService, { Settings } from '../src/UserService';
import {describe, expect, it} from '@jest/globals'

describe('UserService', () => {
  it('ajoute un utilisateur et le retrouve', () => {
    const service = new UserService();
    const user = { id: '1', name: 'Alice', errors: [] };
    service.addUser(user);
    expect(service["users"][user.id]).toBe(user);
  });

  it('retourne le numéro de téléphone si présent', () => {
    const service = new UserService();
    service.addUser({ id: '2', name: 'Bob', phone: '0600000000', errors: [] });
    expect(service.getUserPhoneNumber('2')).toBe('0600000000');
  });

  it('retourne null si le numéro de téléphone est absent', () => {
    const service = new UserService();
    service.addUser({ id: '3', name: 'NoPhone', errors: [] });
    expect(service.getUserPhoneNumber('3')).toBeNull();
  });

  it('retourne l\'email si présent', () => {
    const service = new UserService();
    service.addUser({ id: '4', name: 'Mail', email: 'a@b.com', errors: [] });
    expect(service.getUserEmail('4')).toBe('a@b.com');
  });

  it('retourne null si l\'email est absent', () => {
    const service = new UserService();
    service.addUser({ id: '5', name: 'NoMail', errors: [] });
    expect(service.getUserEmail('5')).toBeNull();
  });

  it('retourne les settings de l\'utilisateur si présents', () => {
    const service = new UserService();
    const settings: Settings = {
      notificationEnabled: false,
      notificationByEmail: false,
      notificationBySms: true,
      notificationFrequency: 'weekly'
    };
    service.addUser({ id: '6', name: 'Set', settings, errors: [] });
    expect(service.getUserSettings('6')).toEqual(settings);
  });

  it('retourne les settings par défaut si absents', () => {
    const service = new UserService();
    service.addUser({ id: '7', name: 'Default', errors: [] });
    expect(service.getUserSettings('7')).toEqual({
      notificationEnabled: true,
      notificationByEmail: true,
      notificationBySms: false,
      notificationFrequency: 'immediate'
    });
  });

  it('retourne null pour getUserSettings si user inconnu', () => {
    const service = new UserService();
    expect(service.getUserSettings('unknown')).toBeNull();
  });

  it('ajoute une erreur à l\'utilisateur avec cannotSendNotification', () => {
    const service = new UserService();
    service.addUser({ id: '8', name: 'Err', errors: [] });
    service.cannotSendNotification({ userId: '8', error: 'fail' });
    expect(service["users"]['8'].errors).toContain('fail');
  });

  it('cannotSendNotification ne plante pas si user inconnu', () => {
    const service = new UserService();
    expect(() => service.cannotSendNotification({ userId: '404', error: 'err' })).not.toThrow();
  });
});

