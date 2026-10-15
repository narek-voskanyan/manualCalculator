
window.CalculatorApp = function(options) {

    /* -------------------- State -------------------- */
    this.initVars = function() {
        this.options = options;
        this.cards = document.querySelector(options.cards);
        this.panel = document.querySelector(options.panel);

        this.panelContainer = this.panel.closest('.control-panel');


        this.calculatorTemplate = document.querySelector('#calculator-template');
        this.controlRowTemplate = document.querySelector('#control-row-template');

        this.calculators = [];
        this.nextId = 1;

        // Drag-and-drop state
        this.draggedElement = null;
        this.draggedId = null;
    };

    this.initDragAndDrop = function(field, itemSelector) {
        field.addEventListener('dragstart', event => {
            if (!event.target.matches(
                '.drag-calculator-button, .control-drag-handle'
            )) return;
        
            const element = event.target.closest(itemSelector);
            if (!element) return;
            this.draggedElement = element;
            this.draggedId = element.dataset.id;
        
        
        });

        field.addEventListener('dragover', event => {
            event.preventDefault();
            
        });

        field.addEventListener('drop', event => {
            event.preventDefault();
        
            const targetElement = event.target.closest(itemSelector);
            if (!targetElement || !this.draggedElement) return;
            if (targetElement === this.draggedElement) return;
        
            this.moveCalculator( this.draggedId, targetElement.dataset.id );
        
        });

        field.addEventListener('dragend', event => {

            this.draggedElement = null;
            this.draggedId = null;
        });

    }


    this.findCalculator = function(id) {
        return this.calculators.find(function(item) {
            return item.id === id;
        });
    };

    /* -------------------- Actions -------------------- */
    this.createCalculator = function() {
       var calculator = {
        id: 'calc-' + this.nextId,
        title: 'Calculator ' + this.nextId,
        a: '',
        b: '',
        operation: '',
        result: '',
        error: '',
        minimized: false,
        resetOperation: false
    };

    this.calculators.push(calculator);
    this.nextId++;

    this.saveCalculators();

    return calculator;
};

    this.toggleCalculator = function(id) {
        var state = this.findCalculator(id);
        if (!state) return;

        state.minimized = !state.minimized;
    };

    this.removeCalculator = function(id) {
        this.calculators = this.calculators.filter(
            item => item.id !== id
        );
        if (this.calculators.length === 0) {
            this.nextId = 1;
        }
    };

    this.moveCalculator = function(fromId, toId) {

        const fromIndex = this.calculators.findIndex(
            calculator => calculator.id === fromId
        );
    
        const toIndex = this.calculators.findIndex(
            calculator => calculator.id === toId
        );

        if (fromIndex === -1 || toIndex === -1) return;
        if (fromIndex === toIndex) return;

        const [movedCalculator] = this.calculators.splice(fromIndex, 1);

        this.calculators.splice(toIndex, 0, movedCalculator);

        this.saveCalculators();
        this.render();

    };

    this.formatCalculatorResult = function(item) {
        const operator = item.operation === '*'
            ? '×'
            : item.operation === '/'
                ? '÷'
                : item.operation;
    
        const isError = typeof item.result === 'string'
            && item.result.startsWith('Error:');
    
        if (isError) {
            return item.result;
        }
    
        if (item.result === '') {
            return '—';
        }
    
        return `${item.a} ${operator} ${item.b} = ${item.result}`;
    };

    this.sanitizeNumber = function(value) {
        value = value.replace(/[^0-9.-]/g, '');
    
        // Allow only one decimal point
        value = value.replace(/(\..*)\./g, '$1');
    
        // Allow minus only at the beginning
        value = value.replace(/(?!^)-/g, '');
    
        return value;
    };

    this.validateNumbers = function(a, b) {
        if (a === '' || b === '') {
            return 'Error: fill numbers fields';
        }
    
        const firstNumber = Number(a);
        const secondNumber = Number(b);
    
        if (!Number.isFinite(firstNumber) || !Number.isFinite(secondNumber)) {
            return 'Error: fill correct numbers';
        }
    
        return null;
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

    this.collapseAllCalculators = function() {
        this.calculators.forEach(item => {
            item.minimized = true;
        });
            
    };
    
    this.expandAllCalculators = function() {
        this.calculators.forEach(item => {
            item.minimized = false;
        });
    };

    this.bindEvents = function() {
        this.panelContainer.addEventListener('click', event => {
            const ColapsButton = event.target.closest('.collapse-all-button');
            if (ColapsButton) {
                this.collapseAllCalculators();
                this.saveCalculators();
                this.render();
                return;
            }
            const ExtendButton = event.target.closest('.expand-all-button');
            if (ExtendButton) {
                this.expandAllCalculators();
                this.saveCalculators();
                this.render();
                return;
            }

            const removeButton = event.target.closest('.control-remove-button');

            if (removeButton) {
                const row = removeButton.closest('.calculator-control-row');
                if (!row) return;
            
                const id = row.dataset.id;
            
                this.removeCalculator(id);
                this.saveCalculators();
                this.render();
            
                return;
            }

            const minimizeButton = event.target.closest('.control-minimize-button');

            if (minimizeButton) {
                const row = minimizeButton.closest('.calculator-control-row');
                if (!row) return;
            
                const id = row.dataset.id;
            
                this.toggleCalculator(id);
                this.saveCalculators();
                this.render();
            
                return;
            }
        });
            
        this.cards.addEventListener('click', event => {

                //Operator button event
                const operatorButton = event.target.closest('.operator-option');
                if (operatorButton) {
                    const operatorArticle = operatorButton.closest('.calculator');
                
                    if (!operatorArticle) return;
     
                
                    const calculator = this.findCalculator(operatorArticle.dataset.id);
                
                    if (!calculator) return;
                
                    calculator.operation = operatorButton.dataset.value;
          

                    // Clear previous calculation
                    calculator.result = '';
                    calculator.error = '';

                    this.saveCalculators();
                    this.render();
                    return;
                }

                //Minimize button event
                const minimizeButton = event.target.closest(
                    '.minimize-calculator-button'
                );
                if (minimizeButton) {
                    const article = minimizeButton.closest('.calculator');
                    if (!article) return;
                    const id = article.dataset.id;
                    this.toggleCalculator(id);
                    this.saveCalculators();
                    this.render();
                    return;
                }

                //Calculate button event
                const calculateButton = event.target.closest('.calculate-button');
                if (calculateButton) {
                    const article = calculateButton.closest('.calculator');
                
                    if (!article) return;
                
                    const calculator = this.findCalculator(article.dataset.id);
                
                    if (!calculator) return;

                    const validationError = this.validateNumbers(
                        calculator.a,
                        calculator.b
                    );
                    
                    if (validationError) {
                        calculator.result = validationError;
                    
                        this.saveCalculators();
                        this.render();
                    
                        return;
                    }
                
                    const firstNumber = Number(calculator.a);
                    const secondNumber = Number(calculator.b);
                    const result = this.calculate(
                        firstNumber,
                        secondNumber,
                        calculator.operation
                    );
                    calculator.result = result;

                    this.saveCalculators();
                    this.render();
                
                    return;
                }
            //Clear button event        
            const clearButton = event.target.closest('.clear-button');

            if (clearButton) {
                const article = clearButton.closest('.calculator');
                if (!article) return;

                const calculator = this.findCalculator(article.dataset.id);
                if (!calculator) return;

                calculator.a = '';
                calculator.b = '';
                calculator.result = '';
                calculator.error = '';

                if (calculator.resetOperation) {
                    calculator.operation = '';
                }

                this.saveCalculators();
                this.render();

                return;
            }

            //remove calculator button event
            const removeCalculatorButton = event.target.closest('.remove-calculator-button');
            if (removeCalculatorButton) {
                const article = removeCalculatorButton.closest('.calculator');
                if (!article) return;
                const id = article.dataset.id;
                this.removeCalculator(id);
                this.saveCalculators();
                this.render();
                return;
            }

        });

        const addCalculatorButton = document.querySelector('.add-calculator-button');
        if (addCalculatorButton) {
            addCalculatorButton.addEventListener('click', () => {
                this.createCalculator();
                this.render();
            });
        }

        this.cards.addEventListener('input', event => {
                    const input = event.target;


                
                    if (!input.matches('.first-number, .second-number')) {
                        return;
                    }
                    const article = input.closest('.calculator');
                    if (!article) return;

                    const cleanValue = this.sanitizeNumber(input.value);
                    input.value = cleanValue;

                    const calculator = this.findCalculator(article.dataset.id);
                
                    if (!calculator) return;
                    if (input.matches('.first-number')) {
                        calculator.a = cleanValue
                    }
                    if (input.matches('.second-number')) {
                        calculator.b = cleanValue;
                    }
                    calculator.result = '';
                    calculator.error = '';

                  


                    const resultField = article.querySelector('.result');
                    resultField.textContent = '—';
                    resultField.classList.remove('error-message');
                
                    this.saveCalculators();
                    this.renderPanel();
                
        });

        this.cards.addEventListener('change', event => {
                    const checkbox = event.target.closest('.clear-operator-checkbox');
                
                    if (!checkbox) return;
                
                    const article = checkbox.closest('.calculator');
                    if (!article) return;
                
                    const calculator = this.findCalculator(article.dataset.id);
                    if (!calculator) return;
                
                    calculator.resetOperation = checkbox.checked;
                
                    this.saveCalculators();
        });

        this.panel.addEventListener('input', event => {
            const input = event.target;
        
            if (!input.matches('.control-calculator-title')) {
                return;
            }
        
            const row = input.closest('.calculator-control-row');
            if (!row) return;
        
            const calculator = this.findCalculator(row.dataset.id);
            if (!calculator) return;
        
            calculator.title = input.value;
        
            this.saveCalculators();
            this.renderCards();
        });



    };

        this.initDrag = function() {
            this.initDragAndDrop(this.cards, '.calculator');
            this.initDragAndDrop(this.panel, '.calculator-control-row');
        };

        /* -------------------- Rendering -------------------- */
        this.renderCards = function() {

            this.cards.innerHTML = '';
        
            this.calculators.forEach(item => {
        
                const clone = this.calculatorTemplate.content.cloneNode(true);
                const article = clone.querySelector('.calculator');
                article.dataset.id = item.id;
        
                const title = article.querySelector('.calculator-window-title');
                title.textContent = item.title;
                const firstInput = article.querySelector('.first-number');
                const secondInput = article.querySelector('.second-number');

                firstInput.value = item.a;
                secondInput.value = item.b;
                
                const operatorButtons = article.querySelectorAll('.operator-option');

                operatorButtons.forEach(button => {
                    const isSelected = button.dataset.value === item.operation;

                    button.classList.toggle('active', isSelected);
                    button.setAttribute('aria-pressed', String(isSelected));
                });
                const resultField = article.querySelector('.result');

                resultField.textContent = item.result !== ''
                    ? item.result
                    : '—';
                    resultField.classList.toggle(
                        'error-message',
                        typeof item.result === 'string' &&
                        item.result.startsWith('Error:')
                    );

                    const resetCheckbox = article.querySelector('.clear-operator-checkbox');

                    resetCheckbox.checked = item.resetOperation;

                    const fullContent = article.querySelector('.calculator-content');
                    const minimizedContent = article.querySelector('.calculator-minimized-content');
                    const minimizedResult = article.querySelector('.calculator-minimized-result');
                    const minimizeButton = article.querySelector('.minimize-calculator-button');

                    fullContent.hidden = item.minimized;
                    minimizedContent.hidden = !item.minimized;

                    this.formatCalculatorResult(item);

                    minimizeButton.textContent = item.minimized ? '+' : '−';
                    minimizeButton.setAttribute(
                        'aria-label',
                        item.minimized ? 'Expand calculator' : 'Minimize calculator'
);

                this.cards.appendChild(clone);
        
            });
        
        };

        this.renderPanel = function() {
            this.panel.innerHTML = '';
        
            if (this.calculators.length === 0) {
                const emptyMessage = document.createElement('p');
                emptyMessage.classList.add('control-panel-empty');
                emptyMessage.textContent = 'The list is empty.';
        
                this.panel.appendChild(emptyMessage);
                return;
            }
        
            this.calculators.forEach(item => {
                const rowClone = this.controlRowTemplate.content.cloneNode(true);
                const row = rowClone.querySelector('.calculator-control-row');
                const title = row.querySelector('.control-calculator-title');
                const value = row.querySelector('.control-calculator-result');
        
                row.dataset.id = item.id;
                title.value = item.title;
        
                const minimizeButton = row.querySelector('.control-minimize-button');
                minimizeButton.textContent = item.minimized ? 'Open' : 'Close';
        
               
                value.textContent = this.formatCalculatorResult(item);
        
                this.panel.appendChild(rowClone);
            });
        };

        this.render = function() {
            this.renderCards();
            this.renderPanel();
        };

        this.updateCalculatorView = function(id) {
            // TODO: update relevant elements without recreating the focused input.
        };


        /* -------------------- Persistence -------------------- */
        this.saveCalculators = function() {
            localStorage.setItem(
                'calculators',
                JSON.stringify(this.calculators)
            );
            localStorage.setItem(
                'nextId',
                String(this.nextId)
            );
        };

        this.loadCalculators = function() {
            const savedData = localStorage.getItem('calculators');
        
            if (!savedData) {
                this.calculators = [];
                this.nextId = 1;
                return;
            }
        
            try {
                const parsedData = JSON.parse(savedData);
        
                this.calculators = Array.isArray(parsedData)
                    ? parsedData
                    : [];
            } catch (error) {
                console.error('Cannot load calculators:', error);
                this.calculators = [];
            }
        
            // If there are no calculators, start from 1
            if (this.calculators.length === 0) {
                this.nextId = 1;
                return;
            }
        
            // Calculate nextId from existing calculator IDs
            const ids = this.calculators.map(item => {
                return Number(item.id.replace('calc-', ''));
            });
        
            const calculatedNextId = Math.max(0, ...ids) + 1;
        
            // Read nextId from localStorage
            const savedNextId = Number(localStorage.getItem('nextId'));
        
            // Use the larger value to avoid duplicate IDs
            this.nextId = Math.max(
                calculatedNextId,
                savedNextId || 1
            );
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
    cards: '.calculator-list',
    panel: '.calculator-control-list'
});
