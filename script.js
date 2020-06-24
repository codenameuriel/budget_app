// Budget App

let budgetController = (function() {
  let Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  let Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  let data = {
    transactions: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    }
  };

  return {
    addTransaction: function(type, des, val) {
      let newTransaction, ID;
      
      if (data.transactions[type].length > 0) {
        ID = data.transactions[type][data.transactions[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      if (type === 'exp') {
        newTransaction = new Expense(ID, des, val);
      } else {
        newTransaction = new Income(ID, des, val);
      }

      data.transactions[type].push(newTransaction);
      return newTransaction;
    }
  };
})();

let UIController = (function() {
  let DOMElements = {
    selectType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    addBtn: '.add__btn',
    incomeList: '.income__list',
    expensesList: '.expenses__list'
  };

  return {
    getInputValues: function() {
      return {
        selectType: document.querySelector(DOMElements.selectType).value,
        inputDescription: document.querySelector(DOMElements.inputDescription).value,
        inputValue: document.querySelector(DOMElements.inputValue).value
      };
    },
    getDOMElements: function() {
      return DOMElements;
    },
    renderTransactionHTML: function(transaction, type) {
      let transactionHTML, element;

      if (type === 'inc') {
        element = DOMElements.incomeList;
        transactionHTML = `
          <div class="item clearfix" id="income-${transaction.id}">
            <div class="item__description">${transaction.description}</div>
            <div class="right clearfix">
              <div class="item__value">+ ${transaction.value}</div>
              <div class="item__delete">
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
              </div>
            </div>
          </div>
        `
      } else if (type === 'exp') {
        element = DOMElements.expensesList;
        transactionHTML = `
          <div class="item clearfix" id="expense-${transaction.id}">
            <div class="item__description">${transaction.description}</div>
            <div class="right clearfix">
              <div class="item__value">- ${transaction.value}</div>
              <div class="item__percentage">21%</div>
              <div class="item__delete">
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
              </div>
            </div>
          </div>
        `
      }
      document.querySelector(element).insertAdjacentHTML('beforeend', transactionHTML)
    },
    clearFields: function() {
      let fields;
      // let fieldArr;

      // returns a LIST (not an ARRAY)
      fields = document.querySelectorAll(`${DOMElements.inputValue}, ${DOMElements.inputDescription}`);

      // // 'call' method will allow the LIST object to method borrow 'slice' and immediately invoke the slice method on it creating an ARRAY copy
      // fieldsArr = Array.prototype.slice.call(fields);

      // // clear all fields
      // fieldsArr.forEach(function(field) {
      //   field.value = '';
      // });

      // Create an Array copy and then pass callback that will clear field values
      Array.from(fields, field => field.value = '');
      Array.from(fields)[0].focus();
    }
  };
})();

let appController = (function(budgetCtrl, UICtrl) {
  let setEventListeners = function() {
    let DOMElements = UICtrl.getDOMElements();

    document.querySelector(DOMElements.addBtn).addEventListener('click', appCtrlAddTransaction);

    // event listener for key press which occurs globally and not on a particular element
    document.addEventListener('keypress', function(event) {
      if (event.keyCode === 13) appCtrlAddTransaction(); 
    });
  };
  
  let appCtrlAddTransaction = function() {
    let input, newTransaction;

    // 1. Get input field value
    input = UICtrl.getInputValues();
    console.log(input);
    // 2. Add item to budget controller
    newTransaction = budgetCtrl.addTransaction(input.selectType, input.inputDescription, input.inputValue);
    console.log(newTransaction);
    // 3. Add item to UI
    UICtrl.renderTransactionHTML(newTransaction, input.selectType);
    // 4. Clear input fields
    UICtrl.clearFields();
    // 5. calculate the budget
    // 6. Display the budget
  };

  return {
    init: function() {
      console.log('App has started.');
      setEventListeners();
    }
  };
})(budgetController, UIController);

appController.init();
