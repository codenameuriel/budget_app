// Budget App

// budget module
const budgetController = (function() {
  // private functions and variables

  // Expense object constructor function
  const Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    // percentage that expense transaction represents of the total income
    // initially set to non-existent value
    this.percentage = -1;
  };

  // setter method for Expense object
  Expense.prototype.calculatePercentage = function(totalIncome) {
    // want to avoid special numbers like Infinity by dividing by 0 value total income
    if (totalIncome > 0) {
      //this.percentage = Math.round((this.value / totalIncome) * 100);
      let percentage = ((this.value / totalIncome) * 100).toFixed(1);
      this.percentage = parseFloat(percentage);
    } else {
      this.percentage = -1;
    }
  };

  // getter method for Expense object
  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  // Income object constructor function
  const Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  // centralized data structure to hold Expense/Income objects and values
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
    percentage: -1
  };

  // function calculates/sets the total for Expense/Income transaction objects
  const calculateTotal = function(type) {
    let sum = 0;
    data.transactions[type].forEach(transaction => sum += transaction.value);
    data.totals[type] = sum;
  }

  // public methods
  return {
    // testing purposes
    readData: function() {
      console.log(data);
    },
    // creates an Expense/Income object with unique ID and returns the created transaction object
    addTransaction: function(type, des, val) {
      let newTransaction, ID;

      // if transactions already exist, then will create ID based on their ID values
      if (data.transactions[type].length > 0) {
        // assign new ID to last transaction object's ID + 1 for the new transaction object
        ID = data.transactions[type][data.transactions[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // will create transaction object based on the type of transaction
      if (type === 'exp') {
        newTransaction = new Expense(ID, des, val);
      } else {
        newTransaction = new Income(ID, des, val);
      }

      // adding the new transaction object to the data structure to store it
      data.transactions[type].push(newTransaction);

      return newTransaction;
    },
    calculateBudget: function() {
      // calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');

      // calculate budget (total income - total expenses)
      data.budget = data.totals.inc - data.totals.exp;

      // calculate total percentage of income spent
      // conditional avoids dividing by 0
      if (data.totals.inc > 0) {
        let percentage = ((data.totals.exp / data.totals.inc) * 100).toFixed(1);
        data.percentage = parseFloat(percentage);
      } else {
        data.percentage = -1;
      }
    },
    calculateAllPercentages: function() {
      // calculates percentage of total income spent by each Expense object
      data.transactions.exp.forEach(transaction =>
        // sets the percentage property for each Expense object using the total income value
        transaction.calculatePercentage(data.totals.inc)
      );
    },
    getAllPercentages: function() {
      // gets percentage values from each Expense object
      return data.transactions.exp.map(transaction => transaction.getPercentage());
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

// user interface module
const UIController = (function() {
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
    globalExpPercentage: '.budget__expenses--percentage',
    transactionsContainer: '.container',
    expPercentage: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  // formats integer to follow (+/- x,xxx.xx) structure
  const formatNumber = function(num, type) {
    let numSplit, numArr, numString, decimal, sign;

    // get absolute value of the number
    //num = Math.abs(num);

    // redefine parameter to equal the value passed in and converted to a string with decimal
    // convert number to a string with two decimals appended (5 -> '5.00')
    num = num.toFixed(2);

    // split the number string by the decimal point
    numSplit = num.split('.');
    // the original number is the first element in the split array
    // the number string is split by each digit into another array
    numArr = numSplit[0].split('');

    // check for thousands place
    if (numArr.length > 3) {
      let numberOfCommas, index;

      // if the total amount of numbers divided by 3 (thousands) has no remainders
      // then the amount of commas needed will be the quotient - 1
      // the index where the splice method will insert the first comma will be 3
      // otherwise, if the total amount of numbers divided by 3 has a remainder
      // then the total amount of commas will be quotient rounded down
      // and the first comma will be inserted at the remainder value index
      if (numArr.length % 3 === 0) {
        numberOfCommas = (numArr.length / 3) - 1;
        index = 3;
      } else {
        numberOfCommas = Math.floor(numArr.length / 3);
        index = numArr.length % 3;
      }

      // loop iterates the amount of times equal to how many commas need to be inserted
      // starts at the index value and inserts subsequent commas at the previous index value + 4
      // to account for added comma into the number array
      for (let i = 0; i < numberOfCommas; i++) {
        numArr.splice(index, 0 , ',');
        index += 4;
      }
    }

    // joins the number array with inserted commas
    numString = numArr.join('');

    // decimal values of the num string
    decimal = numSplit[1];

    type === 'exp' ? sign = '-' : sign = '+';

    return `${sign} ${numString}.${decimal}`
  };

  // public methods
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
              <div class="item__value">${formatNumber(transaction.value, type)}</div>
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
              <div class="item__value">${formatNumber(transaction.value, type)}</div>
              <div class="item__percentage">${transaction.percentage}</div>
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

      // 'call' method will allow the LIST object to method borrow 'slice' and immediately invoke the slice method on it creating an ARRAY copy
      // fieldsArr = Array.prototype.slice.call(fields);

      // // clear all fields
      // fieldsArr.forEach(function(field) {
      //   field.value = '';
      // });

      // Create an Array copy and then invoke callback that will clear field values
      Array.from(fields, field => field.value = '');
      // set the focus back on the first input field
      Array.from(fields)[0].focus();
    },
    displayBudget: function(budget) {
      let type;

      budget.budget > 0 ? type = 'inc' : type = 'exp';

      document.querySelector(DOMElements.budgetTotal).textContent = formatNumber(budget.budget, type);
      document.querySelector(DOMElements.incValue).textContent = formatNumber(budget.totalInc, 'inc');
      document.querySelector(DOMElements.expValue).textContent = formatNumber(budget.totalExp, 'exp');

      if (budget.percentage > 0) {
        document.querySelector(DOMElements.globalExpPercentage).textContent = budget.percentage + '%';
      } else {
        document.querySelector(DOMElements.globalExpPercentage).textContent = '---';
      }
    },
    displayExpensePercentages: function(percentages) {
      // NodeList of all HTML divs that display the percentage of the total income that each Expense transaction represents
      let expensePercentageFields = document.querySelectorAll(DOMElements.expPercentage);

      const nodeListForEach = function(list, callback) {
        for (let i = 0; i < list.length; i++) {
          callback(list[i], i);
        }
      };

      nodeListForEach(expensePercentageFields, function(field, index) {
        if (percentages[index] > 0) {
          field.textContent = `${percentages[index]}%`;
        } else {
          field.textContent = '---';
        }
      });
    },
    displayDate: function() {
      let dateNow, year, months, month;

      months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December']
      dateNow = new Date();
      month = dateNow.getMonth();
      year = dateNow.getFullYear();

      document.querySelector(DOMElements.dateLabel).textContent = `${months[month]} ${year}`;
    },
    changeSelectType: function() {

    }
  };
})();

// application module
const appController = (function(budgetCtrl, UICtrl) {
  const setEventListeners = function() {
    let DOMElements = UICtrl.getDOMElements();

    document.querySelector(DOMElements.addBtn).addEventListener('click', appCtrlAddTransaction);

    // event listener for key press which occurs globally and not on a particular element
    document.addEventListener('keypress', function(event) {
      if (event.keyCode === 13) appCtrlAddTransaction(); 
    });

    // parent element for both transaction lists --- Event Delegation
    document.querySelector(DOMElements.transactionsContainer).addEventListener('click', appCtrlDeleteTransaction);

    // event listener for select form to change border color to denote type of transaction
    document.querySelector(DOMElements.selectType).addEventListener('change', UICtrl.changeSelectType);
  };
  
  const appCtrlAddTransaction = function() {
    let input, newTransaction;

    // 1. Get input field value
    input = UICtrl.getInputValues();
    //console.log(input);

    // transaction will be added unless there is no description and/or the value field is empty or 0
    if (input.inputDescription !== '' && !isNaN(input.inputValue) && input.inputValue > 0) {
      // 2. Add item to budget controller
      newTransaction = budgetCtrl.addTransaction(input.selectType, input.inputDescription, input.inputValue);
      //console.log(newTransaction);
      // 3. Add item to UI
      UICtrl.renderTransactionHTML(newTransaction, input.selectType);
      // 4. Clear input fields
      UICtrl.clearFields();
      // 5. Calculate and update budget
      updateBudget();
      // update expense transactions percentages
      updateExpensesPercentage();
    }
  };

  const appCtrlDeleteTransaction = function(event) {
    let transactionElementID, elementIDArr, type, ID;

    // function to locate parent node by attribute and attribute value
    const findParentNode = function(element) {
      let parentNode = element.parentNode;
      //console.log(parentNode);
      while (true) {
        if (parentNode.id.includes('income') || parentNode.id.includes('expense')) break;
        parentNode = parentNode.parentNode;
      }
      //console.log(parentNode);
      return parentNode;
    }

    transactionElementID = findParentNode(event.target).id;
    
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

      // update and render expenses percentage
      updateExpensesPercentage();
    }
  };

  const updateBudget = function() {
    // 1. calculate the budget
    budgetCtrl.calculateBudget();
    // 2. Return the budget
    let budget = budgetCtrl.getBudget();
    // 2. Display the budget
    UICtrl.displayBudget(budget);
  };

  const updateExpensesPercentage = function() {
    // calculate percentages
    budgetCtrl.calculateAllPercentages();
    // read percentages from budget controller
    let percentages = budgetCtrl.getAllPercentages();
    // update UI with new percentages
    UICtrl.displayExpensePercentages(percentages);
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
      UICtrl.displayDate();
      UICtrl.displayBudget(budget);
      setEventListeners();
    }
  };
})(budgetController, UIController);

appController.init();
