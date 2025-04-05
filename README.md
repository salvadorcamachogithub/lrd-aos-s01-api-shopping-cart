Updated: 04.2025 
Script created by Salvador Camacho

This script is for LoadRunner Developer (Visual Studio Code IDE), there is a VuGen DevWeb script that does the same steps called AOS-DevWeb-S01 API Shopping Cart

This script was created with best practices, so it is more resilient, such as:
* Transaction naming
* No add cookies
* No third party
* One validation per transaction
* Think times at the end of each transaction to better simulate user behavior
* Main URL and users parametrized, Public AOS by default, credentials parametrized

This script signs in, adds an item to the cart, goes to the shopping cart, updates the quantity and then removed it from the shopping cart

Runtime Settings were set to log only on errors and generate snapshot on errors, think times 75% to 150%

This script has 5 transactions 
AOS-LRD-S01-01 Sign In 
AOS-LRD-S01-02 Add To Cart 
AOS-LRD-S01-03 Shopping Cart 
AOS-LRD-S01-04 Update Quantity 
AOS-LRD-S01-05 Remove Product