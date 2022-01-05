export interface Activity{
  localID: string,
  label: string;
  icon: string;
  color: string;
  startDate?: number;
  tags?: string[]
}