import { Component, OnInit, Input } from '@angular/core';
import { WikiService} from '../../services/wiki.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-analyzer',
  templateUrl: './analyzer.component.html',
  styleUrls: ['./analyzer.component.css']
})
export class AnalyzerComponent implements OnInit {

  public link = '';
  public relatives;
  public mainTitle = '';

  constructor(public wiki: WikiService) { }

  ngOnInit() {
  }

  mapRelatives(people) {
    let i = 0;
    this.relatives.forEach((relative) => {
      if (relative.title.length) {
        relative.title = people[i] ? relative.title : '';
        i++;
      }});
  }

  onSubmit() {
    const title = this.link.split('/').pop();
    this.mainTitle = title;
    this.wiki.getWikiPage(title).subscribe((data) => {
        this.relatives = data;
        const obsvArray = [];

        this.relatives.forEach((relative) => {
          if (relative.title.length) {
            obsvArray.push(this.wiki.getWikiPage(relative.title));
          }
        });

        forkJoin(...obsvArray)
          .subscribe(
          results => {
            results = results.map(result => result.filter(person => person.title === title).length);
            this.mapRelatives(results);
          }
        );
      },
      error => {
        this.link = '';
      });
  }

  clearInput() {
    this.link = '';
    this.mainTitle = '';
    this.relatives = [];
  }

}
