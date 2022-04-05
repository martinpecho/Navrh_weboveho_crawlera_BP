import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
/** Hlavny komponent pre zobrazenie hlavicky a paty */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  /** udaj, ci je otvorene/zatvorene menu */
  isCollapsed = false;
  /**
   * konstruktor
   * @param router smerovanie adries
   * @param modalService praca s modalnym komponentom
   */
  constructor(private router: Router, private modalService: NgbModal){}
  /** otvorenie/zatvorenie menu */
  toggleNavbar(e: Event) {
    e.stopPropagation();
    this.isCollapsed = !this.isCollapsed;
  }
  /** presmerovanie na spravnu adresu */
  changeRoute(param: string): void{
    this.router.navigate([param]);
  }
  /** listener pre zatvaranie/otvaranie menu */
  @HostListener("document:click") resetToggle() {
    this.isCollapsed = false;
  }
  /** zobrazi sa modalne okno */
  openAbout(){
    this.modalService.open(AboutContent);
  }

}
/** komponent pre zobrazenie modalneho okna casti About */
@Component({
  selector: 'about-content',
  template: `
    <div class="modal-header">
      <h4 class="modal-title blackC">About</h4>
      <button type="button" class="btn-close btn" aria-label="Close" (click)="activeModal.dismiss('X')">X</button>
    </div>
    <div class="modal-body">
      <p class="grayC">This web application is part of the author's bachelor thesis. It allows RSS crawls based on the input term 
      and verifies for the specified URL whether it exists for the given site.</p>
    </div>
  `
})
export class AboutContent {
  /**
   * konstruktor
   * @param activeModal praca s udalostami modalneho komponentu
   */
  constructor(public activeModal: NgbActiveModal) {}
}
