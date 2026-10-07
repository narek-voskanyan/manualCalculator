

class Calculator{
    constructor(){
        this.firstField = document.querySelector('.first-number');
        this.secondField = document.querySelector('.second-number');

        this.container = document.querySelector('.operator-buttons');

        this.calculator = document.querySelector('.calculator');
        

        this.calculateButton = document.querySelector('.calculate-button');
        this.resultField = document.querySelector('.result-container output');

        this.removeOperatorCheckbox = document.querySelector('.clear-operator-checkbox');

        this.clearButton = document.querySelector('.clear-button');


        this.addEventListeners()
        this.initListener()
    

    }
        initListener() {
            // Using an arrow function keeps the correct 'this' context automatically
            this.container.addEventListener('click', (event) => this.handleOperatorClick(event));
          }

          addEventListeners(){
            this.calculateButton.addEventListener('click', () => {
                const firstNumberValue = Number(this.firstField.value);
                const secondNumberValue = Number(this.secondField.value);

                //inspect numbers input fields
                if(this.firstField.value === '' || this.secondField.value === ''){
                    this.resultField.classList.add('error-message');
                    this.resultField.value = 'Error: fill numbers fields';
                    return;
                }
                const operator = this.getSelectedOperator();
                this.calculate(firstNumberValue, secondNumberValue, operator);
                this.localStorageSetup()

              
            })

            this.clearButton.addEventListener('click', () => {
                this.firstField.value = '';
                this.secondField.value = '';
                this.resultField.value = '';
                this.resultField.classList.remove('error-message');

                if(this.removeOperatorCheckbox.checked){
                    const allButtons = this.container.querySelectorAll('.operator-option');
                    allButtons.forEach(button => {
                        button.classList.remove('active');
                    });
                }
            })
        }
        


    handleOperatorClick(event) {
            const clickedButton = event.target.closest('.operator-option');
            
            // FIX: Safely ignore clicks on empty space without triggering an error
            if (!clickedButton) return;
          
            const allButtons = this.container.querySelectorAll('.operator-option');
            
            allButtons.forEach(button => {
              const isClicked = (button === clickedButton);
              
              // Update accessibility attribute
              button.setAttribute('aria-pressed', isClicked ? 'true' : 'false');
              
              // Add or remove the visual 'active' class
              if (isClicked) {
                button.classList.add('active');
              } else {
                button.classList.remove('active');
              }
            });
    }
          

    getSelectedOperator() {
        // Look inside the container for the button that has the 'active' class
        const activeButton = this.container.querySelector('.operator-option.active');
        
        // If a button is active, return its data-value ("+", "-", "*", or "/")
        // If no button is selected yet, return null
        return activeButton ? activeButton.dataset.value : null;
    }

    calculate(firstNumberValue, secondNumberValue, operator){
        const chosenOperator = this.getSelectedOperator(); // Using the method from earlier

        // FIX: Trigger the error here ONLY if they haven't chosen an operator yet
        if (!chosenOperator) {
          this.resultField.classList.add('error-message');
          this.resultField.value = 'Error: select an operator';
          return;
        }else{
            this.resultField.classList.remove('error-message');
        }
        const result = eval(firstNumberValue + operator + secondNumberValue)
        this.resultField.value = result;
    }

    localStorageSetup(){
        const calculatorData = JSON.stringify(this.calculator);
        localStorage.setItem('calculators', calculatorData);
    }
    localStorageGet(){
        const calculatorData = JSON.parse(localStorage.getItem('calculators'));
        return calculatorData;
    }

}
    const app = new Calculator();
   
