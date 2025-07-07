import UserService from "./UserService";

export default class EmailService {
  
  constructor(private userService: UserService) {}
  
  send(userId: string, body: string): Promise<void> {
    return new Promise((resolve,reject) => {
      setTimeout(() => {
        const email = this.userService.getUserEmail(userId);
        if(email) {
          console.log(`Email sent to ${email} with body: ${body}`);
          return resolve();
        } else {
          return reject('Email not found');
        }
      }, 10000); // Simulate network delay
    });
  }
}
