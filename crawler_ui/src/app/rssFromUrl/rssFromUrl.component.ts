import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { EmailService } from '../services/email.service';
import { RssService } from '../services/rss.service';
/** komponent pre overovanie, existencie RSS pre konkretnu URL stranku */
@Component({
  selector: 'app-rssFromUrl',
  templateUrl: './rssFromUrl.component.html'
})
export class RssFromUrlComponent {
  /** formular pre pracu s url  */
  urlForm:FormGroup = this.fb.group({
    url: this.fb.control(null)
  });
  /** odkaz na rss subor */
  rss: string = "";
  /** sprava, zobrazena v upozorneni */
  message!: string;
  /** typ upozornenia */
  typeMessage: any;
  /**
   * konstruktor
   * @param rssService  praca s RSS
   * @param fb tvorba formularu
   * @param emailService praca s emailovou adresou
   * @param spinner praca s nacitavacim komponentom
   */
 constructor(private rssService: RssService, private fb: FormBuilder, public emailService: EmailService, private spinner: NgxSpinnerService){}

  /** spracovanie url a nasledne poslanie poziadavky pre overenie existencie RSS */
  getFromUrl(): void{
    let url = this.urlForm.get('url')?.value;
    if (url){
      this.spinner.show();
      if(!url.includes("http://") && !url.includes("https://"))
        url = "https://" + url;
      this.urlForm.reset();
      this.rssService.getRssByUrl(url).subscribe(data=>{
        this.rss = data.url;
        this.spinner.hide();
      }, error=>{
        console.error(error);
        this.typeMessage = "danger";
        this.message = error?.error;
        this.spinner.hide();
        setInterval(() => {
            this.message = "";
        },5000);
      })
    }else{
      this.typeMessage = "info";
      this.message = "No expression.";
      this.spinner.hide();
      setInterval(() => {
          this.message = "";
      },5000);
    }
  }
  /**
   * otvorenie rss suboru v novom linku
   * @param rss url rss suboru
   */
  openRss(rss: string){
    window.open(rss, "_blank");
  }
}