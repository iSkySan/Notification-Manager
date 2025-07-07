export default class ClockService {
  
  private lastDailyRun: Date = new Date();
  private lastWeeklyRun: Date = new Date();
  
  sameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }
  
  sameWeek(date1: Date, date2: Date): boolean {
    const startOfWeek1 = new Date(date1);
    startOfWeek1.setDate(date1.getDate() - (date1.getDay()+6)%7);
    const startOfWeek2 = new Date(date2);
    startOfWeek2.setDate(date2.getDate() - (date2.getDay()+6)%7);
    
    return this.sameDay(startOfWeek1, startOfWeek2);
  }
  
  setIntervalRun(task: () => Promise<void>, errorHandling: (error:any) => void, frequencyInMs: number, condition: () => boolean) {
    setInterval(async () => {
      if(condition()) {
        try {
          await task();
        } catch (error) {
          errorHandling(error);
        }
      }
    }, frequencyInMs)
  }
  
  on(frequency: 'daily' | 'weekly', task: () => Promise<void>, errorHandling: (error: any) => void): void {
    if (frequency === 'daily') {
      this.setIntervalRun(() => {
        this.lastDailyRun = new Date();
        return task();
      }, errorHandling, 3600000/*1 hour*/,() => {
        const now = new Date();
        return !this.sameDay(now, this.lastDailyRun) 
      })
    }
    if (frequency === 'weekly') {
      this.setIntervalRun(() => {
        this.lastWeeklyRun = new Date();
        return task();
      }, errorHandling, 86400000/*1 day*/,() => {
        const now = new Date();
        return !this.sameWeek(now, this.lastWeeklyRun)
      })
    }
  }
}
