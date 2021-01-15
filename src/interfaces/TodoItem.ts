export interface TodoItem {
  id?: number;
  text: string;
  completed: boolean;
  updating?: boolean;
}