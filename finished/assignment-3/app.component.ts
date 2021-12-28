import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  show = false;
  index = [];

  toggleMessage() {
    this.show = !this.show;
    this.index.push(this.index.length + 1);
  }
}
