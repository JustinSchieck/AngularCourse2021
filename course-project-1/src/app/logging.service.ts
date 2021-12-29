import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoggingService {
  lastLog: string;

  pringLog(message: string) {
    // console.log('LastLog: ', this.lastLog);
    // console.log(message);
    this.lastLog = message;
  }
}
