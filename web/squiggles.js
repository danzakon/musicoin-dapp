var web3;
var eth;
var squiggleIds;
var squiggleValues;
var accs;
var ethBalance;
var squiggles;
var decimalsFactor = 1000000000000000000;

var spanCurrAccountAddress = document.getElementById('curr-account');
var divAccountsList = document.getElementById('accounts-list');
var divSquigglesList = document.getElementById('squiggles-list');
var divCreateInfo = document.getElementById('create-info');
var divSquiggleRendering = document.getElementById('squiggle-rendering');
var inputCreateAddress = document.getElementById('create-address');
var btnUpdate = document.getElementById('btnUpdate');
var btnToggle = document.getElementById('btnToggle');
var btnOwner = document.getElementById('btnOwner');
var btnTransfer = document.getElementById('btnTransfer');
var btnCreateSquiggle = document.getElementById('btnCreateSquiggle');
var currAccountDiv = document.getElementById('curr-account-div');

var squiggleTokenContract;
var squiggleToken;
var squiggleContractOwner;
var defaultAccountIndex;
var defaultAccount;
var contractLoaded;
var selectedSquiggle;

var chooseSquiggle = function(index) {
    if (index >= 0) {
        selectedSquiggle = index;
        renderToken(squiggleValues[index].tag);
        squiggleIds.forEach(function(squiggleId, i) {
            squiggleId.style.fontWeight = index === i ? 'bold' : 'normal';
        });
        squiggleValues.forEach(function(squiggleValue, i) {
            squiggleValue.style.fontWeight = index === i ? 'bold' : 'normal';
        });
    } else {
        renderToken(undefined);
    }
};

var getSquiggleBalance = function(account) {
    return new Promise(function(resolve, reject) {
        squiggleToken.balanceOf(account, function(err, bal) {
            if (!err) {
                resolve(bal);
            } else {
                console.log(err);
                reject(err);
            }
        });
    });
};

var getEthBalance = function(account) {
    return new Promise(function(resolve, reject) {
        eth.getBalance(account, function(err, bal) {
            if (!err) {
                resolve(bal);
            } else {
                console.log(err);
                reject(err);
            }
        });
    });
};

var updateAccounts = async function(selectLastSquiggle) {
    for (var i = 0; i < eth.accounts.length; ++i) {
        var acctSpan = document.getElementById(`account-${i}`);
        var outputSpan = document.getElementById(`account-output-${i}`);
        var ethBalanceSpan = document.getElementById(`eth-balance-${i}`);
        var currAccount = eth.accounts[i];
        var bal = await getSquiggleBalance(currAccount);
        if (currAccount === squiggleContractOwner) {
            outputSpan.innerText = `Owner Songs: ${bal}`;
        } else {
            outputSpan.innerText = `Songs: ${bal}`;
        }
        var ethBal = await getEthBalance(currAccount);
        ethBalanceSpan.innerText = ethBal.dividedBy(1000000000000000000).toString(10);

        acctSpan.style.fontWeight = currAccount === defaultAccount ? 'bold' : 'normal';
        outputSpan.style.fontWeight = currAccount === defaultAccount ? 'bold' : 'normal';
        ethBalanceSpan.style.fontWeight = currAccount === defaultAccount ? 'bold' : 'normal';
    }

    if (defaultAccount === squiggleContractOwner) {
        divCreateInfo.style.display = 'block';
    } else {
        divCreateInfo.style.display = 'none';
    }
    squiggleIds = [];
    squiggleValues = [];
    divSquigglesList.innerHTML = '';
    squiggleToken.tokensOfOwner(defaultAccount, function(err, res) {
        if (!err) {
            if (res.length > 0) {
                if ((selectedSquiggle === undefined || selectedSquiggle >= res.length)) {
                    selectedSquiggle = 0;
                }
                var headerRow = document.createElement('tr');
                var header1 = document.createElement('th');
                header1.innerText = 'Song Id';
                var header2 = document.createElement('th');
                header2.innerText = 'Song Value';
                header2.className = 'squiggle-value';
                headerRow.appendChild(header1);
                headerRow.appendChild(header2);
                divSquigglesList.appendChild(headerRow);
                divSquiggleRendering.style.visibility = 'visible';
            } else {
                chooseSquiggle(-1);
                divSquigglesList.innerText = 'No Songs Owned!';
                divSquiggleRendering.style.visibility = 'hidden';
            }
            for (var i = 0; i < res.length; ++i) {
                const squiggleId = web3.toBigNumber(res[i]);
                const index = i;
                squiggleToken.getSquiggle(squiggleId.toNumber(), function(err, res2) {
                    var squiggleValue = new BigNumber(res2);
                    var rowDiv = document.createElement('tr');
                    squiggleIds[index] = document.createElement('td');
                    squiggleIds[index].innerText = squiggleId.toNumber();
                    squiggleIds[index].classList.add('clickable');
                    squiggleIds[index].draggable = true;
                    squiggleValues[index] = document.createElement('td');
                    squiggleValues[index].innerText = squiggleValue.toString(10);
                    squiggleValues[index].tag = squiggleValue;
                    squiggleValues[index].draggable = true;
                    squiggleValues[index].className = 'squiggle-value';
                    squiggleIds[index].addEventListener('click', function() {
                        chooseSquiggle(index);
                    });
                    squiggleIds[index].addEventListener('dragstart', function(e) {
                        e.dataTransfer.setData('text/plain', `${squiggleId.toNumber()}`);
                    });
                    squiggleValues[index].addEventListener('click', function() {
                        chooseSquiggle(index);
                    });
                    squiggleValues[index].addEventListener('dragstart', function(e) {
                        e.dataTransfer.setData('text/plain', `${squiggleId.toNumber()}`);
                    });
                    if (index === (selectLastSquiggle ? squiggleIds.length - 1 : 0)) {
                        chooseSquiggle(index);
                    }
                    rowDiv.appendChild(squiggleIds[index]);
                    rowDiv.appendChild(squiggleValues[index]);
                    divSquigglesList.appendChild(rowDiv);
                });
            }
        } else {
            console.log(err);
        }
    });
};

// Account management functions
var setDefaultAccountIndex = function(index) {
    if (index < 0) {
        index = 0;
    }
    if (index >= web3.eth.accounts.length) {
        index = web3.eth.accounts.length - 1;
    }
    defaultAccountIndex = index;
    if (defaultAccount === web3.eth.accounts[defaultAccountIndex]) {
        return;
    }
    initializeUI();
    defaultAccount = web3.eth.accounts[defaultAccountIndex];
    eth.defaultAccount = defaultAccount;
    if (contractLoaded) {
        updateAccounts();
    }
    spanCurrAccountAddress.innerText = defaultAccount;
};

var setAccountToAddress = function(address) {
    if (defaultAccount !== address) {
        setDefaultAccountIndex(web3.eth.accounts.indexOf(address));
    }
};

var toggleDefaultAccountIndex = function() {
    setDefaultAccountIndex((defaultAccountIndex + 1) % web3.eth.accounts.length);
};

// Contract function
var loadSquiggleTokenContract = function(callback) {
    var squiggleTokenContract = web3.eth.contract(getERC721Abi());
    squiggleToken = squiggleTokenContract.at(getERC721Address());
    squiggleToken.owner(function(err, res) {
        squiggleContractOwner = res;
        setAccountToAddress(squiggleContractOwner);
        contractLoaded = true;
        callback(undefined, squiggleToken);
    });
};

var initializeUI = function() {
    accs = [];
    ethBalance = [];
    squiggles = [];
    spanCurrAccountAddress.innerText = defaultAccount;
    divAccountsList.innerText = '';
    var headerRowDiv = document.createElement('tr');
    var headerDiv1 = document.createElement('th');
    headerDiv1.innerText = 'Account Address';
    var headerDiv2 = document.createElement('th');
    headerDiv2.innerText = 'ETH Balance';
    var headerDiv3 = document.createElement('th');
    headerDiv3.innerText = 'SQGL Balance';
    headerRowDiv.appendChild(headerDiv1);
    headerRowDiv.appendChild(headerDiv2);
    headerRowDiv.appendChild(headerDiv3);
    divAccountsList.appendChild(headerRowDiv);
    for (var i = 0; i < eth.accounts.length; ++i) {
        const currIndex = i;
        var acc = eth.accounts[currIndex];
        var rowDiv = document.createElement('tr');
        accs.push(document.createElement('td'));
        accs[currIndex].id = `account-${currIndex}`;
        accs[currIndex].innerText = acc;
        accs[currIndex].className = 'account';
        accs[currIndex].draggable = true;
        accs[currIndex].addEventListener('click', function() {
            setAccountToAddress(this.innerText);
        });
        accs[currIndex].addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', this.innerText);
        });
        ethBalance.push(document.createElement('td'));
        ethBalance[currIndex].className = 'eth-balance';
        ethBalance[currIndex].id = `eth-balance-${currIndex}`;
        ethBalance[currIndex].addEventListener('click', function() {
            setAccountToAddress(accs[currIndex].innerText);
        });
        squiggles.push(document.createElement('td'));
        squiggles[currIndex].className = 'balance-output';
        squiggles[currIndex].id = `account-output-${currIndex}`;
        squiggles[currIndex].addEventListener('click', function() {
            setAccountToAddress(accs[currIndex].innerText);
        });
        rowDiv.appendChild(accs[i]);
        rowDiv.appendChild(ethBalance[i]);
        rowDiv.appendChild(squiggles[i]);
        divAccountsList.appendChild(rowDiv);
    }
};

// Initialize and onload functions
var initialize = function(provider) {
    web3 = new Web3(provider);
    eth = web3.eth;
    contractLoaded = false;
    setDefaultAccountIndex(0);
    loadSquiggleTokenContract(function(e, contract) {
        if (typeof contract.address !== 'undefined') {
             console.log(`Contract found! address: ${contract.address} transactionHash: ${contract.transactionHash}`);
        }
        updateAccounts();
    });

    // Button Click Functions
    btnUpdate.addEventListener('click', function() {
        updateAccounts();
    });
    btnToggle.addEventListener('click', function() {
        toggleDefaultAccountIndex();
    });
    btnOwner.addEventListener('click', function() {
        setAccountToAddress(squiggleContractOwner);
    });
    btnTransfer.addEventListener('click', function() {
        var accountToTransfer = document.getElementById('transfer-account');
        var account = accountToTransfer.value;
        var idToTransfer = document.getElementById('transfer-id')
        var id = idToTransfer.value;

        squiggleToken.transfer(account, id, { "from": defaultAccount, "gasPrice": 1000000000, "gas": 967000}, function(err, res) {
            if (!err) {
                accountToTransfer.value = '';
                idToTransfer.value = '';
                updateAccounts();
            } else {
                console.log(err);
            }
        });
    });
    btnCreateSquiggle.addEventListener('click', function() {
        var account = inputCreateAddress.value;
        squiggleToken.createRandomSquiggle(account, { "from": defaultAccount, "gasPrice": 1000000000, "gas": 257637}, function(err, res) {
            if (!err) {
                if (account === defaultAccount) {
                    updateAccounts(true);
                } else {
                    alert('Squiggle Created!');
                    if (web3.eth.accounts.includes(account)) {
                        updateAccounts(false);
                    }
                }
            } else {
                console.log(err);
            }
        });
    });
};

window.addEventListener('load', async () => {
    // Modern dapp browsers...
    if (window.ethereum) {
        try {
            // Request account access if needed
            await ethereum.enable();
            currAccountDiv.style.display = 'none';
            initialize(ethereum);
            setInterval(function() {
                setDefaultAccountIndex(0);
            }, 1000);
        } catch (error) {
            // User denied account access...
        }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
        initialize(web3.currentProvider);
    }
    // Non-dapp browsers...
    else {
        currAccountDiv.style.display = 'block';
        initialize(new Web3.providers.HttpProvider(getGanacheAddress()));
    }
});
