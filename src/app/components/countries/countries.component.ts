import { Component, OnInit } from '@angular/core';
import { CountriesService } from './countries.service';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { ICountry } from '../../core/Models/common/icountry';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { NotifyDialogService } from '../../shared/components/notify-dialog-host/notify-dialog.service';
import { PageEvent } from '@angular/material/paginator'; // Import PageEvent here

@Component({
  selector: 'app-countries',
  templateUrl: './countries.component.html',
  styleUrls: ['./countries.component.css'],
})
export class CountriesComponent implements OnInit {
  countries$: Observable<ICountry[]> = new Observable(); // Observable for the countries list
  filteredCountries$ = new BehaviorSubject<ICountry[]>([]); // Always initialize with an empty array
  pagedCountries$ = new BehaviorSubject<ICountry[]>([]); // replace the current pagedCountries$ declaration

  search = new FormControl('');
  pageIndex: number = 0;
  pageSize: number = 10;
  totalCountriesCount: number = 0;

  // Form for Add or Edit
  countryForm = new FormGroup({
    id: new FormControl(0),
    name: new FormControl('', Validators.required),
    keyCode: new FormControl('', Validators.required),
    iso_2: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(2),
    ]),
  });

  isEditMode = false;

  constructor(
    private service: CountriesService,
    private notify: NotifyDialogService
  ) {}

  ngOnInit() {
    this.loadCountries();

    // Real-time filter on input change
    combineLatest([
      this.countries$,
      this.search.valueChanges.pipe(startWith('')),
    ])
      .pipe(
        map(([countries, search]) =>
          (countries || []).filter((c) =>
            c.name.toLowerCase().includes(search?.toLowerCase() || '')
          )
        )
      )
      .subscribe((filteredCountries) => {
        this.filteredCountries$.next(filteredCountries);
        this.totalCountriesCount = filteredCountries.length; // Update total count after filter
        this.paginateData(filteredCountries); // Apply pagination
      });

    // Watch for ISO code changes to update flag
    this.countryForm.get('iso_2')?.valueChanges.subscribe((value) => {
      // This will trigger the flag update in the template
    });
  }

  // Load countries from service
  loadCountries() {
    this.countries$ = this.service.getCountries().pipe(
      map((countries: ICountry[]) => {
        this.filteredCountries$.next(countries || []); // Update filtered countries
        this.totalCountriesCount = countries.length; // Update total countries count
        this.paginateData(countries); // Apply pagination on first load
        return countries || [];
      })
    );
  }

  // Paginate data based on pageIndex and pageSize
  paginateData(countries: ICountry[]) {
    const startIndex = this.pageIndex * this.pageSize; // Calculate the starting index of the current page
    const pagedData = countries.slice(startIndex, startIndex + this.pageSize); // Slice the data for the current page
    this.pagedCountries$.next(pagedData); // Update the pagedCountries to display in the table
  }

  // Handle page change event from the paginator
  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.paginateData(this.filteredCountries$.getValue()); // Apply pagination after page change
  }

  // Handle search click
  onSearchClick() {
    const searchValue = this.search?.value?.trim().toLowerCase() || '';
    const filtered = this.filteredCountries$
      .getValue()
      .filter((country) => country.name.toLowerCase().includes(searchValue));
    this.filteredCountries$.next(filtered);
    this.totalCountriesCount = filtered.length; // Update total count after search
    this.paginateData(filtered); // Apply pagination after search
  }

  // Add or update a country
  onSaveCountry() {
    if (this.countryForm.valid) {
      const country: ICountry = this.countryForm.value as ICountry;

      if (this.isEditMode) {
        this.service.updateCountry(country).subscribe({
          next: (response) => {
            this.notify.success({
              title: 'تم بنجاح',
              description: 'تم تحديث الدولة بنجاح',
              imageUrl: 'assets/logo_elbatt.png',
              soundUrl: 'assets/sound/duck.mp3',
              autoCloseMs: 2000,
            });
            this.loadCountries(); // Reload the countries list after update
            this.cancelEdit();
          },
          error: (error) => {
            this.notify.error({
              title: 'خطأ',
              description: 'فشل في تحديث الدولة',
              imageUrl: 'assets/logo_elbatt.png',
              soundUrl: 'assets/sound/duck.mp3',
              autoCloseMs: 2000,
            });
            console.error('Update failed:', error);
          },
        });
      } else {
        this.service.addCountry(country).subscribe({
          next: (response) => {
            this.notify.success({
              title: 'تم بنجاح',
              description: 'تم إضافة الدولة بنجاح',
              imageUrl: 'assets/logo_elbatt.png',
              soundUrl: 'assets/sound/duck.mp3',
              autoCloseMs: 2000,
            });
            this.loadCountries(); // Reload the countries list after adding
            this.countryForm.reset({ id: 0 });
          },
          error: (error) => {
            this.notify.error({
              title: 'خطأ',
              description: 'فشل في إضافة الدولة',
              imageUrl: 'assets/logo_elbatt.png',
              soundUrl: 'assets/sound/duck.mp3',
              autoCloseMs: 2000,
            });
            console.error('Add failed:', error);
          },
        });
      }
    } else {
      this.notify.error({
        title: 'خطأ',
        description: 'البيانات المدخلة غير صحيحة',
        imageUrl: 'assets/logo_elbatt.png',
        soundUrl: 'assets/sound/duck.mp3',
        autoCloseMs: 2000,
      });
    }
  }

  // Cancel edit mode
  cancelEdit() {
    this.isEditMode = false;
    this.countryForm.reset({ id: 0 });
  }

  // Handle delete country
  onDeleteCountry(id: number) {
    if (confirm('Are you sure you want to delete this country?')) {
      this.service.deleteCountry(id).subscribe(() => this.loadCountries());
    }
  }

  // Set the form values for editing
  onEditCountry(country: ICountry) {
    this.isEditMode = true;
    this.countryForm.setValue({
      id: country.id || null, // Handle null or undefined for ID
      name: country.name,
      keyCode: country.keyCode || null, // Ensure keyCode is null if it's undefined
      iso_2: country.iso_2 || null, // Ensure iso_2 is null if it's undefined
    });
    this.loadCountries(); // Reload the countries list after update
  }

  // Clear the form values
  clearForm() {
    this.countryForm.reset({ id: 0 });
  }

  // Get flag emoji from ISO code
  getFlagEmoji(isoCode: string): string {
    if (!isoCode || isoCode.length !== 2) return '';

    const codePoints = isoCode
      .toUpperCase()
      .split('')
      .map((char) => 127397 + char.charCodeAt(0));

    return String.fromCodePoint(...codePoints);
  }

  getCurrentFlag(): string {
    const code = this.countryForm.get('iso_2')?.value;
    if (!code) {
      return '';
    }
    return `./assets/images/${code.toLowerCase()}.svg`;
  }
}
