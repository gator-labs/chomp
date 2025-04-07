export class BoundedQueue<T> {
  private queue: T[] = [];
  private maxSize: number;

  /**
  * Stores the resolve function for a pending enqueue operation.
  * When the queue is full, enqueue() creates a Promise and stores
  * its resolver here. This resolver is called when an item is
  * later dequeued, allowing the blocked enqueue operation
  * to complete.
  */
  private resolveEnqueue: ((value: void) => void) | null = null;
  private resolveDequeue: ((value: T) => void) | null = null;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  async enqueue(item: T): Promise<void> {
    if (this.queue.length >= this.maxSize) {
      console.log('Queue: max size reached waiting until next dequeue');
      await new Promise<void>((resolve) => {
        this.resolveEnqueue = resolve;
      });
    }

    this.queue.push(item);

    if (this.resolveDequeue) {
      this.resolveDequeue(this.queue.shift()!);
      this.resolveDequeue = null;
    }
  }

  async dequeue(): Promise<T> {
    if (this.queue.length > 0) {
      if (this.resolveEnqueue) {
        this.resolveEnqueue();
        this.resolveEnqueue = null;
      }
      return this.queue.shift()!;
    }
    return new Promise<T>((resolve) => {
      this.resolveDequeue = resolve;
    });
  }

  get size(): number {
    return this.queue.length;
  }
}

