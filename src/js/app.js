/* eslint-disable no-undef */
App = {
  web3Provider: null,
  editor: null,
  editor12: null,
  editorLog1: null,
  editor2: null,
  editor22: null,
  editor3: null,
  editor4: null,
  celmco: 1,
  blockchain: 0,
  ondemsale: 0,
  label: 1,
  templatesCube: [],

  fillTemplatesCube: function () {
    const celStream = [];
    const celSale = [];
    const mcoStream = [];
    const mcoSale = [];

    celStream.push('../templates/cel/use-case-stream-big-label.xml');
    celStream.push('../templates/cel/use-case-stream-small-label.xml');
    celStream.push('../templates/cel/use-case-stream-no-label.xml');
    celSale.push('../templates/cel/use-case-download-big-label.xml');
    celSale.push('../templates/cel/use-case-download-small-label.xml');
    celSale.push('../templates/cel/use-case-download-no-label.xml');
    mcoStream.push('../templates/mco/use-case-stream-big-label.ttl');
    mcoStream.push('../templates/mco/use-case-stream-small-label.ttl');
    mcoStream.push('../templates/mco/use-case-stream-no-label.ttl');
    mcoSale.push('../templates/mco/use-case-download-big-label.ttl');
    mcoSale.push('../templates/mco/use-case-download-small-label.ttl');
    mcoSale.push('../templates/mco/use-case-download-no-label.ttl');

    const cel = [];
    cel.push(celStream);
    cel.push(celSale);
    const mco = [];
    mco.push(mcoStream);
    mco.push(mcoSale);

    App.templatesCube.push(cel);
    App.templatesCube.push(mco);
  },

  getSCTemplate: function (x, y) {
    switch (y) {
      case 0:
        if (x == 0) {
          return [
            '../templates/sc/Ethereum_Smart.sol',
            '../templates/sc/Ethereum_Media_Token.sol',
          ];
        } else {
          return [
            '../templates/sc/Contract.sol',
            '../templates/sc/NFToken.sol',
          ];
        }
      case 1:
        return [
          '../templates/sc/main_approval.py',
          '../templates/sc/nft_approval.py',
        ];
      case 2:
        return [
          '../templates/sc/Ethereum_Smart.sol',
          '../templates/sc/Ethereum_Media_Token.sol',
        ];
      default:
        return;
    }
  },

  getTemplate: function (x, y, z) {
    return App.templatesCube[x][y][z];
  },

  init: async function () {
    App.fillTemplatesCube();
    const firstToDisplay = App.getTemplate(
      App.celmco,
      App.ondemsale,
      App.label
    );
    const data = await $.get(firstToDisplay);
    App.accounts = await $.getJSON('../accounts.json');

    App.editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
      lineNumbers: true,
      mode: { name: 'text/turtle' },
      theme: 'base16-dark',
    });

    App.editor.setValue(data);
    App.editor.setSize(null, 500);

    App.editor12 = CodeMirror.fromTextArea(
      document.getElementById('editor12'),
      {
        lineNumbers: true,
        mode: { name: 'text/turtle' },
        theme: 'base16-dark',
      }
    );

    App.editor12.setValue(
      'Click on convert to generate a MPEG-21 CEL/MCO Contract...'
    );
    App.editor12.setSize(null, 500);

    App.editorLog1 = CodeMirror.fromTextArea(
      document.getElementById('editorLog1'),
      {
        lineNumbers: true,
        mode: { name: 'text/turtle' },
        theme: 'base16-dark',
      }
    );

    App.editorLog1.setValue(
      'Click on Deploy, the progress will be shown here...'
    );
    App.editorLog1.setSize(null, 30);

    App.editor2 = CodeMirror.fromTextArea(document.getElementById('editor2'), {
      lineNumbers: true,
      mode: { name: 'javascript', json: true },
      theme: 'base16-dark',
    });
    App.editor2.setValue(
      'Click on convert to generate Media Contractual Objects...'
    );
    App.editor2.setSize(null, 500);

    App.editor22 = CodeMirror.fromTextArea(
      document.getElementById('editor22'),
      {
        lineNumbers: true,
        mode: { name: 'javascript', json: true },
        theme: 'base16-dark',
      }
    );
    App.editor22.setValue(
      'Click on parse to generate Media Contractual Objects...'
    );
    App.editor22.setSize(null, 500);

    App.editor3 = CodeMirror.fromTextArea(document.getElementById('editor3'), {
      lineNumbers: true,
      mode: { name: 'javascript' },
      theme: 'base16-dark',
    });
    App.editor3.setValue('Prepare and then deploy the smart contract...');
    App.editor3.setSize(null, 500);

    App.editor4 = CodeMirror.fromTextArea(document.getElementById('editor4'), {
      lineNumbers: true,
      mode: { name: 'javascript' },
      theme: 'base16-dark',
    });
    App.editor4.setValue('Smart Contract Template');
    App.editor4.setSize(null, 500);

    App.utilsString();

    App.setBlockchain();

    return App.initWeb3();
  },

  initWeb3: async function () {
    // Is there an injected web3 instance ?
    try {
      if (ethereum) {
        App.web3Provider = ethereum;
        ethereum.enable();
      } else {
        //// If no injected web3 instance is detected, fall back to Ganache
        App.web3Provider = new Web3.providers.HttpProvider(
          'http://localhost:8545'
        );
      }
      web3 = new Web3(App.web3Provider);
    } catch (error) {
      document.getElementById('metamask').style.display = 'block';
      document.getElementById('deploybtn').style.display = 'none';
      App.editor3.setValue('You need an Ethereum provider (Metamask)');
    }

    return App.bindEvents();
  },

  bindEvents: function () {
    $(document).on(
      'click',
      '.btn-contract',
      App.convertToMediaContractualObjects
    );
    $(document).on('click', '.btn-refresh', App.handleUpload);
    $(document).on('click', '.btn-refresh3', App.handleUploadAlgo);
    $(document).on('click', '.btn-update', App.initContract);
    $(document).on('click', '.btn-case', App.setCase);
    $(document).on('click', '.btn-convert', App.generateSCMData);
    $(document).on('click', '.btn-refresh2', App.parseSmartContract);
    $(document).on(
      'click',
      '.btn-contract2',
      App.convertToMediaContractualObjects
    );
  },

  convertToMediaContractualObjects: async function () {
    try {
      event.preventDefault();

      if (App.celmco === 0) {
        App.convertToMediaContractualObjectsCEL();
      } else {
        const ttlContract = App.editor.getValue();
        const res = await $.ajax({
          type: 'POST',
          url: 'https://scm.linkeddata.es/api/parser/mco',
          contentType: 'text/plain; charset=utf-8',
          dataType: 'text',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'text/plain',
          },
          data: ttlContract,
        });

        App.editor2.setValue(JSON.stringify(JSON.parse(res), null, 2));
      }
    } catch (error) {
      console.log(error);
      $('#cstatus').text('Contract Error!');
    }
  },

  convertToMediaContractualObjectsCEL: async function () {
    try {
      App.editor2.setValue(
        'Wait for a few seconds, while converting the CEL contract...'
      );
      const reqData = App.editor.getValue();
      const res = await $.ajax({
        type: 'POST',
        url: 'http://localhost:5000/parse',
        crossDomain: true,
        contentType: 'text/plain; charset=utf-8',
        dataType: 'text',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'text/plain',
        },
        data: reqData,
      });

      App.editor2.setValue(JSON.stringify(JSON.parse(res), null, 2));
    } catch (error) {
      console.log(error);
    }
  },

  generateSCMDataCEL: async function () {
    try {
      App.editor3.setValue(
        'Wait for a few seconds, while uploading the smart contract to the blockchain...'
      );

      await App.convertToMediaContractualObjectsCEL();

      const reqData = App.editor.getValue();
      const res = await $.ajax({
        type: 'POST',
        url: 'http://localhost:5000/deploy',
        crossDomain: true,
        contentType: 'text/plain; charset=utf-8',
        dataType: 'text',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'text/plain',
        },
        data: reqData,
      });

      App.editor3.setValue(JSON.stringify(JSON.parse(res), null, 2));
    } catch (error) {
      console.log(error);
    }
  },

  generateSCMData: async function () {
    try {
      event.preventDefault();

      if (App.celmco === 0) {
        App.generateSCMDataCEL();
      } else {
        const ttlContract = App.editor.getValue();
        const res = await $.ajax({
          type: 'POST',
          url: 'https://scm.linkeddata.es/api/parser/mco',
          contentType: 'text/plain; charset=utf-8',
          dataType: 'text',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'text/plain',
          },
          data: ttlContract,
        });
        const contr = JSON.parse(res).contracts[0];

        //const res2 = { contractIdref: 'cont-9ppXJE8Ct0T0gi_FK26Q4u' };
        const res2 = await $.ajax({
          type: 'POST',
          url: 'https://scm.linkeddata.es/api/contracts/',
          contentType: 'application/json; charset=UFT-8',
          dataType: 'json',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          data: JSON.stringify(contr),
        });
        //console.log(res2);

        const res3 = await $.ajax({
          type: 'GET',
          url: `https://scm.linkeddata.es/api/dlt/generate/${res2.contractIdref}`,
          crossDomain: true,
          headers: {
            Accept: 'application/json',
          },
        });
        //console.log(res3);

        App.editor3.setValue(JSON.stringify(res3, null, 2));
        document.getElementById('deploybtn').style.display = 'block';
        document.getElementById('deploybtn2').style.display = 'block';

        App.setBindings(res3);
        return App.setPies(res3);
      }
    } catch (error) {
      console.log(error);
    }
  },

  parseSmartContract: async function () {
    try {
      event.preventDefault();

      App.editor22.setValue('Can take some minutes...');
      const scAddress = document.getElementById('caddr').value;
      const res = await $.ajax({
        type: 'POST',
        url: 'https://scm.linkeddata.es/api/dlt/eth/parse',
        contentType: 'text/plain; charset=utf-8',
        dataType: 'text',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'text/plain',
        },
        data: scAddress,
      });

      App.editor22.setValue(JSON.stringify(JSON.parse(res), null, 2));
    } catch (error) {
      console.log(error);
      $('#cstatus').text('Contract Error!');
    }
  },

  convertFromMediaContractualObjects: async function () {
    try {
      event.preventDefault();

      const contr = App.editor22.getValue();

      //const res2 = { contractIdref: 'cont-9ppXJE8Ct0T0gi_FK26Q4u' };
      const res2 = await $.ajax({
        type: 'POST',
        url: 'https://scm.linkeddata.es/api/contracts/',
        contentType: 'application/json; charset=UFT-8',
        dataType: 'json',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        data: contr,
      });
      //console.log(res2);

      const res3 = await $.ajax({
        type: 'GET',
        url: `https://scm.linkeddata.es/api/generator/mco/${res2.contractIdref}`,
        crossDomain: true,
        headers: {
          Accept: 'text/plain',
        },
      });
      //console.log(res3);

      App.editor12.setValue(JSON.stringify(res3, null, 2));
    } catch (error) {
      console.log(error);
    }
  },

  setPies(scmObjects) {
    var element = document.getElementById('pies');
    while (element.hasChildNodes()) {
      element.removeChild(element.lastChild);
    }
    for (const key in scmObjects.incomePercentage) {
      var tag = document.createElement('div');
      tag.style.width = '200px';
      tag.style.height = '200px';
      tag.setAttribute('class', 'col-sm-6');
      element.appendChild(tag);

      const dataArray = [['Beneficiary', 'Percentage']];
      let tot = 0;
      for (const benefKey in scmObjects.incomePercentage[key]) {
        dataArray.push([benefKey, scmObjects.incomePercentage[key][benefKey]]);
        tot += scmObjects.incomePercentage[key][benefKey];
      }
      tot = 100 - tot;
      if (tot < 0) {
        throw new Error('Percentages error');
      }
      dataArray.push([key, tot]);

      var data = google.visualization.arrayToDataTable(dataArray);

      var options = {
        legend: 'none',
        pieSliceText: 'label',
        title: `${key}`,
        pieHole: 0.4,
      };

      var chart = new google.visualization.PieChart(tag);
      chart.draw(data, options);
    }
  },

  setBindings(scmObjects) {
    var element = document.getElementById('bindingsForm');
    while (element.hasChildNodes()) {
      element.removeChild(element.lastChild);
    }
    let accountIndex = 0;
    for (const key in scmObjects.parties) {
      /*
          <div class="form-group row">
            <label for="colFormLabelSm" class="col-sm-2 col-form-label col-form-label-sm">Email</label>
            <div class="col-sm-10">
              <input type="email" class="form-control form-control-sm" id="colFormLabelSm" placeholder="col-form-label-sm">
            </div>
          </div>
      */
      var div = document.createElement('div');
      div.setAttribute('class', 'form-group row');
      var label = document.createElement('label');
      label.setAttribute('for', 'colFormLabelSm');
      label.setAttribute('class', 'col-sm-2 col-form-label col-form-label-sm');
      label.innerHTML = key;
      var div2 = document.createElement('div');
      div2.setAttribute('class', 'col-sm-10');
      var input = document.createElement('input');
      input.setAttribute('type', 'name');
      input.setAttribute('class', 'form-control form-control-sm');
      input.setAttribute('value', App.accounts[accountIndex]);
      div2.appendChild(input);
      div.appendChild(label);
      div.appendChild(div2);
      element.appendChild(div);

      accountIndex = (accountIndex + 1) % 10;
    }
  },

  handleUpload: async function (event) {
    event.preventDefault();

    const bindings = {};
    for (
      let i = 0;
      i < document.getElementById('bindingsForm').childNodes.length;
      i++
    ) {
      bindings[
        document.getElementById('bindingsForm').childNodes[i].textContent
      ] = document.getElementById('bindingsForm').elements[i].value;
    }

    const mediaSC = JSON.parse(App.editor3.getValue());

    try {
      $('#mcoup').text('Uploading MCO Contract...');

      const networkId = await App.web3Provider.request({
        method: 'net_version',
      });

      const ipfs = new SCM.OffChainStorage();
      const deployer = new SCM.EthereumDeployer(
        App.web3Provider,
        ipfs,
        mediaSC,
        bindings,
        networkId
      );
      await deployer.setMainAddress(0);
      const res = await deployer.deploySmartContracts();
      const contractAddress = res.options.address;
      console.log(contractAddress);
      document.getElementById('deploybtn').style.display = 'block';
      document.getElementById('deploybtn2').style.display = 'block';
      $('#mcoup').text('Deployed!');
      $('#clinkMain').text(
        'https://ropsten.etherscan.io/address/' + contractAddress
      );
      $('#clinkMain').attr(
        'href',
        'https://ropsten.etherscan.io/address/' + contractAddress
      );
    } catch (error) {
      console.log(error);
    }
  },

  handleUploadAlgo: async function (event) {
    event.preventDefault();

    const bindings = await $.getJSON('../bindings-algo.json');
    const mediaSC = JSON.parse(App.editor3.getValue());

    try {
      $('#mcoup').text('Uploading MCO Contract...');

      const master = SCM.AlgoDeployer.fromMnemonic(
        'enforce drive foster uniform cradle tired win arrow wasp melt cattle chronic sport dinosaur announce shell correct shed amused dismiss mother jazz task above hospital'
      );
      const john = SCM.AlgoDeployer.fromMnemonic(
        'found empower message suit siege arrive dad reform museum cake evoke broom comfort fluid flower wheat gasp baby auction tuna sick case camera about flip'
      );
      const elon = SCM.AlgoDeployer.fromMnemonic(
        'resist derive table space jealous person pink ankle hint venture manual spawn move harbor flip cigar copy throw swap night series hybrid chest absent art'
      );
      const alice = SCM.AlgoDeployer.fromMnemonic(
        'brand globe reason guess allow wear roof leisure season coin own pen duck worth virus silk jazz pitch behave jazz leisure pave unveil absorb kick'
      );
      const bob = SCM.AlgoDeployer.fromMnemonic(
        'caution fuel omit buzz six unique method kiwi twist afraid monitor song leader mask bachelor siege what shiver fringe else mass hero deposit absorb tooth'
      );

      const ipfs = new SCM.OffChainStorage();
      const provider = {
        apiToken:
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        baseServer: 'https://scm.linkeddata.es/algo/',
        port: '443',
      };
      const deployer = new SCM.AlgoDeployer(provider, ipfs, mediaSC, bindings);
      await deployer.setMainAddress(master);

      var old = console.log;
      console.log = function (message) {
        if (typeof message == 'object') {
          App.editorLog1.setValue(
            JSON && JSON.stringify ? JSON.stringify(message) : String(message)
          );
        } else {
          App.editorLog1.setValue(message);
        }
      };
      const [appId, nftAppId] = await deployer.deploySmartContracts([
        master,
        john,
        elon,
        alice,
        bob,
      ]);
      console.log = old;

      console.log(appId, nftAppId);
      document.getElementById('deploybtn').style.display = 'block';
      document.getElementById('deploybtn2').style.display = 'block';
      $('#mcoup').text('Deployed!');
    } catch (error) {
      console.log(error);
    }
  },

  setTemplate: async function () {
    const jsonFile = App.getTemplate(App.celmco, App.ondemsale, App.label);
    var data = await $.get(jsonFile);
    if (App.celmco === 0) {
      data = new XMLSerializer().serializeToString(data);
    }
    App.editor.setValue(data);
  },

  setBlockchain: async function () {
    switch (App.blockchain) {
      case 0:
        document.getElementById('ethereumDeploy').style.display = 'block';
        document.getElementById('bindings').style.display = 'block';
        document.getElementById('deploybtn').style.display = 'block';
        document.getElementById('deploybtn2').style.display = 'none';
        document.getElementById('algorandDeploy').style.display = 'none';
        break;
      case 1:
        document.getElementById('ethereumDeploy').style.display = 'none';
        document.getElementById('bindings').style.display = 'none';
        document.getElementById('deploybtn').style.display = 'none';
        document.getElementById('deploybtn2').style.display = 'block';
        document.getElementById('algorandDeploy').style.display = 'block';
        break;
      case 2:
        document.getElementById('ethereumDeploy').style.display = 'block';
        document.getElementById('bindings').style.display = 'block';
        document.getElementById('deploybtn').style.display = 'block';
        document.getElementById('deploybtn2').style.display = 'none';
        document.getElementById('algorandDeploy').style.display = 'none';
        break;
      default:
        break;
    }

    const scFiles = App.getSCTemplate(App.celmco, App.blockchain);
    var data = await $.get(scFiles[0]);
    data += '\n\n' + (await $.get(scFiles[1]));
    console.log(data);
    App.editor4.setValue(data);
  },

  setCase: async function (event) {
    event.preventDefault();
    var petId = parseInt($(event.target).data('id'));

    switch (petId) {
      case 0:
        App.celmco = 0;
        break;
      case 1:
        App.celmco = 1;
        break;
      case 2:
        App.ondemsale = 0;
        break;
      case 3:
        App.ondemsale = 1;
        break;
      case 4:
        App.label = 0;
        break;
      case 5:
        App.label = 1;
        break;
      case 6:
        App.label = 2;
        break;
      case 7:
        App.blockchain = 0;
        break;
      case 8:
        App.blockchain = 1;
        break;
      case 9:
        App.blockchain = 0;
        break;
      default:
        break;
    }
    await App.setBlockchain();
    await App.setTemplate();
  },

  utilsString: function () {
    if (!String.prototype.format) {
      String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
          return typeof args[number] != 'undefined' ? args[number] : match;
        });
      };
    }
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});

$('form').keypress(function (e) {
  //Enter key
  if (e.which == 13) {
    return false;
  }
});
