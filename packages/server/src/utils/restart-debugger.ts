import { logger } from './logger';
import fs from 'fs';
import path from 'path';

export class RestartDebugger {
  private startTime: number;
  private logFile: string;

  constructor() {
    this.startTime = Date.now();
    this.logFile = path.join(process.cwd(), 'restart-debug.log');
    this.initialize();
  }

  private initialize() {
    const timestamp = new Date().toISOString();
    const message = `\n\n========================================
SERVER START: ${timestamp}
PID: ${process.pid}
Node Version: ${process.version}
Platform: ${process.platform}
Working Directory: ${process.cwd()}
Script: ${process.argv[1]}
Environment PORT: ${process.env.PORT}
========================================\n`;

    // Write to debug log
    fs.appendFileSync(this.logFile, message);
    console.log(message);

    // Set up exit handlers
    this.setupExitHandlers();
  }

  private setupExitHandlers() {
    const exitHandler = (code: number, signal?: string) => {
      const uptime = Math.round((Date.now() - this.startTime) / 1000);
      const timestamp = new Date().toISOString();
      const message = `
SERVER EXIT: ${timestamp}
PID: ${process.pid}
Exit Code: ${code}
Signal: ${signal || 'none'}
Uptime: ${uptime} seconds
========================================\n`;

      fs.appendFileSync(this.logFile, message);
      console.log(message);
    };

    process.on('exit', (code) => exitHandler(code));
    process.on('SIGINT', () => exitHandler(0, 'SIGINT'));
    process.on('SIGTERM', () => exitHandler(0, 'SIGTERM'));
    process.on('SIGUSR2', () => exitHandler(0, 'SIGUSR2')); // nodemon restart

    // Log uncaught errors
    process.on('uncaughtException', (error) => {
      const message = `\nUNCAUGHT EXCEPTION: ${new Date().toISOString()}
${error.stack}
========================================\n`;
      fs.appendFileSync(this.logFile, message);
      console.error(message);
    });

    process.on('unhandledRejection', (reason, promise) => {
      const message = `\nUNHANDLED REJECTION: ${new Date().toISOString()}
Reason: ${reason}
Promise: ${promise}
========================================\n`;
      fs.appendFileSync(this.logFile, message);
      console.error(message);
    });
  }

  public log(event: string, details?: any) {
    const timestamp = new Date().toISOString();
    const uptime = Math.round((Date.now() - this.startTime) / 1000);
    const message = `[${timestamp}] [Uptime: ${uptime}s] ${event}${details ? ': ' + JSON.stringify(details) : ''}\n`;
    
    fs.appendFileSync(this.logFile, message);
    logger.info(event, details);
  }
}