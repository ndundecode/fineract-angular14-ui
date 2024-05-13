import { Component, OnInit, AfterViewInit } from "@angular/core";
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";

import { ClientsService } from "app/clients/clients.service";
import { SettingsService } from "app/settings/settings.service";
import { Dates } from 'app/core/utils/dates';

@Component({
  selector: "mifosx-bulk-account",
  templateUrl: "./bulk-account.component.html",
  styleUrls: ["./bulk-account.component.scss"],
})
export class BulkAccountComponent implements OnInit, AfterViewInit {
  // DECLARED VARIABLES
  /** bulkLoan form. */
  bulkLoanForm: UntypedFormGroup;
  productData: any;
  loanOfficerData: any;
  fundData:any;
  minDate = new Date(2000, 0, 1);
  maxDate = new Date(2100, 0, 1);
  clientsData: any = [];
  clientChoice = new UntypedFormControl('');
  clientMembers: any[] = [];
  officeData: any;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: UntypedFormBuilder,
    private clientsService: ClientsService,
    private settingsService: SettingsService,
    private dateUtils: Dates,
  ) {
    this.route.data.subscribe((data: {loansAccountTemplate:any }) => {
      console.log(data);
      const loansAccountTemplate = data.loansAccountTemplate;
      this.productData = loansAccountTemplate.productOptions
      this.loanOfficerData = loansAccountTemplate.loanOfficerOptions 
      this.fundData = []
    });
    this.route.data.subscribe( (data: {offices: any} ) => {
      this.officeData = data.offices;
    });
    this.setBulkLoanForm();
  }
  ngOnInit(): void {
    console.log("this is bulk loan accounts");
  }

  setBulkLoanForm(){
    this.bulkLoanForm = this.formBuilder.group({
      'productId': ['', Validators.required],
      'loanOfficerId': [''],
      'fundId': [''],
      'submittedOnDate': [new Date(), Validators.required],
      'expectedDisbursementDate': [new Date(), Validators.required],
      'officeId': ['', Validators.required],
    })
  }

   /**
   * Subscribes to Clients search filter:
   */
   ngAfterViewInit() {
    this.clientChoice.valueChanges.subscribe( (value: string) => {
      if (value.length >= 2) {
        this.clientsService.getFilteredClients('displayName', 'ASC', true, value, this.bulkLoanForm.get('officeId').value)
        .subscribe( (data: any) => {
          this.clientsData = data.pageItems;
        });
      }
    });
  }

  /**
   * Displays Client name in form control input.
   * @param {any} client Client data.
   * @returns {string} Client name if valid otherwise undefined.
   */
  displayClient(client: any): string | undefined {
    return client ? client.displayName : undefined;
  }

  /**
   * Add client.
   */
  addClient() {
    if (!this.clientMembers.includes(this.clientChoice.value)) {
      this.clientMembers.push(this.clientChoice.value);
    }
  }

  /**
   * Remove client.
   * @param index Client's array index.
   */
  removeClient(index: number) {
    this.clientMembers.splice(index, 1);
  }

  submit() {
    const bulkLoanFormData = this.bulkLoanForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const submittedOnDate: Date = this.bulkLoanForm.value.submittedOnDate;
    const expectedDisbursementDate: Date = this.bulkLoanForm.value.expectedDisbursementDate;
    if (bulkLoanFormData.submittedOnDate instanceof Date) {
      bulkLoanFormData.submittedOnDate = this.dateUtils.formatDate(submittedOnDate, dateFormat);
    }
    if (bulkLoanFormData.expectedDisbursementDate instanceof Date) {
      bulkLoanFormData.expectedDisbursementDate = this.dateUtils.formatDate(expectedDisbursementDate, dateFormat);
    }
    const data = {
      ...bulkLoanFormData,
      dateFormat,
      locale
    };

    data.clientMembers = [];
    this.clientMembers.forEach((client: any) => data.clientMembers.push(client.id));
    console.log(data);
    
    // data.clientMembers = [];
    // this.clientMembers.forEach((client: any) => data.clientMembers.push(client.id));
    // this.groupService.createGroup(data).subscribe((response: any) => {
    //   this.router.navigate(['../groups', response.resourceId, 'general']);
    // });
  }
}
