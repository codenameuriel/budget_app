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
    },
    budget: 0,
    // -1 to represent non-existent value
    percentage: -1
  };

  let calculateTotal = function(type) {
    let sum = 0;
    data.transactions[type].forEach(transaction => sum += transaction.value);
    data.totals[type] = sum;
  }

  return {
    // testing purposes
    readData: function() {
      console.log(data);
    },
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
    },
    calculateBudget: function() {
      // calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');
      // calculate budget (income - expenses)
      data.budget = data.totals.inc - data.totals.exp;
      // calculate percentage of income spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },
    deleteTransaction: function(type, id) {
      // filter out the transaction object by id
      data.transactions[type] = data.transactions[type].filter(transaction => transaction.id !== id);
    }
  };
})();

let UIController = (function() {
  // allow changes to HTML from a central location
  let DOMElements = {
    selectType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    addBtn: '.add__btn',
    incomeList: '.income__list',
    expensesList: '.expenses__list',
    budgetTotal: '.budget__value',
    incValue: '.budget__income--value',
    expValue: '.budget__expenses--value',
    expPercentage: '.budget__expenses--percentage',
    transactionsContainer: '.container'
  };

  return {
    getInputValues: function() {
      return {
        selectType: document.querySelector(DOMElements.selectType).value,
        inputDescription: document.querySelector(DOMElements.inputDescription).value,
        inputValue: parseFloat(document.querySelector(DOMElements.inputValue).value)
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
    removeTransactionHTML: function(HTMLID) {
      let targetTransactionHTML = document.getElementById(HTMLID);
      targetTransactionHTML.parentNode.removeChild(targetTransactionHTML);
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
    },
    displayBudget: function(budget) {
      document.querySelector(DOMElements.budgetTotal).textContent = budget.budget;
      document.querySelector(DOMElements.incValue).textContent = budget.totalInc;
      document.querySelector(DOMElements.expValue).textContent = budget.totalExp;

      if (budget.percentage > 0) {
        document.querySelector(DOMElements.expPercentage).textContent = budget.percentage + '%';
      } else {
        document.querySelector(DOMElements.expPercentage).textContent = '---';
      }
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

    // parent element for both transaction lists --- Event Delegation
    document.querySelector(DOMElements.transactionsContainer).addEventListener('click', appCtrlDeleteTransaction);
  };
  
  let appCtrlAddTransaction = function() {
    let input, newTransaction;

    // 1. Get input field value
    input = UICtrl.getInputValues();
    console.log(input);

    // transaction will be added unless there is no description and the value field is empty or 0
    if (input.inputDescription !== '' && !isNaN(input.inputValue) && input.inputValue > 0) {
      // 2. Add item to budget controller
      newTransaction = budgetCtrl.addTransaction(input.selectType, input.inputDescription, input.inputValue);
      console.log(newTransaction);
      // 3. Add item to UI
      UICtrl.renderTransactionHTML(newTransaction, input.selectType);
      // 4. Clear input fields
      UICtrl.clearFields();
      // 5. Calculate and update budget
      updateBudget();
    }
  };

  let appCtrlDeleteTransaction = function(event) {
    let transactionElementID, elementIDArr, type, ID;

    // function to locate parent node by attribute and attribute value
    let findParentNode = function(element, attr, name) {
      let parentNode = element.parentNode;
      while(!parentNode[attr].includes(`${name}`)) {
        parentNode = parentNode.parentNode;
      }
      return parentNode;
    }

    transactionElementID = findParentNode(event.target, 'id', 'income').id;
    
    // transactionElementID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (transactionElementID) {
      elementIDArr = transactionElementID.split('-');
      type = elementIDArr[0].slice(0, 3); // select "inc" or "exp"
      ID = parseInt(elementIDArr[1]);

      // delete the transaction from the data structure
      budgetCtrl.deleteTransaction(type, ID);

      // remove the transaction HTML from the DOM
      UICtrl.removeTransactionHTML(transactionElementID);

      // update and render new budget
      updateBudget();
    }
  };

  let updateBudget = function() {
    let budget;

    // 1. calculate the budget
    budgetCtrl.calculateBudget();
    // 2. Return the budget
    budget = budgetCtrl.getBudget();
    // 2. Display the budget
    UICtrl.displayBudget(budget);
  };

  return {
    init: function() {
      let budget = {
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      };

      console.log('App has started.');
      UICtrl.displayBudget(budget);
      setEventListeners();
    }
  };
})(budgetController, UIController);

appController.init();
