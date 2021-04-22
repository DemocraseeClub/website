import React, {Component} from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';

class ProgressLoading extends Component {
    render() {
        const styles = (this.props.position === 'absolute') ?
            {position:'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}
            :
            {width:'100%', height:'100%', textAlign:'center', margin:'20px auto', justifyContent:'center', alignItems:'center', alignContent:'center'};
        return (
            <div style={styles}><CircularProgress /></div>
        );
    }
}

export default ProgressLoading;
