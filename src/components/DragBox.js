import React, {Component} from 'react';
import DragIcon from '@material-ui/icons/OpenWith';
import Draggable from 'react-draggable';
import Paper from '@material-ui/core/Paper';

function PaperComponent(props) {
    return (
        <Draggable handle={`#${props.domId}-draggable-title`} cancel={'[class*="MuiDialogContent-root"]'} >
            <Paper {...props} elevation={3} />
        </Draggable>
    );
}

class DragBox extends Component {

    render() {
        return (
            <PaperComponent style={{maxWidth:300, zIndex:9999}} domId={this.props.domId}>
                <div id={`${this.props.domId}-draggable-title`} style={{textAlign:'center', background:'#B9DFF4', padding:3, display:'flex', justifyContent:'space-between'}}>
                    <small style={{color:'#000'}}>{this.props.domId}</small>
                    <DragIcon size={'small'} />
                </div>
                {this.props.children}
            </PaperComponent>
        );
    }
}

export default DragBox;
