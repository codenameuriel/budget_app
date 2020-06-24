let budgetController = (function() {
  return {
    // some code
  };
})();

let UIController = (function() {
  let DOMElements = {
    selectType: '.add__type',
    inputDescription: '.add__description',
    inputValue: 'add__value'
  };

  return {
    getInput: function() {
      return {
        selectType: document.querySelector(DOMElements.selectType).value,
        inputDescription: document.querySelector(DOMElements.inputDescription).value,
        inputValue: document.querySelector(DOMElements.inputValue).value
      };
    }
  };
})();

let appController = (function(budgetCtrl, UICtrl) {
  let appCtrlAddItem = function() {
      // 1. Get input field value
      let input = UICtrl.getInput();
      console.log(input);
      // 2. Add item to budget controller
      // 3. Add item to UI
      // 4. calculate the budget
      // 5. Display the budget
  }

  document.querySelector('.add__btn').addEventListener('click', appCtrlAddItem);

  // event listener for key press which occurs globally and not on a particular element
  document.addEventListener('keypress', function(event) {
    if (event.keyCode === 13) appCtrlAddItem(); 
  });

  return {
    // some code
  };
})(budgetController, UIController);
