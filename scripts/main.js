
window.CalculatorApp = function(options) {
    var self = this;

    /* -------------------- State -------------------- */
    this.initVars = function() {
        this.options = options;
        this.calculators = [];
        this.nextId = 1;
        this.cards = document.querySelector(options.cards);
        this.panel = document.querySelector(options.panel);

        this.firstField = document.querySelector('.first-number');
        this.secondField = document.querySelector('.second-number');
        this.container = document.querySelector('.operator-buttons');
        this.calculator = document.querySelector('.calculator');
        this.calculateButton = document.querySelector('.calculate-button');
        this.resultField = document.querySelector('.result-container output');
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
        const chosenOperator = this.getSelectedOperator();

        if (!chosenOperator) {
            result = 'Error: select an operator';
            return result;
        }

        if (secondNumberValue === 0 && chosenOperator === '/') {
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

        this.container.addEventListener('click', event => {
            this.handleOperatorClick(event);
        });

        this.calculateButton.addEventListener('click', () => {
            const firstNumberValue = Number(this.firstField.value);
            const secondNumberValue = Number(this.secondField.value);

            // Inspect numbers input fields
            if (this.firstField.value === '' || this.secondField.value === '') {
                this.resultField.classList.add('error-message');
                this.resultField.value = 'Error: fill numbers fields';
                return;
            }

            const operator = this.getSelectedOperator();
            const result = this.calculate(firstNumberValue, secondNumberValue, operator);

            this.displayResult(result);
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

    /* -------------------- Initialization -------------------- */
    this.init = function() {
        this.initVars();
        this.loadCalculators();
        this.bindEvents();
        this.render();
        this.initDrag();
    };

    this.init();
};

/* -------------------- Application startup -------------------- */
window.calculatorApp = new window.CalculatorApp({
    cards: '#cards',
    panel: '#panel-list'
});
