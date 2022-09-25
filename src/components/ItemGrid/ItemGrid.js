import React, {Component} from 'react';
import Drupal2Json from '../../Util/Drupal2Json';
import RallyItem from "../RallyItem";
import ResourceItem from "../ResourceItem";

import Masonry from "react-masonry-css";


const breakpoints = {
    default: 3,
    900: 2,
    600: 1,
};

class ItemGrid extends Component {

    render() {
        if (!this.props.lData) return '';
        if (this.props.lData.data.length === 0) return 'no content';

        var list = [];

        for (var f in this.props.lData.data) {
            var item = this.props.lData.data[f];
            var json = new Drupal2Json(item);
            var type = json.get('type', 'target_id');
            var canEdit = (this.props.me.profile && json.canEdit(this.props.me.profile));

            if (type === 'rallies') {
                if (canEdit === false && this.props.me.profile) canEdit = json.isGroupAdmin(this.props.me);
                list.push(<div key={type + '_' + f}><RallyItem data={item} me={this.props.me}
                                                               dispatch={this.props.dispatch}/></div>);
            } else if (type === 'resources') {
                if (canEdit === false && this.props.me.profile) canEdit = json.isGroupAdmin(this.props.me);
                list.push(<div key={type + '_' + f}><ResourceItem data={item} me={this.props.me}
                                                                  dispatch={this.props.dispatch}/></div>);
            }
        }

        return <Masonry
            breakpointCols={breakpoints}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
        >
            {list}
        </Masonry>
    }
}

export default ItemGrid;
