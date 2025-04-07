import { MysteryBoxPrize, PrismaClient } from "@prisma/client";

// Define a Job interface that we'll use throughout the system
export interface Job<T> {
  id: string;
  data: T;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

/**
 * A bounded queue implementation for the producer-consumer pattern
 * with a maximum capacity to prevent memory overflow
 */
export class BoundedQueue<T> {
  private queue: Job<T>[] = [];
  private maxCapacity: number;
  
  constructor(maxCapacity: number) {
    this.maxCapacity = maxCapacity;
  }
  
  /**
   * Add a job to the queue if there's capacity
   * @returns boolean indicating if the job was successfully added
   */
  enqueue(job: Job<T>): boolean {
    if (this.queue.length >= this.maxCapacity) {
      return false; // Queue is full
    }
    
    this.queue.push(job);
    return true;
  }
  
  /**
   * Remove and return the next job from the queue
   */
  dequeue(): Job<T> | null {
    if (this.queue.length === 0) {
      return null;
    }
    
    return this.queue.shift() || null;
  }
  
  /**
   * Get the current length of the queue
   */
  get length(): number {
    return this.queue.length;
  }
  
  /**
   * Check if the queue is at capacity
   */
  get isFull(): boolean {
    return this.queue.length >= this.maxCapacity;
  }
  
  /**
   * Check if the queue is empty
   */
  get isEmpty(): boolean {
    return this.queue.length === 0;
  }
}

/**
 * Producer for MysteryBoxPrize jobs
 * Gets prizes from the database and adds them to the job queue
 */
export class MysteryBoxPrizeProducer {
  private prizeProducer: MysteryBoxPrizeProducerOrdered;
  private queue: BoundedQueue<MysteryBoxPrize>;
  private isRunning: boolean = false;
  private batchSize: number;
  
  constructor(
    prisma: PrismaClient, 
    queue: BoundedQueue<MysteryBoxPrize>,
    batchSize: number = 100
  ) {
    this.prizeProducer = new MysteryBoxPrizeProducerOrdered(prisma, batchSize);
    this.queue = queue;
    this.batchSize = batchSize;
  }
  
  /**
   * Start the producer process
   * This will continuously fetch prizes and add them to the queue
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }
    
    this.isRunning = true;
    
    try {
      while (this.isRunning) {
        // If the queue is full, wait before trying to add more jobs
        if (this.queue.isFull) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        
        // Get the next prize from the database
        const prize = await this.prizeProducer.getNextPrize();
        
        // If there are no more prizes, stop the producer
        if (!prize) {
          this.isRunning = false;
          break;
        }
        
        // Create a job and add it to the queue
        const job: Job<MysteryBoxPrize> = {
          id: prize.id,
          data: prize,
          status: 'pending',
          createdAt: new Date()
        };
        
        const added = this.queue.enqueue(job);
        
        // If the job couldn't be added (queue full), wait a bit before trying again
        if (!added) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      console.error('Producer error:', error);
      this.isRunning = false;
      throw error;
    }
  }
  
  /**
   * Stop the producer process
   */
  stop(): void {
    this.isRunning = false;
  }
}

/**
 * Worker that processes a single job
 */
export class JobWorker<T> {
  private id: number;
  private processFunction: (job: Job<T>) => Promise<void>;
  
  constructor(id: number, processFunction: (job: Job<T>) => Promise<void>) {
    this.id = id;
    this.processFunction = processFunction;
  }
  
  /**
   * Process a job with error handling
   */
  async process(job: Job<T>): Promise<Job<T>> {
    try {
      job.status = 'processing';
      job.startedAt = new Date();
      
      await this.processFunction(job);
      
      job.status = 'completed';
      job.completedAt = new Date();
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : String(error);
    }
    
    return job;
  }
  
  get workerId(): number {
    return this.id;
  }
}

/**
 * Consumer that processes jobs using a pool of workers
 */
export class JobConsumer<T> {
  private queue: BoundedQueue<Job<T>>;
  private workers: JobWorker<T>[] = [];
  private activeJobs: Set<string> = new Set();
  private isRunning: boolean = false;
  private maxConcurrentJobs: number;
  
  constructor(
    queue: BoundedQueue<Job<T>>,
    processFunction: (job: Job<T>) => Promise<void>,
    maxConcurrentJobs: number
  ) {
    this.queue = queue;
    this.maxConcurrentJobs = maxConcurrentJobs;
    
    // Create the worker pool
    for (let i = 0; i < maxConcurrentJobs; i++) {
      this.workers.push(new JobWorker(i, processFunction));
    }
  }
  
  /**
   * Start the consumer process
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }
    
    this.isRunning = true;
    
    try {
      while (this.isRunning) {
        // If we've reached the maximum number of concurrent jobs, wait
        if (this.activeJobs.size >= this.maxConcurrentJobs) {
          await new Promise(resolve => setTimeout(resolve, 100));
          continue;
        }
        
        // Get the next job from the queue
        const job = this.queue.dequeue();
        
        if (!job) {
          // If there are no jobs, wait a bit before checking again
          await new Promise(resolve => setTimeout(resolve, 500));
          continue;
        }
        
        // Find an available worker
        const availableWorkerIndex = this.workers.findIndex(
          worker => !this.activeJobs.has(`worker-${worker.workerId}`)
        );
        
        if (availableWorkerIndex === -1) {
          // Put the job back in the queue if no workers are available
          this.queue.enqueue(job);
          await new Promise(resolve => setTimeout(resolve, 100));
          continue;
        }
        
        const worker = this.workers[availableWorkerIndex];
        const workerId = `worker-${worker.workerId}`;
        
        // Mark this worker as busy
        this.activeJobs.add(workerId);
        
        // Process the job in the background
        this.processJobWithWorker(job, worker, workerId).catch(error => {
          console.error(`Error processing job ${job.id}:`, error);
        });
      }
    } catch (error) {
      console.error('Consumer error:', error);
      this.isRunning = false;
      throw error;
    }
  }
  
  /**
   * Process a job with a specific worker
   */
  private async processJobWithWorker(job: Job<T>, worker: JobWorker<T>, workerId: string): Promise<void> {
    try {
      await worker.process(job);
    } catch (error) {
      console.error(`Worker ${workerId} error:`, error);
    } finally {
      // Mark the worker as available again
      this.activeJobs.delete(workerId);
    }
  }
  
  /**
   * Stop the consumer process
   */
  stop(): void {
    this.isRunning = false;
  }
  
  /**
   * Get the number of active jobs
   */
  get activeJobCount(): number {
    return this.activeJobs.size;
  }
}

/**
 * Example usage of the producer-consumer system with MysteryBoxPrizes
 */
export async function setupMysteryBoxProcessingSystem(
  prisma: PrismaClient,
  queueCapacity: number = 1000,
  maxConcurrentJobs: number = 10,
  batchSize: number = 100
): Promise<{ producer: MysteryBoxPrizeProducer, consumer: JobConsumer<MysteryBoxPrize> }> {
  // Create the shared queue
  const queue = new BoundedQueue<MysteryBoxPrize>(queueCapacity);
  
  // Create the producer
  const producer = new MysteryBoxPrizeProducer(prisma, queue, batchSize);
  
  // Define how to process a MysteryBoxPrize
  const processPrize = async (job: Job<MysteryBoxPrize>): Promise<void> => {
    const prize = job.data;
    
    // Here you would implement your prize processing logic
    // For example:
    console.log(`Processing prize ${prize.id}`);
    
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // You could update the prize status in the database
    await prisma.mysteryBoxPrize.update({
      where: { id: prize.id },
      data: { 
        // Update with your processing logic
        // For example: status: 'processed'
      }
    });
  };
  
  // Create the consumer with the processing function
  const consumer = new JobConsumer<MysteryBoxPrize>(queue, processPrize, maxConcurrentJobs);
  
  return { producer, consumer };
}

// Example of how to use the system
export async function runMysteryBoxProcessingSystem(prisma: PrismaClient): Promise<void> {
  const { producer, consumer } = await setupMysteryBoxProcessingSystem(prisma);
  
  // Start the consumer first to ensure it's ready to process jobs
  consumer.start().catch(error => {
    console.error('Error in consumer:', error);
  });
  
  // Then start the producer
  producer.start().catch(error => {
    console.error('Error in producer:', error);
  });
  
  // You might want to add monitoring, graceful shutdown, etc.
  
  // Example of stopping after some condition
  // setTimeout(() => {
  //   producer.stop();
  //   // Wait for queue to empty before stopping consumer
  //   const checkQueueInterval = setInterval(() => {
  //     if (consumer.activeJobCount === 0 && queue.isEmpty) {
  //       consumer.stop();
  //       clearInterval(checkQueueInterval);
  //     }
  //   }, 1000);
  // }, 60000); // Run for 1 minute
}
