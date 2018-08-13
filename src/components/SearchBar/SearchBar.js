import React, { Component } from 'react';
import Loading from '../Loading/Loading';
import Resolver from './Resolver/Resolver';
import IPFS from './IPFS/IPFS';
import {getResolver, getOwner} from '../../lib/registryService';
import {getContent} from '../../lib/resolverService';
import {fromContentHash} from '../../helpers/ipfsHelper';
import './SearchBar.css';

class SearchBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isKeyDown: false,
      isOpenResolver: false,
      isOpenIPFS: false,
      searchValue : "",
      owner: "",
      resolver: "",
      ipfsHash: ""
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSearchItem = this.handleSearchItem.bind(this);
    this.handleSearchData = this.handleSearchData.bind(this);
    this.handleSearchItemClick = this.handleSearchItemClick.bind(this);
    this.handleLoadingClose = this.handleLoadingClose.bind(this);
  }

  handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value.toLowerCase() });
  }

  handleSearchItem = (e) => {
    if(this.state.isKeyDown) return;
    if(e.keyCode !== 13) return;
    this.handleSearchData();
  }

  handleSearchData = async () => {
    this.props.handleWarningClose();
    const keydomain = this.state.searchValue.toLowerCase().split(".eth");
    if (keydomain[keydomain.length - 1] !== "") {
      this.props.handleWarningOpen("ENS format error");
      return;
    }
    const domain = keydomain[keydomain.length - 2].split(".");
    const seachdamain = domain[domain.length-1];
    if (seachdamain.length < 7) {
      this.props.handleWarningOpen("ENS has the minimum character length of 7");
      return;
    }
    this.setState({isKeyDown: true, isOpenResolver: false, isOpenIPFS: false, ipfsHash: "", owner: "", resolver: ""})
    const resolver = await getResolver(this.state.searchValue);
    const owner = await getOwner(this.state.searchValue);
    let ipfsHash = "";
    this.setState({resolver, owner});
    if (resolver !== '0x0000000000000000000000000000000000000000') {
      ipfsHash = await getContent(this.state.searchValue, resolver);
      this.setState({owner, getResolver});
      if (owner !== '0x0000000000000000000000000000000000000000' && 
        owner === this.props.metaMask.account) {
        this.setState({isOpenIPFS: true})
      }
      if (ipfsHash !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
        this.setState({ipfsHash: fromContentHash(ipfsHash)});
      }
    }
    if (owner === '0x0000000000000000000000000000000000000000') {
      this.props.handleWarningOpen('This ENS is OPEN for bid!');
    }
    this.setState({isOpenResolver: true});
    this.handleLoadingClose();
  }

  handleLoadingClose = () => {
    this.setState({isKeyDown: false});
  }
  
  handleSearchItemClick = () => {
    if(this.state.isKeyDown) return;
    this.handleSearchData();
  }

  render() {
    return (
      <div className="ethereum">
        <h1>ENS RESOLVER MANAGER</h1>
        <div className="search">
          <input type="text" 
            onKeyDown={this.handleSearchItem} 
            name="searchValue"
            value={this.state.searchValue}
            onChange={this.handleInputChange}
            placeholder="ethereum.eth"
          />
          <a 
            onClick={this.handleSearchItemClick} 
            className="search_icon"
          ></a>
        </div>
        { this.state.isKeyDown && <Loading/> }
        { this.state.isOpenResolver && <Resolver {...this.props} {...this.state}/> }
        { this.state.isOpenIPFS && <IPFS {...this.props} {...this.state}/> }
      </div>
    );
  }
}

export default SearchBar;