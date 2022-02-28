//249, 274, 276 innerHTML error

function scheduler(action, ms = 1000, runRightNow = true) {
  if (runRightNow) action();
  setInterval(action, ms);
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const config = {
  contracts: {
    ERC721: {
      abi: abi.ERC721,
      //PPV1(NotSaleContract)
      address: '0x1042cde4f1165abff05af0DaaEF57086CDe06638',
    },
    buyERC721: {
      abi: abi.buyERC721,
      //minterContract(Sale Contract)
      address: '0x985e00EaEb9EC167114Fd526e31b6166C9182097',
    },
  },
  network: {
    chainName: 'Ethereum',
    chainId: 3,
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://ropsten.infura.io/v3/314f0bdea36c470f9f9ca75759f5204c'],
    blockExplorerUrls: ['https://explorer.popcateum.org'],
  },
};
const App = {
  web3Provider: null,
  currentAccount: null,
  connected: false,

  init: async function () {
    await App.initWeb3();
    await ERC721.init();
    await buyERC721.init();
    

    //페이지이름에서 ERC20, ERC721을 시작할것인지
    if (pageName === 'ff') {
      //await ERC721.pageInit();
    }
    if (pageName === 'NFT') {
      await ERC721.pageInit();
    }
  },
  initWeb3: async function () {
    App.web3Provider = new Web3.providers.HttpProvider(
      config.network.rpcUrls[0],
    ); // 노드와의 연결
    window.web3 = new Web3(App.web3Provider);

    if (window.ethereum) {
      try {
        //await App.switchNetwork();
        await App.connect();
        await App.chnaged();
      } catch (error) {
        if (error.code === 4001) {
          // User rejected request
          Alert('Please reflesh this page (F5) Meow~').close(3000);
        }
        console.log(error);
      }
    } else {
      Alert('There is no Metamask. Please install Metamask. Meow~').close(5000);
    }
  },
  switchNetwork: async function () {
    await ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: '0x' + config.network.chainId.toString(16),
          chainName: config.network.chainName,
          nativeCurrency: config.network.nativeCurrency,
          rpcUrls: config.network.rpcUrls,
          blockExplorerUrls: config.network.blockExplorerUrls,
        },
      ],
    });
  },
  connect: async function () {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    App.currentAccount = accounts[0];
    App.connected = true;
  },
  chnaged: async function () {
    ethereum.on('accountsChanged', async () => {
      await App.connect();
    });
  },

  CheckId: async function () {
    document.getElementById("Account").innerHTML = "Your MetaMask Address : " +  await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
  },
};

function Alert(msg) {
  const div = document.createElement('div');
  div.classList.add('alert');
  div.classList.add('alert-warning');
  div.innerText = msg;
  document.getElementsByTagName('main')[0].prepend(div);
  this.close = function (ms) {
    if (ms && ms > 0) {
      setTimeout(() => div.remove(), ms);
    } else {
      div.remove();
    }
  };
  return this;
}


const ERC721 = {
  contract: null,
  baseURI: '',

  init: async function () {
    // do nothing
    this.contract = new web3.eth.Contract(
      config.contracts.ERC721.abi,
      config.contracts.ERC721.address,
    );
  },
  pageInit: async function () {
    this.writeMaxSupply();
    scheduler(this.writeTotalSupply, 1000);

    this.baseURI = await this.getBaseURI();
    if (App.connected) this.showMyNFTs();
  },

  getBaseURI: async function () {
    return await ERC721.contract.methods.getBaseURI().call();
  },
  getMaxSupply: async function () {
    return await ERC721.contract.methods.MAX_SUPPLY().call();
  },
  getTotalSupply: async function () {
    return await ERC721.contract.methods.totalSupply().call();
  },
  getBalanceOf: async function (address) {
    return await ERC721.contract.methods.balanceOf(address).call();
  },
  getOwnerOf: async function (address) {
    return await ERC721.contract.methods.ownerOf(address).call();
  },
  sendToken: async function (tokenID, toAddress) {
    const alert = Alert(`send #${tokenID} to ${toAddress}...`);
    const evmData = ERC721.contract.methods
      .transferFrom(App.currentAccount, toAddress, tokenID)
      .encodeABI();

    const params = [
      {
        from: App.currentAccount,
        to: config.contracts.ERC721.address,
        data: evmData,
        value: '0x0',
      },
    ];
    ethereum
      .request({
        method: 'eth_sendTransaction',
        params,
      })
      .then((result) => {
        alert.close();
        console.log(result);
      })
      .catch((error) => {
        console.error(error);
      });
  },

  //ERC721.baseURI is img.json file
  getMetadata: async function (tokenId) {
    const tokenURI = ERC721.baseURI + tokenId;
    const result = await fetch(tokenURI);
    return await result.json();
  },

  clickTokenTransfer: async function (tokenId) {
    const toAddress = prompt(`send your #${tokenId}, input toAddress Meow~`);
    if (!toAddress) Alert('input valid ToAddress').close(2000);
    ERC721.sendToken(tokenId, toAddress);
  },
  makeNFTElement: function (tokenId, imagePath, attribute) {
    const div = document.createElement('div');
    div.classList.add('col');
    div.style = 'width: 20%;';
    {
      // card
      const card = document.createElement('div');
      card.classList.add('card');
      card.classList.add('h-100');
      div.appendChild(card);
      div.onclick = function () {
        ERC721.clickTokenTransfer(tokenId);
      };
      {
        
        // image
        const img = document.createElement('img');
        img.classList.add('card-img-top');
        img.src = imagePath;
        img.alt = '...';
        card.appendChild(img);
      }
      {
        // desc
        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');

        const title = document.createElement('h5');
        title.classList.add('card-title');
        title.innerText = `#${tokenId}`;
        
        cardBody.appendChild(title);
        card.appendChild(cardBody);
      }
    }
    return div;
  },

  appendNFT: async function (tokenId) {
    const metadata = await ERC721.getMetadata(tokenId);
    const nftElement = ERC721.makeNFTElement(
      tokenId,
      metadata.image,
      metadata.attributes,
    );
    document.getElementById('my-nft-list').appendChild(nftElement);

    const tmp = document.querySelector('#my-nft-list span');
    if (tmp) {
      tmp.remove();
    }
  },

  showMyNFTs: async function () {
    const balance = await ERC721.getBalanceOf(App.currentAccount);
    const total = await ERC721.getTotalSupply();

    let ownerCount = 0;
    for (const index of Array.from(Array(Number(total)).keys())) {
      const tokenId = index + 1;
      const owner = await ERC721.getOwnerOf(tokenId);
      if (owner.toLowerCase() == App.currentAccount.toLowerCase()) {
        ownerCount += 1;
        ERC721.appendNFT(tokenId);
        await sleep(1000); // for Pinata GWS req limit
        if (balance <= ownerCount) break;
      }
    }
  },
  writeMaxSupply: async function () {
   document.getElementById('max-supply').innerHTML =
    await ERC721.getMaxSupply();
  },
  writeTotalSupply: async function () {
    document.getElementById('total-supply').innerHTML =
      await ERC721.getTotalSupply();
  },
};

const buyERC721 = {
  contract: null,
  pricePerETH: 0.19, // TMP 

  init: async function () {
    // do nothing
    this.contract = new web3.eth.Contract(
      config.contracts.buyERC721.abi,
      config.contracts.buyERC721.address,
    );
  },

  getIsSale: async function () {
    return await buyERC721.contract.methods.isSale().call();
  },

  mintWithETH: async function () {
    const numberOfTokens = document.getElementById('number-of-tokens').value;
    if (numberOfTokens > 8)
      return Alert('only mint 8 NFT at a time Meow~').close(3000);
    const value = new BigNumber(web3.utils.toWei(numberOfTokens, 'ether'))
      .multipliedBy(buyERC721.pricePerETH)
      .toFixed();

    const evmData = buyERC721.contract.methods
      .mintByETH(numberOfTokens)
      .encodeABI();

    buyERC721.sendMint(web3.utils.toHex(value), evmData);
  },

  sendMint: async function (value, evmData) {
    const isSale = await buyERC721.getIsSale();

    if (!isSale) {
       Alert('The sale has not started. Meow~').close(3000);
       return;
     }

    const params = [
      {
        from: App.currentAccount,
        to: config.contracts.buyERC721.address,
        data: evmData,
        value,
      },
    ];
    ethereum
      .request({
        method: 'eth_sendTransaction',
        params,
      })
      .then((result) => {
        console.log(result);
      })
      .catch((error) => {
        console.error(error);
      });
  },
};

App.init();
