import { PomodoroStatus } from './pomodoro-status';
export interface PomodoroTimerData {
  startDate: number;
  duration: number;
  endDate: number;
  type: PomodoroStatus;
}
