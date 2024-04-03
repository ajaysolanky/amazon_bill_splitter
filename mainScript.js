// Go to amazon orders page (current url: https://www.amazon.com/gp/your-account/order-history)
// Script for tallying up amazon split. Just copy collectAndGoToNextPage into the console
// repeatedly for all relevant pages. Use the reset function to wipe the slate, and the print
// function to show the results.
(function collectAndGoToNextPage() {
    const startDate = new Date('2024-01-01'); // Set the start date for filtering orders
    const orders = document.querySelectorAll('div.a-row');
    const orderTotalsByShipTo = JSON.parse(sessionStorage.getItem('orderTotalsByShipTo')) || {};
    const orderNumbers = JSON.parse(sessionStorage.getItem('orderNumbers')) || {'a':'b'};
    
    var orderDate;
    var orderTotal;
    var shipTo;
    var orderNumber = 'a';
    var returnedItem = false;

    orders.forEach(div => {
      const label = div.previousElementSibling;
      if (label && label.innerText.includes('ORDER PLACED')) {
        if (shipTo && (orderNumbers[orderNumber] || '.') == '.') {
            orderNumbers[label.innerText] = 'here';
            if (returnedItem == false) {
                orderTotalsByShipTo[shipTo] = (orderTotalsByShipTo[shipTo] || 0) + orderTotal;
            }
        }
        orderDate = null;
        orderTotal = null;
        shipTo = null;
        returnedItem = false;

        orderDate = div.innerText;
        var orderDateObj = new Date(orderDate);
        // Skip orders older than the start date or if date is invalid
        if (isNaN(orderDateObj.getTime()) || orderDateObj < startDate) {
            return;
        }

        if (orderTotal) {
            orderTotal = null;
            shipTo = null;
        }
        return;
      }

      if (label && label.innerText.includes('TOTAL')) {
        var currencyStr = div.innerText;
        orderTotal = parseFloat(currencyStr.replace(/[^0-9.]/g, ''));
        return;
      }

      if (label && label.innerText.includes('SHIP TO')) {
        shipTo = div.innerText;
        return;
      }

      if (label && label.innerText.includes('ORDER #')) {
        orderNumber = label.innerText;
        return;
      }

      if (div && div.innerText == 'Return complete') {
        returnedItem = true;
      }
    });

    if (shipTo && (orderNumbers[label.innerText] || '.') == '.') {
        orderNumbers[label.innerText] = 'here';
        orderTotalsByShipTo[shipTo] = (orderTotalsByShipTo[shipTo] || 0) + orderTotal;
    }
    orderDate = null;
    orderTotal = null;
    shipTo = null;
  
    sessionStorage.setItem('orderTotalsByShipTo', JSON.stringify(orderTotalsByShipTo));
    sessionStorage.setItem('orderNumbers', JSON.stringify(orderNumbers));
    console.log('Current Totals by Ship To:', orderTotalsByShipTo);
  
    // Navigate to the next page
    const nextButton = document.querySelector('ul.a-pagination li.a-last a');
    if (nextButton && !nextButton.closest('li.a-disabled')) {
      nextButton.click();
    } else {
      sessionStorage.setItem('isScriptRunning', 'false'); // End the script if there's no next page
    }
  })();
  
  (function resetSessionStorage() {
    sessionStorage.removeItem('orderTotalsByShipTo');
    sessionStorage.removeItem('orderNumbers');
    sessionStorage.setItem('isScriptRunning', 'true');
  })();
  
  (function printOrderTotalsByShipTo() {
    const orderTotalsByShipTo = JSON.parse(sessionStorage.getItem('orderTotalsByShipTo')) || {};
    console.log('Order Totals by Ship To:', orderTotalsByShipTo);
  })();