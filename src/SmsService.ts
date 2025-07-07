import UserService from "./UserService";

export default class SmsService {
  constructor(private userService: UserService) {}
  
  public send(userId: string, message: string): Promise<void> {
    return new Promise((resolve,reject) => {
      setTimeout(() => {
        const phoneNumber = this.userService.getUserPhoneNumber(userId);
        if(phoneNumber) {
          console.log(`SMS sent to ${phoneNumber} with message: ${message}`);
          return resolve();
        } else {
          return reject('phone number not found');
        }
      }, 10000); // Simulate network delay
    });
  }
}
