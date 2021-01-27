import React, {Component} from 'react';
import DragIcon from '@material-ui/icons/OpenWith';
import Draggable from 'react-draggable';
import Paper from '@material-ui/core/Paper';

function PaperComponent(props) {
    return (
        <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'} style={{zIndex:9999}}>
            <Paper {...props} elevation={3} />
        </Draggable>
    );
}

class DragBox extends Component {

    render() {
        return (
            <PaperComponent style={{maxWidth:300, zIndex:9999}}>
                <div id='draggable-dialog-title' style={{textAlign:'center', background:'#B9DFF4', paddingTop:2, paddingBottom:2}}>
                    <DragIcon size={'small'} />
                </div>
                {this.props.children}
            </PaperComponent>
        );
    }
}

export default DragBox;
