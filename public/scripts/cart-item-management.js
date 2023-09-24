const cartItemUpdateFormElements = document.querySelectorAll('.cart-item-management');
const cartTotalPriceElement = document.getElementById('cart-total-price');
const cartBadge = document.getElementById('cart-badge');

async function updateCartItem(event) {
  event.preventDefault();

  const form = event.target;
  const productId = form.dataset.productid;
  const csrfToken = form.dataset.csrf;
  const quantity = form.firstElementChild.value;

  let response;
  try {
    response = await fetch('/cart/items', {
      method: 'PATCH',
      body: JSON.stringify({
        productId: productId,
        quantity: quantity,
        _csrf: csrfToken,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    alert('Something went wrong!');
    return;
  }

  if (!response.ok) {
    alert('Something went wrong!');
    return;
  }

  const responseData = await response.json();
  console.log(responseData)

  if (responseData.updatedCartData.updatedItemPrice === 0) {
    // Remove the cart item from the DOM
    const cartItemElement = document.getElementById(`cart-item-${productId}`);
    cartItemElement.remove();
  } else {
    // Update the cart item's total price in the DOM
    const pieceQuantity = document.querySelector(`.quantity-${productId}`);
    const cartItemTotalPriceElement = document.getElementById(`cart-item-price-${productId}`);
    cartItemTotalPriceElement.textContent = responseData.updatedCartData.updatedItemPrice;

    // Update other cart-related information in the DOM

    cartTotalPriceElement.textContent = responseData.updatedCartData.newTotalPrice;
    console.log('Cart Badge', cartBadge)
    cartBadge.textContent = responseData.updatedCartData.newTotalQuantity;
    pieceQuantity.textContent = responseData.updatedCartData.updatedItemQuantity;

  }
}

for (const formElement of cartItemUpdateFormElements) {
  formElement.addEventListener('submit', updateCartItem);
}
