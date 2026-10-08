

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
               const result = this.calculate(firstNumberValue, secondNumberValue, operator);
               this.displayResult(result);

              
            })

            this.clearButton.addEventListener('click', () => {
                this.firstField.value = '';
                this.secondField.value = '';
                this.resultField.value = '';
                this.resultField.classList.remove('error-message');

                //remove the active class from all buttons if the remove operator checkbox is checked
                if(this.removeOperatorCheckbox.checked){
                const allButtons = this.container.querySelectorAll('.operator-option');
                allButtons.forEach(button =>  button.classList.remove('active'));  
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
        let result;
        const chosenOperator = this.getSelectedOperator(); // Using the method from earlier

        // FIX: Trigger the error here ONLY if they haven't chosen an operator yet
        if (!chosenOperator) {
        //  this.resultField.classList.add('error-message');
          result = 'Error: select an operator';
          return result;
        }
        if(secondNumberValue === 0 && chosenOperator === '/'){
            result = 'Error: division by zero';
            return result;
        }
        
         switch(operator){
            case '+':
                result = firstNumberValue + secondNumberValue;
                break;
            case '*':
                result = firstNumberValue * secondNumberValue;
                break;
            case '/':
                result = firstNumberValue / secondNumberValue;
                break;
            case '-':
                result = firstNumberValue - secondNumberValue;
                break;
            default:
                result = 'Error: select an operator';
                break ;
        }
        return result;
    }
    //This function takes the result of the calculation and displays it in the result field
    //It also verifies if the result is an error and displays the error message and sets the error class to the result field
    displayResult(result){
        //verify the numbers were filled
        if(result === 'Error: fill numbers fields'){
            this.resultField.classList.add('error-message');
            this.resultField.value = result;
            return;
        }

        //verify the second number is not zero
        if(result === 'Error: division by zero'){
            this.resultField.classList.add('error-message');
            this.resultField.value = result;
            return;
        }
       
        
        //verify the operator was chosen
        if(result === 'Error: select an operator'){
            this.resultField.classList.add('error-message');
            this.resultField.value = result;
            return;
        }
        //display the result
        this.resultField.classList.remove('error-message');
        this.resultField.value = result;

    }

}
    const app = new Calculator();
   
