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
      ID = 0;

      if (type === 'exp') {
        newTransaction = new Expense(ID, des, val);
      } else {
        newTransaction = new Income(ID, des, val);
      }
    }
  };
})();

let UIController = (function() {
  let DOMElements = {
    selectType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    addBtn: '.add__btn'
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
    }
  };
})();

let appController = (function(budgetCtrl, UICtrl) {
  let setEventListeners = function() {
    let DOMElements = UICtrl.getDOMElements();

    document.querySelector(DOMElements.addBtn).addEventListener('click', appCtrlAddItem);

    // event listener for key press which occurs globally and not on a particular element
    document.addEventListener('keypress', function(event) {
      if (event.keyCode === 13) appCtrlAddTransaction(); 
    });
  };
  
  let appCtrlAddTransaction = function() {
      // 1. Get input field value
      let input = UICtrl.getInputValues();
      console.log(input);
      // 2. Add item to budget controller
      // 3. Add item to UI
      // 4. calculate the budget
      // 5. Display the budget
  };

  return {
    init: function() {
      console.log('App has started.');
      setEventListeners();
    }
  };
})(budgetController, UIController);

appController.init();
