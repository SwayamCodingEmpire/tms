import { Component, ElementRef, HostListener, Input } from '@angular/core';

@Component({
  selector: 'app-custom-tooltip',
  standalone: false,
  templateUrl: './custom-tooltip.component.html',
  styleUrl: './custom-tooltip.component.scss'
})
export class CustomTooltipComponent {
  @Input() text = '';
  @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'top';
  show = false;
  tooltipX = 0;
  tooltipY = 0;

  constructor(private el: ElementRef) {}

  @HostListener('mouseenter') onMouseEnter() {
    const rect = this.el.nativeElement.getBoundingClientRect();
    console.log('text', this.text);
    this.tooltipX = rect.left + rect.width / 2;
    this.tooltipY =
      this.position === 'top'
        ? rect.top - 10
        : this.position === 'bottom'
        ? rect.bottom + 10
        : rect.top;

    this.show = true;
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.show = false;
  }
}
