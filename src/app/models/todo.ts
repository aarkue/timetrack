export interface Todo {
  _id: string;
  name: string;
  description: string;
  _listid: string;
  isDone: boolean;
  deadline: Date;
  estimatedDuration: Number;
  priority: number;
}
