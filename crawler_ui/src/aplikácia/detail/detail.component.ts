import { Component, OnInit } from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ExcelService } from '../services/excel.service';
import { RssService } from '../services/rss.service';
/** komponent pre zobrazenie detailnych vysledkov */
@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  providers: [RssService, ExcelService]
})
export class DetailComponent implements OnInit {
    /** identifikator podla, ktoreho sa maju zobrazit data */
    task: any;
    /** detailny zaznam o najdenych rss */
    rss: any[] = [];
    /** cas zadania poziadavky */
    timestamp: any;
    /** aktualne zobrazena stranka */
    page: number = 1;
    /**pocet zaznamov na stranke */
    pageSize:number = 5;
    /** sprava, zobrazena v upozorneni */
    message!: string;
    /** typ upozornenia */
    typeMessage: any;
    /**
     * konstruktor
     * @param activatedRoute praca s url adresou
     * @param rssService praca s RSS
     * @param excelService export tabulky do excelu
     * @param spinner praca s nacitavacim komponentom
     */
    constructor(private activatedRoute: ActivatedRoute, private rssService: RssService, private excelService:ExcelService,
        private spinner: NgxSpinnerService){}

    /** inicializacia komponentu, z hashu zobrazenie detailu */
    ngOnInit(): void {
        this.task = this.activatedRoute.snapshot.queryParamMap.get('task')
        if(this.task){
            this.spinner.show();
            this.rssService.getRssFromTask(this.task).subscribe(rss=>{
                this.rss = rss.result?.rss;
                this.timestamp = rss.result?.time;
                this.spinner.hide();
            },error=>{
                console.error(error);
                this.typeMessage = "danger";
                this.message = error?.error;
                this.spinner.hide();
                setInterval(() => {
                    this.message = "";
                },5000);
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
    /** export dat do excelu */
    onExport(){
        this.excelService.exportAsExcelFile(this.rss);
    }
}