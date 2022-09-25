import API from '../Util/API';
import {_showNotice} from './formsReducer';
import {getIdbySegment} from "../Util/WindowUtils";
import {playlistPurchased} from './playerReducer';

const TRANSFER_STARTED = 'TRANSFER_STARTED';
const TRANSFER_SUCCESS = 'TRANSFER_SUCCESS';
const TRANSFER_FAILURE = 'TRANSFER_FAILURE';
const TRANSFER_ADDFUNDS = 'TRANSFER_ADDFUNDS';
const TRANSFER_CLOSEWALLET = 'TRANSFER_CLOSEWALLET';
const TRANSFER_SETVALUE = 'TRANSFER_SETVALUE';
const TRANSFER_SHOWDIALOG = 'TRANSFER_SHOWDIALOG';

function transferStart() {
 return {
  type: TRANSFER_STARTED
 };
}

function transferSuccess(payload) {
 return {
  type: TRANSFER_SUCCESS,
  wallet: payload
 };
}

export function transferFailure(err) {
 return {
  type: TRANSFER_FAILURE,
  error: err
 };
}

export function showWagerContract(gc, ctx) {
 return {
  type: TRANSFER_SHOWDIALOG,
  gc: gc,
  ctx: ctx
 };
}

export function requestDeposit(amt, reason) {
 return {
  type: TRANSFER_ADDFUNDS,
  amount: amt,
  reason: reason
  //, callback : clk,
 };
}

export function setWalletBalance(balance) {
 return {
  type: TRANSFER_SETVALUE,
  balance: balance
 };
}

export function closeWallet() {
 return {
  type: TRANSFER_CLOSEWALLET
 };
}

export function sendTransfer(obj) {
 return (dispatch, getState) => {
  var state = getState();
  if (state.wallet.loading === true) return false;

  if (state.wallet.balance.usd < obj.amount) { // < res.data.amount
   var diff = parseFloat(obj.amount - state.wallet.balance.usd).toFixed(2);
   return dispatch(requestDeposit(diff, 'Insufficient Funds. Please deposit at least $' + diff));
  }

  dispatch(transferStart());

  return API.Post("/forms/wallet/transfer", obj).then((res) => {
   var msg = API.checkError(res.data);
   if (msg.length > 0) {
    dispatch(transferFailure(msg));
   } else {
    dispatch(transferSuccess(res.data));
    dispatch(_showNotice('Funds transfer successful', 'success'));
   }
  }).catch((err) => {
   var msg = API.getErrorMsg(err);
   console.log('token check error: ', msg);
   dispatch(transferFailure(msg));
   return err;
  });
 };
}

export function placeWager(gcid, amt, currency) {
 return (dispatch, getState) => {

  var state = getState();
  if (state.wallet.loading === true) return false;

  var obj = {currency: currency, amount: amt}; // amount is always take from playlist buyin value on server

  if (currency === 'USD') {
   let diff = parseFloat(obj.amount - state.wallet.balance.usd).toFixed(2);
   if (typeof state.auth.me.profile.roles['verified_cc'] !== 'number') { // < cover $20 if verified
    return dispatch(requestDeposit(diff, 'You must have a verified payment method to play. Please deposit at least ' + diff + '. You may withdraw all funds from your wallet per our Wallet Withdrawal Policy'));
   }
   if (diff < -20) { // < cover $20 if verified
    return dispatch(requestDeposit(diff, 'Insufficient Funds. Please deposit at least $' + diff));
   }
  } else if (state.wallet.balance.tac < obj.amount) { // < cover $20 if verified
   return dispatch(_showNotice('You need ₮' + (obj.amount - state.wallet.balance.tac).toFixed(2) + ' more. You can pay in $USD or earn ₮AC by rating and curating music in any playlist', 'error'));
  }

  dispatch(transferStart());

  const tdata = getIdbySegment(document.location.pathname);
  tdata.verb = 'paid-failed';
  tdata.tid = gcid;
  tdata.value = amt;
  tdata.currency = currency;
  tdata.uid = state.auth.me.profile.uid[0].value;
  if (!tdata.gid && state.auth.me.brandId) tdata.gid = state.auth.me.brandId;

  return API.Post("/forms/wallet/" + gcid + "/bet", obj).then((res) => {
   var msg = API.checkError(res.data);
   if (msg.length > 0) {
    dispatch(transferFailure(msg));
   } else {
    dispatch(transferSuccess(res.data));
    dispatch(playlistPurchased(res.data));
    if (currency === 'USD') {
     dispatch(_showNotice('$' + obj.amount + ' paid. Share the playlist to help raise the minimum pool.', 'warning'));
    } else {
     dispatch(_showNotice('₮' + obj.amount + ' (Credibility) has been traded for your bet. Share the playlist to help raise the minimum pool.', 'warning'));
    }
    if (state.wallet.ctx === 'confirmwager') {
     dispatch(closeWallet(res.data));
    }
    tdata.verb = 'paid';
   }
   window.logUse.logEvent('wager', tdata);
  }).catch((err) => {
   var msg = API.getErrorMsg(err);
   console.log('token check error: ', msg);
   dispatch(transferFailure(msg));
   window.logUse.logEvent('wager', tdata);
   return err;
  });
 };
}

export function makeWalletWithdrawal(obj) {
 return (dispatch, getState) => {
  var state = getState();
  if (state.wallet.loading === true) return false;

  if (state.wallet.balance.usd < obj.amount) { // < res.data.amount
   var diff = parseFloat(obj.amount - state.wallet.balance.usd).toFixed(2);
   return dispatch(requestDeposit(obj.amount - state.wallet.balance.usd, 'Insufficient $' + diff));
  }

  dispatch(transferStart());

  return API.Post("/forms/wallet/withdraw", obj).then((res) => {
   var msg = API.checkError(res.data);
   if (msg.length > 0) {
    dispatch(transferFailure(msg));
   } else {
    dispatch(transferSuccess(res.data));
    dispatch(_showNotice('Withdrawal successful', 'warning'));
   }

   const tdata = getIdbySegment(document.location.pathname);
   tdata.verb = msg.length > 0 ? 'withdrawal-failed' : 'withdrawal';
   tdata.value = obj.amount;
   tdata.currency = obj.currency;
   tdata.dom_ref = state.wallet.ctx;
   tdata.uid = state.auth.me.profile.uid[0].value;
   if (!tdata.gid && state.auth.me.brandId) tdata.gid = state.auth.me.brandId;
   if (state.wallet.gc) {
    tdata.tid = state.wallet.gc.get('id');
    tdata.pid = state.wallet.gc.get('field_playlist_gc', 'target_id');
    tdata.gid = state.wallet.gc.get('gid', 'target_id');
   }
   window.logUse.logEvent('transaction', tdata);

  }).catch((err) => {
   var msg = API.getErrorMsg(err);
   console.log('token check error: ', msg);
   dispatch(transferFailure(msg));
   return err;
  });
 };
}

export function makeWalletDeposit(obj) {
 return (dispatch, getState) => {
  var state = getState();
  if (state.wallet.loading === true) return false;

  dispatch(transferStart());

  return API.Post("/forms/wallet/deposit", obj).then((res) => {
   var msg = API.checkError(res.data);
   if (msg.length > 0) {
    dispatch(transferFailure(msg));
   } else {
    if (state.wallet.ctx === 'confirmwager' || state.wallet.ctx === 'managefunds') {
     dispatch(closeWallet(res.data));
    }
    dispatch(transferSuccess(res.data));
    dispatch(_showNotice('Deposit successful'));
   }

   const tdata = getIdbySegment(document.location.pathname);
   tdata.verb = msg.length > 0 ? 'deposit-failed' : 'deposited';
   tdata.value = obj.amount;
   tdata.currency = obj.currency;
   tdata.dom_ref = state.wallet.ctx;
   tdata.uid = state.auth.me.profile.uid[0].value;
   if (!tdata.gid && state.auth.me.brandId) tdata.gid = state.auth.me.brandId;
   if (state.wallet.gc) {
    tdata.tid = state.wallet.gc.get('id');
    tdata.pid = state.wallet.gc.get('field_playlist_gc', 'target_id');
    tdata.gid = state.wallet.gc.get('gid', 'target_id');
   }
   window.logUse.logEvent('transaction', tdata);

  }).catch((err) => {
   var msg = API.getErrorMsg(err);
   console.log('token check error: ', msg);
   dispatch(transferFailure(msg));
   return err;
  });
 };
}

export function checkWalletBalance() {
 return (dispatch, getState) => {
  var state = getState();
  if (state.wallet.loading === true) return false;

  dispatch(transferStart());

  return API.Get("/forms/wallet/balance").then((res) => {
   var msg = API.checkError(res.data);
   if (msg.length > 0) {
    dispatch(transferFailure(msg));
   } else {
    dispatch(transferSuccess(res.data));
   }
  }).catch((err) => {
   var msg = API.getErrorMsg(err);
   console.log('token check error: ', msg);
   dispatch(transferFailure(msg));
   return err;
  });
 };
}

const initialState = {
 balance: {usd: 0, tac: 0, preauth: 0},
 loading: false,
 error: false,
 ctx: false, // this reducer hsa multiple ctx names, rather than just 'dialog'
 cartValue: false,
 reason: false,
 gc: false // group_content item (used for DialogView )
};

const walletReducer = (draft = initialState, action) => {
 draft.loading = false; // default except when started
 switch (action.type) {

  case TRANSFER_STARTED:
   draft.error = false;
   draft.loading = true;
   return draft;
  case TRANSFER_SUCCESS:
   draft.error = false;
   if (typeof action.wallet.usd === 'number') {
    draft.balance = action.wallet;
   }
   return draft;
  case TRANSFER_FAILURE:
   draft.error = action.error;
   return draft;
  case TRANSFER_CLOSEWALLET:
   draft.error = false;
   //draft.cartValue = false;
   draft.reason = false;
   //draft.callback = false;
   draft.gc = false;
   draft.ctx = false;
   return draft;
  case TRANSFER_SHOWDIALOG:
   draft.gc = action.gc;
   draft.ctx = action.ctx;
   return draft;
  case TRANSFER_SETVALUE:
   for (var i in action.balance) {
    draft.balance[i] = action.balance[i];
   }
   return draft;
  case TRANSFER_ADDFUNDS:
   draft.ctx = 'managefunds';
   draft.cartValue = action.amount;
   draft.reason = action.reason;
   //draft.callback = action.callback;
   return draft;
  default:
   return draft;

 }
};

export default walletReducer;
