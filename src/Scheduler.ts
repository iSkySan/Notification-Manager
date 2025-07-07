export default class Scheduler {
  private tasks: (() => Promise<void>)[] = [];

  addTask(task: () => Promise<void>): Scheduler {
    this.tasks.push(task);
    return this;
  }

  async run(): Promise<void> {
    while (this.tasks.length > 0) {
      const task = this.tasks.shift();
      if (task) {
        await task();
      }
    }
  }
}
