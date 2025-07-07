import {describe, expect, it, jest} from '@jest/globals'
import ClockService from "../src/ClockService";

describe('ClockService', () => {
  describe('sameDay', () => {
    it('should return true when both date are in the same day', () => {
      //fixtures
      const clockservice = new ClockService();
      const date1 = new Date(2025, 6, 23, 12);
      const date2 = new Date(2025, 6, 23, 10);

      //test
      const result = clockservice.sameDay(date1, date2);

      //assertion
      expect(result).toBe(true)
    });
    it('should return false when both date are in different day', () => {
      const clockservice = new ClockService();
      const date1 = new Date(2025, 6, 23, 12);
      const date2 = new Date(2025, 6, 24, 10);

      //test
      const result = clockservice.sameDay(date1, date2);

      //assertion
      expect(result).toBe(false)
    });
  });
  describe('sameWeek', () => {
    it('should return true when both date are in the same day', () => {
      const clockservice = new ClockService();
      const date1 = new Date(2025, 6, 23, 12);
      const date2 = new Date(2025, 6, 23, 10);

      //test
      const result = clockservice.sameWeek(date1, date2);

      //assertion
      expect(result).toBe(true)
    });
    it('should return true when both date are in the same week but in different day', async () => {
      const clockservice = new ClockService();
      const date1 = new Date(2025, 6, 23, 12);
      const date2 = new Date(2025, 6, 24, 10);

      //test
      const result = clockservice.sameWeek(date1, date2);

      //assertion
      expect(result).toBe(true)
    });
    it('should return true when both date are in the same week but different month', () => {
      const clockservice = new ClockService();
      const date1 = new Date(2025, 6, 30);
      const date2 = new Date(2025, 7, 1);

      //test
      const result = clockservice.sameWeek(date1, date2);

      //assertion
      expect(result).toBe(true)
    });
    it('should return true when both date are in the same week but different year', () => {
      const clockservice = new ClockService();
      const date1 = new Date(2025, 11, 31);
      const date2 = new Date(2026, 0, 1);

      //test
      const result = clockservice.sameWeek(date1, date2);

      //assertion
      expect(result).toBe(true)
    });
    describe('check that week start on monday', () => {
      it('should return true when one date is the monday and the other date is the next sunday', async () => {
        //FIXTURE
        const monday = new Date(2025, 5, 23);
        const sunday = new Date(2025, 5, 29);
        const clockService = new ClockService();

        //TEST
        const sameWeek = clockService.sameWeek(monday, sunday);

        //ASSERTION
        expect(sameWeek).toBe(true);
      });

      it('should return false when one date is sunday and the other date is the next monday', async () => {
        //FIXTURE
        const monday = new Date(2025, 5, 23);
        const sunday = new Date(2025, 5, 22);
        const clockService = new ClockService();

        //TEST
        const sameWeek = clockService.sameWeek(monday, sunday);

        //ASSERTION
        expect(sameWeek).toBe(false);
      });
    })
    it('should return false when the dates are in different week', async () => {
      const clockservice = new ClockService();
      const date1 = new Date(2025, 6, 1);
      const date2 = new Date(2025, 6, 23);

      //test
      const result = clockservice.sameWeek(date1, date2);

      //assertion
      expect(result).toBe(false)
    });
  });
  describe('check daily task', () => {
    it('should call daily task only once per day', async () => {
      // fixture
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2025, 6, 23)) // Ce lundi
      const clock = new ClockService();
      const task = jest.fn(() => Promise.resolve());

      // test
      clock.on('daily', task, () => {} );
      jest.advanceTimersByTime(86400000 * 1);

      // assertion
      expect(task).toHaveBeenCalledTimes(1);
      
      // test + assertion
      for(let i = 0; i < 23; i++) {
        jest.advanceTimersByTime(3600000);
        expect(task).toHaveBeenCalledTimes(1);
      }
    })
    it('should call daily task every day', async () => {
      // fixture
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2025, 6, 23)) // Ce lundi
      const clock = new ClockService();
      const task = jest.fn(() => Promise.resolve());
      
      // test
      clock.on('daily', task, () => {} );
      jest.advanceTimersByTime(86400000 * 7);
      
      // assertion
      expect(task).toHaveBeenCalledTimes(7);
    });
  });

  describe('check weekly task', () => {
    it('should call weekly task only once per week', async () => {
      // fixture
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2025, 5, 23)) // Ce lundi
      const clock = new ClockService();
      const task = jest.fn(() => Promise.resolve());

      // test
      clock.on('weekly', task, () => {} );
      jest.advanceTimersByTime(86400000 * 7);

      // assertion
      expect(task).toHaveBeenCalledTimes(1);

      // test + assertion
      for(let i = 0; i < 6; i++) {
        jest.advanceTimersByTime(86400000);
        expect(task).toHaveBeenCalledTimes(1);
      }
    })
    it('should call weekly task every week', async () => {
      // fixture
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2025, 5, 23)) // Ce lundi
      const clock = new ClockService();
      const task = jest.fn(() => Promise.resolve());

      // test
      clock.on('weekly', task, () => {} );
      jest.advanceTimersByTime(86400000 * 7 * 7);

      // assertion
      expect(task).toHaveBeenCalledTimes(7);
    })
  });
});
