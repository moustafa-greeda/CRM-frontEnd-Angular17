import { Component, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-search-input',
  template: `
    <div class="search-input-container">
      <input
        type="text"
        class="search-input"
        [placeholder]="placeholder"
        [(ngModel)]="searchTerm"
        (keyup.enter)="onSearch()"
      />
      <button class="search-button" (click)="onSearch()">
        <i class="bi bi-search"></i>
        بحث
      </button>
    </div>
  `,
  styles: `
    .search-input-container {
      width:500px;
      position: relative;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .search-icon {
      position: absolute;
      left: 16px;
      color: #888888;
      z-index: 1;
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      background: rgba(17, 24, 31, 0.9);
      color: #ffffff;
      border: 1px solid #2D8091;
      border-radius: 8px;
      padding: 12px 16px 12px 50px;
      font-size: 14px;
    }

    .search-input:focus {
      outline: none;
      border-color: #46e3ff;
    }

    .search-input::placeholder {
      color: #888888;
    }

    .search-button {
      background: linear-gradient(90deg, #2D8091 0%, #0D262B 100%);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 12px 24px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
    }

    .search-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(70, 227, 255, 0.4);
    }

    .search-button:active {
      transform: translateY(0);
    }

    .search-button i {
      font-size: 16px;
    }
    @media (max-width: 1024px) {
      .search-input-container {
        width: 100%;
      }
    }
  `,
})
export class SearchInputComponent {
  @Input() placeholder: string = ' ..... ابحث عن العملاء';

  searchTerm: string = '';

  @Output() search = new EventEmitter<string>();

  onSearch() {
    this.search.emit(this.searchTerm);
  }
}
