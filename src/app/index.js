// React
import React, {Component} from 'react';
var ReactDOM = require('react-dom');
var createReactClass = require('create-react-class');
import { Router, Route, browserHistory, Link} from 'react-router';
//design
import { Layout,  Button, notification, Menu, Breadcrumb, Input} from 'antd';
const { Header, Content, Footer } = Layout;
import 'antd/dist/antd.min.css';
const Search = Input.Search;

// module require
//var Playform = require('./playItem');
var Payeth = require('./payEth');
var About = require('./about');
require('./css/index.css');

// Smart Contract
const contractAddress = '0x2dd89b83cce7a68d2a1f65aff95c398c62efb769';
const abi = require('../../Contract/abi');
const mycontract = web3.eth.contract(abi);
const myContractInstance = mycontract.at(contractAddress);


// metaMask listener
window.addEventListener('load', function() {
        // Checking if Web3 has been injected by the browser (Mist/MetaMask)
           if (typeof web3 !== 'undefined') {
                // Use Mist/MetaMask's provider
                window.web3 = new Web3(web3.currentProvider);
            } else {
                console.log('No web3? You should consider trying MetaMask!')
                // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
                window.web3 = new Web3(new Web3.providers.HttpProvider("https://localhost:8545"));
        }
      });

// Routing
class App extends Component{
  render() {
    return(
      <Router history={browserHistory}>
        <Route path={"/"} component={GameComponent}></Route>
        <Route path={"/about"} component={About}></Route>
      </Router>
    );
  }
};


// Create component, initialization
class GameComponent extends Component{
  render(){
     var checkTX = setTimeout(function(){
       web3.eth.getTransactionReceipt(this.state.txHash, function(err, receipt){
        if(!err){
          if(receipt == null){
            this.setState( {txStatus:'new transaction in process'});
          }
          else{
          this.setState( {txStatus:'transaction: ' + this.state.txHash + ' is minded'});
          console.log(JSON.stringify(receipt));
          }
        }
        else{
          this.setState( {txStatus:'no transaction'});
        }
      }.bind(this));
    }.bind(this),15000);

    return(

          <Layout className="layout">
           <Header>
            <div className="logo" />
              <Menu
                theme="dark"
                mode="horizontal"
                defaultSelectedKeys={['2']}
                style={{ lineHeight: '64px' }}
              >
                <Menu.Item key="1"><Link to={"/about"}>Score Board</Link></Menu.Item>
                <Menu.Item key="2">Main Game</Menu.Item>
                <Menu.Item key="3">Admin</Menu.Item>
              </Menu>
          </Header>
            <Content style={{ padding: '0 50px' }}>
              <Breadcrumb style={{ margin: '16px 0' }}>
                <Breadcrumb.Item>{this.state.txStatus}</Breadcrumb.Item>
              </Breadcrumb>
              <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
              <Payeth pay={this.pay} />
              <p>click to pay</p>
              <Button type="primary" onClick={this.getfirstQuestion}>See first question</Button>
              <p>click to get first questions</p>
              <Button type="primary" onClick={this.getsecondQuestion}>See second question</Button>
              <p>click to get second questions</p>
              <br />
              <Search placeholder="input answer1" enterButton="Submit answer for first question" size="large" onSearch={value => this.onSubmit(value)}/>
              <br />
              <br />
              <Search placeholder="input answer2" enterButton="Submit answer for second question" size="large" onSearch={value => this.onSubmit(value)}/>
              <br />
              <br />
              <Search placeholder="input final answear" enterButton="Final question" size="large" onSearch={value => this.onSubmit(value)}/>
              </div>
            </Content>
              <p>   rules: </p>
            <Footer style={{ textAlign: 'center' }}>
              Ready Player One -- Oasis
            </Footer>
        </Layout>

    );
  }

  constructor(props){
    super(props);
    this.pay = this.pay.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.getfirstQuestion = this.getfirstQuestion.bind(this);
    this.getsecondQuestion = this.getsecondQuestion.bind(this);
    this.state = {
      txStatus:'no transaction',
      txHash: '',
      Admin:''
    }
  }


  async pay(){
    var getData = myContractInstance.payforQuestion.getData();
    await web3.eth.sendTransaction({from: web3.eth.accounts[0], to: contractAddress, data:getData, value:"20000000000000000"},(err, res) =>{
      this.setState({txHash:res, txStatus:'new transaction sent'});
      console.log(res);
    });
      // alert
  }


  async getfirstQuestion(){
      await myContractInstance.getQuestion(1,web3.eth.accounts[0],function(err,result){
         var res = result;
         notification.open({
           message: 'Your first question',
           description:  web3.toAscii(res),
         });
      })
    }

    async getsecondQuestion(){
        await myContractInstance.getQuestion(2,web3.eth.accounts[0],function(err,result){
           var res = result;
           notification.open({
             message: 'Your second question',
             description:  web3.toAscii(res),
           });
        })
      }


    async onSubmit(answer){
      console.log(web3.toHex(answer));
      var getData = myContractInstance.checkAndTakeOwnership.getData(web3.toHex(answer));
      await web3.eth.sendTransaction({from: web3.eth.accounts[0], to: contractAddress, data:getData},(err, res) =>{
        this.setState({txHash:res, txStatus:'new transaction sent'});
        console.log(res);
      });
    }
};

export default App;
