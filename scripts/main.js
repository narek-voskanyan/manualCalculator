
window.CalculatorApp = function(options) {

    /* -------------------- State -------------------- */
    this.initVars = function() {
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

        this.activePointerId = null;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.isDragging = false;
      
        this.dropTargetId = null;
        this.dropPosition = null;
    };

    this.createDragPreview = function(event, element) {
        const preview = element.cloneNode(true);
        const rect = element.getBoundingClientRect();

        preview.classList.remove('dragging');
    
        preview.classList.add('drag-preview');
    
        preview.style.width = `${rect.width}px`;
        preview.style.height = `${rect.height}px`;

        preview.style.position = 'fixed';
        preview.style.pointerEvents = 'none';
        preview.style.margin = '0';
        preview.style.maxWidth = 'none';
        preview.style.maxHeight = 'none';
        preview.style.minWidth = '0';
        preview.style.flex = 'none';
        preview.style.display = 'block';
    
        this.dragPreview = preview;
    
        this.previewOffsetX = event.clientX - rect.left;
        this.previewOffsetY = event.clientY - rect.top;
    
        document.body.appendChild(preview);
    
        this.moveDragPreview(event.clientX, event.clientY);
    

    };

    this.removeDragPreview = function() {
        if (!this.dragPreview) return;
    
        this.dragPreview.remove();
        this.dragPreview = null;
    };

    this.moveDragPreview = function(x, y) {
        if (!this.dragPreview) return;
    
        this.dragPreview.style.left =
            `${x - this.previewOffsetX}px`;
    
        this.dragPreview.style.top =
            `${y - this.previewOffsetY}px`;
    };

    this.initCustomDragAndDrop = function(field, itemSelector) {

 
        const clearCustomDragState = () => {
            this.removeDragPreview();

            if (this.draggedElement) {
                this.draggedElement.classList.remove('dragging');
            }

            field.querySelectorAll('.drop-before, .drop-after')
                .forEach(item => {
                    item.classList.remove('drop-before', 'drop-after');
                });

            const pointerId = this.activePointerId;

            this.draggedElement = null;
            this.draggedId = null;
            this.activePointerId = null;
            this.isDragging = false;
            this.dropTargetId = null;
            this.dropPosition = null;

            if (
                pointerId !== null &&
                field.hasPointerCapture(pointerId)
            ) {
                field.releasePointerCapture(pointerId);
            }
        };

        // Store this field's cleanup function
        if (!this.dragCleanupFunctions) {
            this.dragCleanupFunctions = new Map();
        }

        this.dragCleanupFunctions.set(field, clearCustomDragState);

        
        field.addEventListener('dragstart', event => {
            event.preventDefault();
        });

        field.addEventListener('pointerdown', event => {
    
            if (this.draggedElement) return;
    
            if (event.pointerType === 'mouse' && event.button !== 0) return;
    
            const handle = event.target.closest(
                '.drag-calculator-button, .control-drag-handle'
            );
    
            if (!handle || !field.contains(handle)) return;
    
            const element = handle.closest(itemSelector);
    
            if (!element || element.parentElement !== field) return;
    
            this.draggedElement = element;
            this.draggedId = element.dataset.id;
            field.setPointerCapture(event.pointerId);
            this.activePointerId = event.pointerId;
            this.dragStartX = event.clientX;
            this.dragStartY = event.clientY;
    
            console.log('CUSTOM DRAG START:', this.draggedId);
    
        });

       
    
        field.addEventListener('pointermove', event => {

            if (!this.draggedElement ||
                event.pointerId !== this.activePointerId) return;

            if (event.pointerType === 'mouse' && !(event.buttons & 1)) return;

            const deltaX = event.clientX - this.dragStartX;
            const deltaY = event.clientY - this.dragStartY;

            const distance = Math.hypot(deltaX, deltaY);

            if (!this.isDragging && distance < 5) return;

            if (!this.isDragging) {
                this.isDragging = true;

                this.createDragPreview(event, this.draggedElement);
                this.draggedElement.classList.add('dragging');
            }

            this.moveDragPreview(event.clientX, event.clientY);

            // Reset the previous drop target
            this.dropTargetId = null;
            this.dropPosition = null;

            // Remove previous dashed indicators
            field.querySelectorAll('.drop-before, .drop-after')
                .forEach(item => {
                    item.classList.remove('drop-before', 'drop-after');
                });

            const target = document
                .elementFromPoint(event.clientX, event.clientY)
                ?.closest(itemSelector);

            const items = field.querySelectorAll(itemSelector);
            const firstItem = items[0];
            const lastItem = items[items.length - 1];

            const tolerance = 30;
            const isCalculatorCard = itemSelector === '.calculator';
            
            // Detect gaps between calculator cards
            if (!target && isCalculatorCard) {
                for (let i = 0; i < items.length - 1; i++) {
                    const currentItem = items[i];
                    const nextItem = items[i + 1];

                    const currentRect = currentItem.getBoundingClientRect();
                    const nextRect = nextItem.getBoundingClientRect();

                    const isInGap =
                        event.clientX >= currentRect.right &&
                        event.clientX <= nextRect.left &&
                        event.clientY >= Math.max(currentRect.top, nextRect.top) &&
                        event.clientY <= Math.min(currentRect.bottom, nextRect.bottom);

                    if (isInGap) {
                        if (nextItem.dataset.id !== this.draggedId) {
                            this.dropTargetId = nextItem.dataset.id;
                            this.dropPosition = 'before';
                        } else if (currentItem.dataset.id !== this.draggedId) {
                            this.dropTargetId = currentItem.dataset.id;
                            this.dropPosition = 'after';
                        }

                        break;
                    }
                }
            }

            // control panel gap detection
            
            // Detect gaps between Control Panel rows
            if (!target && !isCalculatorCard) {
                for (let i = 0; i < items.length - 1; i++) {
                    const currentItem = items[i];
                    const nextItem = items[i + 1];

                    const currentRect = currentItem.getBoundingClientRect();
                    const nextRect = nextItem.getBoundingClientRect();

                    const isInGap =
                        event.clientY >= currentRect.bottom &&
                        event.clientY <= nextRect.top &&
                        event.clientX >= Math.max(currentRect.left, nextRect.left) &&
                        event.clientX <= Math.min(currentRect.right, nextRect.right);

                    if (isInGap) {
                        if (nextItem.dataset.id !== this.draggedId) {
                            this.dropTargetId = nextItem.dataset.id;
                            this.dropPosition = 'before';
                        } else if (currentItem.dataset.id !== this.draggedId) {
                            this.dropTargetId = currentItem.dataset.id;
                            this.dropPosition = 'after';
                        }

                        break;
                    }
                }
            }



            // Drop before the first calculator
            if (!target && firstItem && isCalculatorCard) {
                const rect = firstItem.getBoundingClientRect();

                const isBeforeFirst =
                    event.clientX >= rect.left - tolerance &&
                    event.clientX < rect.left &&
                    event.clientY >= rect.top - tolerance &&
                    event.clientY <= rect.bottom;

                if (isBeforeFirst && firstItem.dataset.id !== this.draggedId) {
                    this.dropTargetId = firstItem.dataset.id;
                    this.dropPosition = 'before';
                }
            }

            // Drop after the last calculator
            if (!target && lastItem && isCalculatorCard && !this.dropTargetId) {
                const rect = lastItem.getBoundingClientRect();

                const isAfterLast =
                    event.clientX > rect.right &&
                    event.clientX <= rect.right + tolerance &&
                    event.clientY >= rect.top - tolerance &&
                    event.clientY <= rect.bottom;

                if (isAfterLast && lastItem.dataset.id !== this.draggedId) {
                    this.dropTargetId = lastItem.dataset.id;
                    this.dropPosition = 'after';
                }
            }
                
            // Drop above the first Control Panel row
            if (!target && firstItem && !isCalculatorCard) {
                const rect = firstItem.getBoundingClientRect();

                const isAboveFirst =
                    event.clientY >= rect.top - tolerance &&
                    event.clientY < rect.top &&
                    event.clientX >= rect.left &&
                    event.clientX <= rect.right;

                if (isAboveFirst && firstItem.dataset.id !== this.draggedId) {
                    this.dropTargetId = firstItem.dataset.id;
                    this.dropPosition = 'before';
                }
            }

            // Drop below the last Control Panel row
            if (!target && lastItem && !isCalculatorCard && !this.dropTargetId) {
                const rect = lastItem.getBoundingClientRect();

                const isBelowLast =
                    event.clientY > rect.bottom &&
                    event.clientY <= rect.bottom + tolerance &&
                    event.clientX >= rect.left &&
                    event.clientX <= rect.right;

                if (isBelowLast && lastItem.dataset.id !== this.draggedId) {
                    this.dropTargetId = lastItem.dataset.id;
                    this.dropPosition = 'after';
                }
            }

            // Detect drop target inside calculator cards or control rows
            if (
                target &&
                target.parentElement === field &&
                target.dataset.id !== this.draggedId
            ) {
                this.dropTargetId = target.dataset.id;

                const rect = target.getBoundingClientRect();

                if (isCalculatorCard) {
                    const middleX = rect.left + rect.width / 2;

                    this.dropPosition =
                        event.clientX < middleX ? 'before' : 'after';
                } else {
                    const middleY = rect.top + rect.height / 2;

                    this.dropPosition =
                        event.clientY < middleY ? 'before' : 'after';
                }
            }

            // Show dashed border on the selected drop target
            if (this.dropTargetId && this.dropPosition) {
                const dropTarget = Array.from(items)
                    .find(item => item.dataset.id === this.dropTargetId);

                if (dropTarget) {
                    dropTarget.classList.add(
                        this.dropPosition === 'before'
                            ? 'drop-before'
                            : 'drop-after'
                    );
                }
            }
        });



        field.addEventListener('pointerup', event => {
            if (!this.draggedElement ||
                event.pointerId !== this.activePointerId) return;
        
            const fromId = this.draggedId;
            const toId = this.dropTargetId;
            const position = this.dropPosition;
        
            const shouldMove =
                this.isDragging &&
                fromId &&
                toId &&
                position;
        
            clearCustomDragState();
        
            if (shouldMove) {
                this.moveCalculator(fromId, toId, position);
            }
        });

        field.addEventListener('pointercancel', event => {

            if (!this.draggedElement ||
                event.pointerId !== this.activePointerId) return;
        
                clearCustomDragState();
        
        });
        
        field.addEventListener('lostpointercapture', event => {

            if (!this.draggedElement ||
                event.pointerId !== this.activePointerId) return;
        
                clearCustomDragState();
        
        });
    
    };

   

    


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

    this.moveCalculator = function(fromId, toId, position = 'before') {

        const fromIndex = this.calculators.findIndex(
            calculator => calculator.id === fromId
        );
    
        const toIndex = this.calculators.findIndex(
            calculator => calculator.id === toId
        );

        if (fromIndex === -1 || toIndex === -1) return;
        if (fromIndex === toIndex) return;

        

        const [movedCalculator] = this.calculators.splice(fromIndex, 1);

        const newTargetIndex = this.calculators.findIndex(
            calculator => calculator.id === toId
        );
        
        const insertIndex =
            position === 'after' ? newTargetIndex + 1 : newTargetIndex;
        
        this.calculators.splice(insertIndex, 0, movedCalculator);

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
        const firstDotIndex = value.indexOf('.');

        if (firstDotIndex !== -1) {
            value =
                value.slice(0, firstDotIndex + 1) +
                value.slice(firstDotIndex + 1).replace(/\./g, '');
        }
    
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
        if (typeof result === 'number' && !Number.isFinite(result)) {
            return 'Error: result is not finite';
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
          


                    calculator.operation = operatorButton.dataset.value;

                    // Clear previous calculation
                    calculator.result = '';
                    calculator.error = '';
                    
                    this.saveCalculators();
                    this.render();
                    
                    const updatedCard = Array.from(
                        this.cards.querySelectorAll('.calculator')
                    ).find(card => card.dataset.id === calculator.id);
                    
                    if (updatedCard) {
                        updatedCard.focus();
                    }
                    
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
                        const updatedCard = Array.from(
                            this.cards.querySelectorAll('.calculator')
                        ).find(card => card.dataset.id === calculator.id);
                        
                        if (updatedCard) {
                            updatedCard.focus();
                        }
                    
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

                    const updatedCard = Array.from(
                        this.cards.querySelectorAll('.calculator')
                    ).find(card => card.dataset.id === calculator.id);

                    if (updatedCard) {
                        updatedCard.focus();
                    }

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

        //keyboard event listeners
       
        this.cards.addEventListener('keydown', event => {
            const card = event.target.closest('.calculator');

            if (!card) return;

            // Enter: Calculate
            if (event.key === 'Enter') {
                event.preventDefault();

                const calculateButton = card.querySelector('.calculate-button');

                if (calculateButton) {
                    calculateButton.click();
                }
            }

            // Operator keyboard shortcuts
            
            const operators = ['+', '-', '*', '/'];

            if (operators.includes(event.key)) {

                // Allow normal typing inside input fields
                if (event.target.matches('input, textarea')) return;

                event.preventDefault();

                const operatorButton = Array.from(
                    card.querySelectorAll('.operator-option')
                ).find(button => button.dataset.value === event.key);

                if (operatorButton) {
                    operatorButton.click();
                }
            }

        });




    };


                
        this.initDrag = function() {
            this.initCustomDragAndDrop(this.cards, '.calculator');
            this.initCustomDragAndDrop(this.panel, '.calculator-control-row');

            document.addEventListener('keydown', event => {
                if (event.key !== 'Escape') return;
                if (!this.draggedElement) return;

                const activeField = this.draggedElement.parentElement;
                const cleanup = this.dragCleanupFunctions.get(activeField);

                if (cleanup) {
                    event.preventDefault();
                    cleanup();
                }
            });
        };

    

        /* -------------------- Rendering -------------------- */
        this.renderCards = function() {

            this.cards.innerHTML = '';
        
            this.calculators.forEach(item => {
        
                const clone = this.calculatorTemplate.content.cloneNode(true);
                const article = clone.querySelector('.calculator');
                article.dataset.id = item.id;
                article.tabIndex = -1;
        
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

                    minimizedResult.textContent = this.formatCalculatorResult(item);

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

        /* -------------------- Persistence -------------------- */
        this.saveCalculators = function() {
            try {
                localStorage.setItem(
                    'calculators',
                    JSON.stringify(this.calculators)
                );
        
                localStorage.setItem(
                    'nextId',
                    String(this.nextId)
                );
            } catch (error) {
                console.error('Cannot save calculators:', error);
            }
        };

      
        this.loadCalculators = function() {
            let savedData;

            try {
                savedData = localStorage.getItem('calculators');
            } catch (error) {
                console.error('Cannot read calculators from localStorage:', error);
                this.calculators = [];
                this.nextId = 1;
                return;
            }

            if (!savedData) {
                this.calculators = [];
                this.nextId = 1;
                return;
            }

            try {
                const parsedData = JSON.parse(savedData);

                const seenIds = new Set();

                this.calculators = Array.isArray(parsedData)
                    ? parsedData.filter(item => {
                        const isValid =
                            item !== null &&
                            typeof item === 'object' &&
                            typeof item.id === 'string' &&
                            /^calc-[1-9]\d*$/.test(item.id) &&
                            Number.isSafeInteger(Number(item.id.slice(5))) &&
                            Number(item.id.slice(5)) < Number.MAX_SAFE_INTEGER &&
                            typeof item.title === 'string' &&
                            typeof item.a === 'string' &&
                            typeof item.b === 'string' &&
                            typeof item.operation === 'string' &&
                            ['', '+', '-', '*', '/'].includes(item.operation) &&

                            // Accept strings and finite numbers
                            (
                                typeof item.result === 'string' ||
                                (
                                    typeof item.result === 'number' &&
                                    Number.isFinite(item.result)
                                )
                            ) &&

                            typeof item.error === 'string' &&
                            typeof item.minimized === 'boolean' &&
                            typeof item.resetOperation === 'boolean';

                        if (!isValid) {
                            return false;
                        }

                        if (seenIds.has(item.id)) {
                            return false;
                        }

                        seenIds.add(item.id);

                        // Normalize numeric results to strings
                        if (typeof item.result === 'number') {
                            item.result = String(item.result);
                        }

                        return true;
                    })
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
            let savedNextId = 1;

            try {
                savedNextId = Number(localStorage.getItem('nextId'));
            } catch (error) {
                console.error('Cannot read nextId from localStorage:', error);
            }

            // Use the larger value to avoid duplicate IDs
            const validSavedNextId =
                Number.isSafeInteger(savedNextId) && savedNextId > 0
                    ? savedNextId
                    : 1;

            this.nextId = Math.max(
                calculatedNextId,
                validSavedNextId
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
