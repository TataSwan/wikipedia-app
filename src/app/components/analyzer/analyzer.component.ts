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
  public message = '';

  constructor(public wiki: WikiService) { }

  ngOnInit() {
  }

  mapRelatives(people) {
    let i = 0;
    this.relatives.forEach((relative) => {
      if (relative.title.length) {
        relative.title = people[i] ? relative.title : '';
        i++;
      }
      relative.status = true;
    });
  }

  onSubmit() {
    const title = this.link.split('/').pop();
    this.mainTitle = title;
    this.wiki.getWikiPage(title).subscribe((data) => {
        if (!data) {
          this.message = 'No relatives in info box';
          return;
        }

        this.relatives = data;
        const obsvArray = [];

        this.relatives.forEach((relative) => {
          if (relative.title.length) {
            obsvArray.push(this.wiki.getWikiPage(relative.title));
          }
        });

        if (!obsvArray.length) {
          this.mapRelatives(this.relatives);
        }

        forkJoin(...obsvArray)
          .subscribe(
          results => {
            results = results.map(result => result ? result.filter(person => person.title === title).length : 0);
            this.mapRelatives(results);
          }
        );
      },
      error => {
        this.link = '';
        this.message = 'Wrong url';
      });
  }

  clearInput() {
    this.link = '';
    this.mainTitle = '';
    this.relatives = [];
    this.message = '';
  }

}
