import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AppStateService } from '../../services/app-state.service';
import { Cart } from '../../models/cart.model';




interface Transaction {
    transactionId: string;
    customerId: string;
    productIds: number[];
    totalAmount: string;
    numItems: number;
    paymentMethod: string;
}
declare var QRCode: any;
let isUpdating = false;
@Component({
    selector: 'app-transaction',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink,ReactiveFormsModule, ],
    templateUrl: './transactions.component.html',
    styleUrls: ['./transactions.component.css']
})
export class TransactionComponent implements OnInit {
    paymentForm: FormGroup;
    cardType: string = '';
    loggedInUserId: string | null = null;
    // cart: Cart = { id: 0, userId: '', items: [] };
    selectedPayment: string = '';
    upiId: string = '';
    cardNumber: string = '';
    cardHolderName: string = '';
    expiryMonth: string = '';
    expiryYear: string = '';
    cvv: string = '';
    months: string[] = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    years: string[] = Array.from({ length: 20 }, (_, i) => (new Date().getFullYear() + i).toString());
    totalPrice: number = 0;
    discount: number = 0;
    extraCharges: number = 20; // Fixed GST + Delivery
    orderTotal: number = 0;
    showModal: boolean = false;
    transactionDetails: Transaction = {
        transactionId: '',
        customerId: '',
        productIds: [],
        totalAmount: '',
        numItems: 0,
        paymentMethod: ''
    };
    userUpiId: string = ''; // User's UPI ID input
    accountNumber:string | null='';
    bankName:string='';
    currency: string = 'INR'; // Currency code
    transactionNote: string = 'Payment for services'; // Transaction note
    qrCode: any;
    paymentMethod: string='';
    userDetails:any | null='';
    carts:Cart | null=null;

    ngAfterViewInit() {
        // Initialize QRCode variable
        this.qrCode = null;
    }

    constructor(private http: HttpClient, 
        private router: Router,
        private fb: FormBuilder,
        private appStateService:AppStateService) {
            this.paymentForm = this.fb.group({
               
                cardNumber: ['', [Validators.required, this.luhnValidator]],
                cardHolderName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)]],
                expiryMonth: ['', [Validators.required, Validators.min(1), Validators.max(12)]],
                expiryYear: ['', [Validators.required, this.expiryDateValidator.bind(this)]],
                cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]]
                
            });
            
     }

    ngOnInit() {
        let userDetail = localStorage.getItem('userDetails');
    let token = localStorage.getItem('token');


    if(userDetail && token){
      this.appStateService.setUserDetails(JSON.parse(userDetail))
      this.appStateService.setToken(token)
    }

    this.appStateService.userDetail$.subscribe((userDetails) => {
      this.userDetails = userDetails;
    })


    this.appStateService.cart$.subscribe((carts)=>{
      this.carts=carts;
    })
    if (!this.userDetails?.id) {
      alert('Please log in to view your cart.');
      this.router.navigate(['/login']);
      return;
    }
        
        this.paymentForm.get('expiryMonth')?.valueChanges.subscribe(() => {
            if (!isUpdating) {
                isUpdating = true; // Set the flag to true
                this.paymentForm.get('expiryYear')?.updateValueAndValidity();
                isUpdating = false; // Reset the flag
            }
        });
        
        this.paymentForm.get('expiryYear')?.valueChanges.subscribe(() => {
            if (!isUpdating) {
                isUpdating = true; // Set the flag to true
                this.paymentForm.get('expiryMonth')?.updateValueAndValidity();
                isUpdating = false; // Reset the flag
            }
        });
        // this.paymentForm.get('cardNumber')?.valueChanges.subscribe(value => {
        //    // console.log('Updated Card Number:', value);
        // });
        

        if (!this.userDetails.id) {
            alert('Please log in to proceed with the transaction.');
            this.router.navigate(['/login']);
            return;
        }

        this.loadCart();
    }
    generateQrCode() {
        const upiId = 'garimasaha95@okaxis'; // Fixed UPI ID

        const upiLink = `upi://pay?pa=${upiId}&am=${this.orderTotal.toFixed(2)}&cu=${this.currency}&tn=${this.transactionNote}`;
        
        if (this.qrCode == null) {
          this.qrCode = new QRCode("qr-code", {
            text: upiLink,
            width: 256,
            height: 256,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H,
          });
        } else {
          this.qrCode.makeCode(upiLink);
        }
      }
      
    loadCart() {
        this.http.get<Cart[]>(`http://localhost:3000/cart?userId=${this.userDetails.id}`).subscribe({
            next: (carts) => {
                if (carts.length > 0 && carts[0].items.length > 0) {
                    this.carts = carts[0];
                    this.calculatePricing();
                } else {
                    alert('Cart is empty!');
                    this.router.navigate(['/home']);
                }
            },
            error: (error) => {
                console.error('Error fetching cart:', error);
                alert('Failed to load cart.');
            }
        });
    }

    calculatePricing() {
        this.totalPrice = this.carts!.items.reduce((sum, item) => sum + item.price , 0);
        this.discount = this.totalPrice * 0.10; // 10% discount
        this.orderTotal = this.totalPrice - this.discount + this.extraCharges;
    }

    showDetails(paymentMethod: string) {
        this.selectedPayment = paymentMethod;
        this.paymentMethod = paymentMethod;
    }
    formatCardNumber(event: any) {
        // Remove non-numeric characters
        let input = event.target.value.replace(/\D/g, '');
        
        // Format the input to add spaces every 4 digits for display
        const formattedInput = input.replace(/(\d{4})(?=\d)/g, '$1 '); // Add space after every 4 digits
    
        // Update the form control value without spaces for validation
        this.paymentForm.get('cardNumber')?.setValue(input, { emitEvent: false });
    
        // Update the displayed value in the input field
        event.target.value = formattedInput;
    
        // Detect card type based on the formatted input
        this.detectCardType();
    }
    
    expiryDateValidator(control: AbstractControl) {
        const expYear = parseInt(control.value, 10);
        const expMonth = parseInt(this.paymentForm?.get('expiryMonth')?.value, 10);
    
        if (!expMonth || !expYear) {
            return null;  //  Allow empty values initially
        }
    
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
    
        if (expYear < currentYear) return { invalidExpiry: true };
        if (expYear === currentYear && expMonth < currentMonth) return { invalidExpiry: true };
    
       return null
    }
    

    luhnValidator(control: AbstractControl) {
        const num = control.value; // This will now be the card number without spaces
        console.log(num)
    
        if (!num || !/^\d+$/.test(num)) return { invalidCard: true }; // Ensure it's numeric
    
        let sum = 0;
        let alternate = false;
        const digits = num.split('').reverse().map(Number);
    
        for (let i = 0; i < digits.length; i++) {
            let digit = digits[i];
    
            if (alternate) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
    
            sum += digit;
            alternate = !alternate;
        }
        console.log(sum)
        return sum % 10 === 0 ? null : { invalidCard: true };
    }
    
      submitPayment() {
        this.processTransaction()
    }
    /** Detect card type on input */
  detectCardType() {
    const cardNumber = this.paymentForm.get('cardNumber')?.value;
    this.cardType = this.getCardType(cardNumber);
  }

  /** Determine card type based on number */
  getCardType(cardNumber: string): string {
    if (!cardNumber) return '';
    const firstTwo = cardNumber.substring(0, 2);
    const firstFour = cardNumber.substring(0, 4);
    const firstSix = cardNumber.substring(0, 6);

    if (/^4/.test(cardNumber)) return 'Visa';
    if (/^5[1-5]/.test(cardNumber) || /^2(2[2-9][1-9]|[3-6]\d\d|7[01]\d|720)/.test(firstSix)) return 'MasterCard';
    if (/^3[47]/.test(cardNumber)) return 'American Express';
    if (/^6(011|5)/.test(firstFour) || /^622(12[6-9]|1[3-9]\d|[2-8]\d\d|9[01]\d|92[0-5])/.test(firstSix)) return 'Discover';
    if (/^3(0[0-5]|[68])/.test(firstTwo)) return 'Diners Club';
    if (/^35(2[89]|[3-8]\d)/.test(firstFour)) return 'JCB';

    return 'Unknown';
  }

    processTransaction() {
        if(this.paymentForm?.invalid){
            console.log(this.paymentForm)
            return;
        }
              
        const transactionId = 'TXN' + Math.floor(Math.random() * 1000000);
        this.transactionDetails = {
            transactionId,
            customerId: this.loggedInUserId!,
            productIds: this.carts!.items.map(item => item.id),
            totalAmount: this.orderTotal.toFixed(2),
            numItems: this.carts!.items.length,
            paymentMethod: this.selectedPayment
        };

        // Save transaction to JSON server
        this.http.post('http://localhost:3000/transactions', this.transactionDetails).subscribe({
            next: () => {
                this.showModal = true;
                // Clear cart on server
                this.carts!.items = [];
                this.http.put(`http://localhost:3000/cart/${this.carts!.id}`, this.carts).subscribe();
            },
            error: (error) => console.error('Error saving transaction:', error)
        });
    }

    closeModal() {
        this.showModal = false;
        this.router.navigate(['/cart']);
    }

    logout() {
        localStorage.removeItem('loggedInUserId');
        this.router.navigate(['/home']);
    }
}


