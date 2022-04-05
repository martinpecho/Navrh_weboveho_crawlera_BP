import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { EmailService } from '../services/email.service';
import { RssService } from '../services/rss.service';
/**komponent hlavnej obrazovky, kde sa na zaklade klucoveho slova vyhladaju RSS
 * ak je zadany email, zobrazuje sa aj filter
 */
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  providers: [EmailService, RssService]
})
export class DashboardComponent implements OnInit {
  /**formular pre odoslanie jedneho klucoveho slova */
  keyForm:FormGroup = this.fb.group({
    key: this.fb.control(null)
  });
  /**formular pre ulozenie emailu */
  emailForm:FormGroup = this.fb.group({
    email: this.fb.control(null, Validators.email)
  });
  /** podporovany format emailu */
  emailPattern = "^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$";
  /** overeny uzivatel */
  verifiedUser: any = '';
  /**udaj, ci sa ma zobrazit banner o vylepsenych sluzbach */
  isVerified: boolean = false;
  /**zoznam rss suborov */
  rssList: string[] = [];
  /** zobrazenie vysledku */
  showResult: boolean = false;
  /** zobrazi vyhladavaci panel */
  showMain: boolean = true;
  /**hashovaci kluc */
  hash: string = '';
  /**formular pre poslanie emailu a viacerych klucovych slov */
  proForm: FormGroup = this.fb.group({
    email: this.fb.control(this.emailService.getVerifiedUser()),
    keys: this.fb.array([]),
  });
  /**formular pre filtrovanie */
  filterForm: FormGroup = this.fb.group({
    region: this.fb.control('wt-wt'),
    time: this.fb.control('None'),
    maximum: this.fb.control(10, Validators.required)
  })
  /**udaj, ci sa ma zobrazit formular */
  showForm: boolean = false;
  /**pole klucov */
  keys!: FormArray;
  /** ciselnik regionov */
  regions: any[] = [];
  /** ciselnik casovych intervalov */
  periods: any[] = [];
  /** sprava, zobrazena v upozorneni */
  message!: string;
  /** typ upozornenia */
  typeMessage: any;
  /**
   * konstruktor
   * @param rssService praca s RSS
   * @param fb tvorba formularu
   * @param emailService praca s emailovou adresou
   * @param spinner praca s nacitavacim komponentom
   */
 constructor(private rssService: RssService, private fb: FormBuilder, public emailService: EmailService,
  private spinner: NgxSpinnerService){}
  /**inicializaciaa komponentu
   * naplnanie poli ciselnikmi
   */
  ngOnInit(): void {
    this.keys = this.proForm.get('keys') as FormArray;
    this.verifiedUser = this.emailService.getVerifiedUser();
    if (this.verifiedUser != null){
        this.isVerified = true;
        this.showMain = false;
        this.showForm = true;
        this.addNew();
        this.rssService.getEnum("Regions").subscribe(regions=>{
          this.regions = regions.result;
        }, error=>{
        console.error(error);
        });
        this.rssService.getEnum("Periods").subscribe(periods=>{
          this.periods = periods.result;
        }, error=>{
        console.error(error);
      });
    }
  }
  /** vyhladavanie na zaklade jedneho vyrazu bez filtra */
  searchByKey(): void{
    if (this.keyForm.get('key')?.value){
      this.spinner.show();
      this.rssService.task(this.keyForm.get('key')?.value).subscribe(resp=>{
        this.keyForm.reset();        
        this.hash = resp.hash;
        this.checkRequest();
      }, error=>{
        console.error(error);
        this.spinner.hide();
        this.typeMessage = "danger";
        this.message = error?.message;
        setInterval(() => {
          this.message = "";
        },5000);
      })
    }else {
      this.typeMessage = "info";
        this.message = "No expression.";
        setInterval(() => {
          this.message = "";
        },5000);
    }
  }
  /** vyhladanie pre pouzivatela, ktory zadal email */
  searchByKeys(){
    let value = { ...this.proForm.get("keys")?.value };
    for(let prop in value) {
      if(!value[prop].key) {
        delete value[prop];
      }
    }
    if (Object.keys(value).length === 0){
      return;
    }
    let body = Object.assign(this.filterForm.value, {"keys":value,"email":this.proForm.get("email")?.value});
    this.rssService.tasks(body).subscribe(response=>{
      this.message = response?.message;
      this.typeMessage = "success";

      this.nextPrev();
      this.proForm.get("keys")?.reset();
      this.keys.clear();
      this.addNew();
    },error=>{
      console.error(error);
      this.typeMessage = "danger";
      this.message = error?.message;
      setInterval(() => {
        this.message = "";
      },5000);
    })
  }
  /** volanie, ci uz su hotove vysledky */
  checkRequest(){
    this.rssService.startTimer(this.hash);
    this.rssService.rssList.subscribe((data: any) => {
      this.rssList = data;
      this.showResult = true;
      this.showMain = false;
      this.spinner.hide();
     });

     this.rssService.errorEmitter.subscribe((error:any)=>{
      this.spinner.hide();
     })
  }
  /** spracovanie a nastavenie emailovej adresy */
  submit(){
    let email = this.emailForm.controls.email.value;
    if (this.emailForm.valid && email){
        this.emailService.setUserEmail(email).subscribe(data=>{
          window.location.reload();
        }, error=>{
          console.error(error);
        })
    }
  }

  /**
   * otvorenie rss suboru v novom linku
   * @param rss url rss suboru
   */
  openRss(rss: string){
      window.open(rss, "_blank");
  }
  /** opatovne zobrazenie komponentu pre hladanie RSS */
  newKey(){
    this.showMain = true;
    this.showResult = false;
    this.keyForm.reset();
  }
  /** vkladanie dalsieho klucoveho slova do fomrulara */
  addNew() {
    const keyInput = this.fb.group({
      key: [null]
    });
    if(this.keys.length < 5){
      this.keys.push(keyInput);
    }
  }
  /** odstranenie polozky vo fomrulari */
  deleteGroup(index: number) {
    this.keys.removeAt(index)
  }
  /** prechod medzi obrazovkou filtra a klucovymi vyrazmi */
  nextPrev(){
    this.showForm = !this.showForm;
  }
  /** kontrola, ci je vyplneny aspon jeden vstupny vyraz */
  checkDisable(){
    if(this.proForm.get('keys')?.get('0')?.get('key')?.value)
      return false;
    else
      return true;
  }
}