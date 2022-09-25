import {connect} from 'react-redux';
import {checkWalletBalance, makeWalletDeposit, makeWalletWithdrawal} from '../../redux/walletReducer';
import {loadFaq} from '../../redux/helpReducer';
import CreditCard from './CreditCard';
//import { withSnackbar } from 'notistack';

const mapStateToProps = (state) => {
 var newState = {me:state.auth.me, wallet:state.wallet};
 return newState;
};

const mapDispatchToProps = dispatch => {
 return {
  checkWalletBalance: () => {
   dispatch(checkWalletBalance());
  },
  makeWalletWithdrawal: (obj) => {
   dispatch(makeWalletWithdrawal(obj));
  },
  makeWalletDeposit: (obj) => {
   dispatch(makeWalletDeposit(obj));
  },
  loadFaq : (nid, ctx) => {
   dispatch(loadFaq(nid, ctx));
  }
  // , dispatch
 };
};

export default connect(
 mapStateToProps,
 mapDispatchToProps
//)(withSnackbar(CreditCard));
)(CreditCard);
