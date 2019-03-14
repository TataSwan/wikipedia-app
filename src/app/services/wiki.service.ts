import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
// import {wtf_wikipedia} from 'wtf_wikipedia';

@Injectable({
  providedIn: 'root'
})
export class WikiService {
  public url = 'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=revisions&rvprop=content&rvsection=0&origin=*&redirects&rvparse&titles=';

  constructor(public httpClient: HttpClient) { }

  private getTitle(person) {
    return person.innerHTML.search('href') >= 0 ? person.querySelector('a').href.split('/').pop()
      : person.href ? person.href.split('/').pop() : '';
  }

  private addRelativesFromBlock(node, relativeType, relatives) {
    const  parent = node.parentElement;
    const  li = parent.querySelectorAll('li');
    const  div = parent.querySelectorAll('div');
    const  a = parent.querySelectorAll('a');
    const  people = li.length ? li : div.length ? div : a;

    [].forEach.call(people, (person) => {
      if (person.querySelector('div')) {
        person = person.querySelector('div');
      }
      relatives.push({
        type: relativeType,
        name: person.innerText,
        title: this.getTitle(person)
      });
    });

    return relatives;
  }

  private getRelatives(res) {
    const keys = Object.keys(res.query.pages);
    const content = res.query.pages[keys[0]].revisions[0]['*'];
    const el = document.createElement( 'body' );
    el.innerHTML = content;
    let relatives = [];

    const infobox = el.querySelectorAll('.infobox tr th');
    [].forEach.call(infobox, (th) => {

      if (th.innerHTML.search('Spouse') >= 0) {
        relatives = this.addRelativesFromBlock(th, 'Spouse', relatives);
      }

      if (th.innerHTML.search('Children') >= 0) {
        relatives = this.addRelativesFromBlock(th, 'Child', relatives);
      }

      if (th.innerHTML.search('Parent') >= 0) {
        relatives = this.addRelativesFromBlock(th, 'Parent', relatives);
      }

      if (th.innerHTML.search('Relatives') >= 0) {
        relatives = this.addRelativesFromBlock(th, 'Relatives', relatives);
      }

    });

    return relatives;
  }

  getWikiPage(link) {
    return this.httpClient.get(`${this.url}${link}`)
      .pipe(
        map((res: any) => {
          return this.getRelatives(res);
        })
      );

  }
}
