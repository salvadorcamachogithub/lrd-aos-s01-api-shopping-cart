/*

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

*/

load.initialize("Initialize", async function () {
});

load.action("Action", async function () {

const loginTransaction = new load.Transaction("AOS-LRD-S01-01 Sign In");
loginTransaction.start();   
    
    const AccountLoginRequest = new load.WebRequest({
        id: 1,
        url: `${load.params.AOS_URL}/accountservice/ws/AccountLoginRequest`,
        method: "POST",
        headers: {
            "content-type": "text/xml;"
        },
        body: `<?xml version="1.0" encoding="UTF-8"?>        <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
            <soap:Body>
                <AccountLoginRequest xmlns="com.advantage.online.store.accountservice">
                    <email></email>
                    <loginPassword>${load.params.loginPassword}</loginPassword>
                    <loginUser>${load.params.loginUser}</loginUser>
                </AccountLoginRequest>
            </soap:Body>
        </soap:Envelope>`,
        returnBody: true,
        extractors:[
                new load.BoundaryExtractor("userId", "<ns2:userId>", "<"),
                new load.BoundaryExtractor("t_authorization", "<ns2:t_authorization>", "<"),
                ]
            
    }).sendSync();
    
    load.log(`userId that was SAVED: ${AccountLoginRequest.extractors.userId}`);
    load.log(`t_authorization that was SAVED: ${AccountLoginRequest.extractors.t_authorization}`);

    if (AccountLoginRequest.extractors.userId === null || AccountLoginRequest.extractors.t_authorization === null) {
        load.log(`Correlation userId or t_authorization FAILED!`);
        loginTransaction.stop(load.TransactionStatus.Failed);
     }  else {
        load.log("Correlation userId or t_authorization PASSED!");
        //loginTransaction.stop(load.TransactionStatus.Passed);
     }

    if (AccountLoginRequest.textCheck("Login Successful")){
        load.log("AccountLoginRequest textCheck Success!");
    } else {
        load.log("AccountLoginRequest textCheck Failure!");
        loginTransaction.stop(load.TransactionStatus.Failed);
    }
    
    const carts = new load.WebRequest({
        id: 2,
        url: `${load.params.AOS_URL}/order/api/v1/carts/${AccountLoginRequest.extractors.userId}`,
        method: "GET",
        headers: {
            "accept": "application/json, text/plain, */*",
            "authorization": `Basic ${AccountLoginRequest.extractors.t_authorization}`
        },
        returnBody: true,
        extractors:[
                new load.JsonPathExtractor("sessionId", "$.sessionId")
                ]
    }).sendSync();
    
    load.log(`sessionId that was SAVED: ${carts.extractors.sessionId}`);

    if (carts.textCheck("sessionId\":\"")){
        load.log("carts textCheck Success!");
    } else {
        load.log("carts textCheck Failure!");
        loginTransaction.stop(load.TransactionStatus.Failed);
    }
    
loginTransaction.stop();

load.thinkTime(10);

const addToCartTransaction = new load.Transaction("AOS-LRD-S01-02 Add To Cart");
addToCartTransaction.start(); 

    const AddToCart = new load.WebRequest({
        id: 3,
        url: `${load.params.AOS_URL}/order/api/v1/carts/${AccountLoginRequest.extractors.userId}/product/25/color/3683D1`,
        method: "POST",
        headers: {
            "content-type": "application/json",
            "authorization": `Basic ${AccountLoginRequest.extractors.t_authorization}`
        },
        body: {
            "sessionId": `${carts.extractors.sessionId}`
        },
        queryString: {
            "quantity": "1"
        },
        //returnBody: true
    }).sendSync();
    
addToCartTransaction.stop();

load.thinkTime(10);


const shoppingCartTransaction = new load.Transaction("AOS-LRD-S01-03 Shopping Cart");
shoppingCartTransaction.start(); 

    const ShoppingCart = new load.WebRequest({
        id: 4,
        url: `${load.params.AOS_URL}/order/api/v1/carts/${AccountLoginRequest.extractors.userId}`,
        method: "GET",
        headers: {
            "authorization": `Basic ${AccountLoginRequest.extractors.t_authorization}`
        },
        //returnBody: true
    }).sendSync();
    
shoppingCartTransaction.stop();

load.thinkTime(10);


const updateQuantityTransaction = new load.Transaction("AOS-LRD-S01-04 Update Quantity");
updateQuantityTransaction.start(); 

    const UpdateQuantity = new load.WebRequest({
        id: 5,
        url: `${load.params.AOS_URL}/order/api/v1/carts/${AccountLoginRequest.extractors.userId}/product/25/color/3683D1`,
        method: "PUT",
        headers: {
            "content-type": "application/json",
            "authorization": `Basic ${AccountLoginRequest.extractors.t_authorization}`
        },
        queryString: {
            "quantity": "10"  // Max of 10, if putting more, it doesn't error out, but it only update to max 10
        },
        //returnBody: true
    }).sendSync();
    
updateQuantityTransaction.stop();

load.thinkTime(10);

    
const removeProductTransaction = new load.Transaction("AOS-LRD-S01-05 Remove Product");
removeProductTransaction.start(); 

    const RemoveProduct = new load.WebRequest({
        id: 6,
        url: `${load.params.AOS_URL}/order/api/v1/carts/${AccountLoginRequest.extractors.userId}/product/25/color/3683D1`,
        method: "DELETE",
        headers: {
            "authorization": `Basic ${AccountLoginRequest.extractors.t_authorization}`
        },
        //returnBody: true
    }).sendSync();
    
removeProductTransaction.stop();

});

load.finalize("Finalize", async function () {
});
