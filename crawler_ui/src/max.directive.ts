import { Directive, Input, ElementRef, HostListener } from '@angular/core';
/** direktiva maximum */
@Directive({
  selector: '[maximum]'
})
export class MaxDirective {
  @Input() public max!: number;
  /**
   * konstruktor
   * @param ref manipulacia s HTML
   */
  constructor(private ref: ElementRef) { }
    /** listener pre zachytavanie znakov z klavesnice */
    @HostListener('input', [ '$event' ])
    public onInput(event: InputEvent): void {
        let val = parseInt(this.ref.nativeElement.value);
        if(this.max !== null && this.max !== undefined  && val >= this.max)
            this.ref.nativeElement.value = this.max.toString();
    }
}