import {describe, it, expect, jest} from '@jest/globals'
import Scheduler from '../src/Scheduler'

describe('Scheduler', () => {
  it('should execute all task added when runed', async () => {
    // fixture
    const task1 = jest.fn(() => Promise.resolve());
    const task2 = jest.fn(() => Promise.resolve());
    const task3 = jest.fn(() => Promise.resolve());
    const scheduler = new Scheduler();
    scheduler.addTask(task1)
    scheduler.addTask(task2)
    scheduler.addTask(task3)
    //test
    await scheduler.run();
    //assertion
    expect(task1).toHaveBeenCalled()
    expect(task2).toHaveBeenCalled()
    expect(task3).toHaveBeenCalled()
  });
  it('should do nothing and returned successfully when no task has been added', async () => {
    // fixture
    const scheduler = new Scheduler();
    
    // test
    const run = scheduler.run();
    
    // assertion
    return expect(run).resolves.toBeUndefined();
  });
  it('should not execute task while adding them', async () => {
    //FIXTURE
    const task = jest.fn(() => Promise.resolve());
    const scheduler = new Scheduler();
    
    //TEST
    scheduler.addTask(task);
    
    //ASSERTION
    expect(task).not.toHaveBeenCalled();
  });
  it('should execute each task only once', async () => {
    // fixture
    const task1 = jest.fn(() => Promise.resolve());
    const task2 = jest.fn(() => Promise.resolve());
    const task3 = jest.fn(() => Promise.resolve());
    const scheduler = new Scheduler();
    scheduler.addTask(task1)
    scheduler.addTask(task2)
    scheduler.addTask(task3)
    //test
    await scheduler.run();
    await scheduler.run();
    //assertion
    expect(task1).toHaveBeenCalledTimes(1)
    expect(task2).toHaveBeenCalledTimes(1)
    expect(task3).toHaveBeenCalledTimes(1)
  })
  it('should execute the tasks in the same order they have been added', async () => {
    // fixtures
    const scheduler = new Scheduler();
    const executionOrder : number[] = [];
    const task1 = () => new Promise<void>((resolve) => {
      executionOrder.push(1);
      resolve();
    })
    const task2 = () => new Promise<void>((resolve) => {
      executionOrder.push(2);
      resolve();
    })
    scheduler.addTask(task1);
    scheduler.addTask(task2);
    
    // test
    await scheduler.run();
    
    // assertion
    expect(executionOrder).toEqual([1,2]);
  })
})
