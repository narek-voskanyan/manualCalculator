
window.CalculatorApp = function(options) {
    var self = this;

    /* -------------------- State -------------------- */
    this.initVars = function() {
        this.options = options;
        this.calculators = [];
        this.nextId = 1;
        this.cards = document.querySelector(options.cards);
        this.panel = document.querySelector(options.panel);

        this.firstField = document.querySelector(options.firstField);
        this.secondField = document.querySelector(options.secondField);
        this.container = document.querySelector(options.container);
        this.calculator = document.querySelector(options.calculator);
        this.calculateButton = document.querySelector(options.calculateButton);
        this.resultField = document.querySelector(options.resultField);
        this.removeOperatorCheckbox = document.querySelector('.clear-operator-checkbox');
        this.clearButton = document.querySelector('.clear-button');
    };

    this.findCalculator = function(id) {
        return this.calculators.find(function(item) {
            return item.id === id;
        });
    };

    /* -------------------- Actions -------------------- */
    this.createCalculator = function() {
        // TODO: add a new state object, then render and save.
        // Assign a unique ID using this.nextId.
    };

    this.toggleCalculator = function(id) {
        var state = this.findCalculator(id);
        if (!state) return;

        state.minimized = !state.minimized;
        this.render();
        this.saveCalculators();
    };

    this.removeCalculator = function(id) {
        // TODO: remove the object from the array, update both views and save.
    };

    this.moveCalculator = function() {
        // TODO: choose the arguments and update the array order.
        // Update both views and save the new order.
        // Convert data-attribute IDs to numbers if using numeric state IDs.
    };

    this.getSelectedOperator = function() {
        const activeButton = this.container.querySelector('.operator-option.active');

        return activeButton ? activeButton.dataset.value : null;
    };

    this.calculate = function(firstNumberValue, secondNumberValue, operator) {
        let result;

        if (!operator) {
            result = 'Error: select an operator';
            return result;
        }

        if (secondNumberValue === 0 && operator === '/') {
            result = 'Error: division by zero';
            return result;
        }

        switch(operator) {
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
                break;
        }

        return result;
    };

        /* -------------------- Events -------------------- */
        this.handleOperatorClick = function(event) {
            const clickedButton = event.target.closest('.operator-option');

            if (!clickedButton) return;

            const allButtons = this.container.querySelectorAll('.operator-option');

            allButtons.forEach(button => {
                const isClicked = (button === clickedButton);

                button.setAttribute('aria-pressed', isClicked ? 'true' : 'false');

                if (isClicked) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });
        };

        this.bindEvents = function() {
      /*  document.querySelector('#add').addEventListener('click', function() {
            self.createCalculator();
        });*/

        //Apply only to fill numbers fields to decimal numbers
        this.firstField.addEventListener('input', (event) => {
            this.resultField.value = '';
                event.target.value = event.target.value.replace(/[^0-9.-]/g, '');

            this.localStorigeSetup();
        });

        this.secondField.addEventListener('input', (event) => {
            this.resultField.value = '';
                event.target.value = event.target.value.replace(/[^0-9.-]/g, '');

            this.localStorigeSetup();
        });

        this.container.addEventListener('click', event => {
            this.handleOperatorClick(event);
            this.localStorigeSetup();
        });

        this.calculateButton.addEventListener('click', () => {
            const firstNumberValue = Number(this.firstField.value);
            const secondNumberValue = Number(this.secondField.value);



            // Inspect numbers input fields
            if (this.firstField.value === '' || this.secondField.value === '') {
                this.resultField.classList.add('error-message');
                this.resultField.value = 'Error: fill numbers fields';
                this.localStorigeSetup();
                return;
              
            }

            if (!Number.isFinite(firstNumberValue) || !Number.isFinite(secondNumberValue)) {
                this.resultField.classList.add('error-message');
                this.resultField.value = 'Error: fill correct numbers';
                return; 
            }

            const operator = this.getSelectedOperator();
            const result = this.calculate(firstNumberValue, secondNumberValue, operator);

            this.displayResult(result);
            this.localStorigeSetup();
        });

        this.clearButton.addEventListener('click', () => {
            this.firstField.value = '';
            this.secondField.value = '';
            this.resultField.value = '';
            this.resultField.classList.remove('error-message');

            // Remove active class if checkbox is checked
            if (this.removeOperatorCheckbox.checked) {
                const allButtons = this.container.querySelectorAll('.operator-option');

                allButtons.forEach(button => button.classList.remove('active'));
            }
            this.localStorigeSetup();
        });

        this.removeOperatorCheckbox.addEventListener('change', () => {
            this.localStorigeSetup();
        });

        // TODO: card and panel controls call the same action methods by ID.
        // Input events update state and clear any outdated result.
        };

        this.initDrag = function() {
            // TODO: connect your drag-and-drop component to both views.
            // Choose how it reports the requested reorder to CalculatorApp.
            // Keep drag mechanics separate from calculator data and storage.
        };

        /* -------------------- Rendering -------------------- */
        this.renderCards = function() {
            // TODO: display this.calculators as cards.
            // You can adapt your existing Calculator class for this view.
        };

        this.renderPanel = function() {
            // TODO: display the same array as control panel rows.
        };

        this.render = function() {
            this.renderCards();
            this.renderPanel();
        };

        this.updateCalculatorView = function(id) {
            // TODO: update relevant elements without recreating the focused input.
        };

        this.displayResult = function(result) {
            // Verify the numbers were filled
            if (result === 'Error: fill numbers fields') {
                this.resultField.classList.add('error-message');
                this.resultField.value = result;
                return;
            }

            // Verify the second number is not zero
            if (result === 'Error: division by zero') {
                this.resultField.classList.add('error-message');
                this.resultField.value = result;
                return;
            }

            // Verify the operator was chosen
            if (result === 'Error: select an operator') {
                this.resultField.classList.add('error-message');
                this.resultField.value = result;
                return;
            }

            // Display the result
            this.resultField.classList.remove('error-message');
            this.resultField.value = result;
        };

        /* -------------------- Persistence -------------------- */
        this.saveCalculators = function() {
            // TODO: serialize this.calculators and handle storage errors.
            // Save data, not HTML or references to DOM elements.
        };

        this.loadCalculators = function() {
            // TODO: read, parse and validate saved data.
            // Restore nextId from the highest saved numeric ID.
            // Preserve an intentionally empty list.
        };


    this.localStorigeSetup = function() {
        const calculatorData ={
            firstNumber: this.firstField.value,
            secondNumber: this.secondField.value,
            operator: this.getSelectedOperator(),
            result: this.resultField.value,
            removeOperatorCheckbox: this.removeOperatorCheckbox.checked
        };
        localStorage.setItem('calculatorData', JSON.stringify(calculatorData));
    }

    this.localStorageGet = function() {
        const savedData = localStorage.getItem('calculatorData');
    
        if (!savedData) return;
    
        const data = JSON.parse(savedData);
    
        this.firstField.value = data.firstNumber;
        this.secondField.value = data.secondNumber;
        this.resultField.value = data.result;

        if (typeof data.result === 'string' && data.result.startsWith('Error:')) {
            this.resultField.classList.add('error-message');
        } else {
            this.resultField.classList.remove('error-message');
        }
        this.removeOperatorCheckbox.checked = data.removeOperatorCheckbox;

        const allButtons = this.container.querySelectorAll('.operator-option');

        //return saved operator and set active class
        allButtons.forEach(button => {
            const isSelected = button.dataset.value === data.operator;

            button.classList.toggle('active', isSelected);
            button.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
        });

    };


    /* -------------------- Initialization -------------------- */
    this.init = function() {
        this.initVars();
        this.loadCalculators();
        this.bindEvents();
        this.render();
        this.initDrag();
        this.localStorageGet();
    };







    this.init();
    
};

/* -------------------- Application startup -------------------- */
window.calculatorApp = new window.CalculatorApp({
    cards: '#cards',
    panel: '#panel-list',
    firstField: '.first-number',
    secondField: '.second-number',
    container: '.operator-buttons',
    calculator: '.calculator',
    calculateButton: '.calculate-button',
    resultField: '.result-container output',
    removeOperatorCheckbox: '.clear-operator-checkbox',
    clearButton: '.clear-button'
});
