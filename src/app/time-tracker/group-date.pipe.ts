import { Pipe, PipeTransform } from '@angular/core';
import { TimeTrack } from './time-track';

@Pipe({
  name: 'groupDate'
})
export class GroupDatePipe implements PipeTransform {

  transform(itemInput: TimeTrack[]) {
    const items: {date: string, items: TimeTrack[]}[] = [];
    const byDates: any = {};
    itemInput.forEach(item => {
      let dateString = new Date(item.startDate).toISOString().split('T')[0];
    if(!(dateString in byDates)){
      byDates[dateString] = []
      }
      byDates[dateString].push(item);
    });

    for(let date in byDates){
      if(byDates.hasOwnProperty(date)){
        items.push({
          date: date,
          items: byDates[date]
        });
      }
    }
    items.sort(function(a,b){
      if(a.date < b.date){
        return -1;
      }else if(a.date > b.date){
        return 1;
      }else{
        return 0;
      }
    });

    return items;
  }

}
