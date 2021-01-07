/* eslint-disable react/no-multi-comp */
import React, {Component} from 'react';
import {ContentState, EditorState, convertFromHTML} from 'draft-js';
import Editor, {createEditorStateWithText} from 'draft-js-plugins-editor';
import {
    ItalicButton,
    BoldButton,
    UnderlineButton,
    CodeButton,
    UnorderedListButton,
    OrderedListButton,
    BlockquoteButton
} from 'draft-js-buttons';
import createLinkPlugin from 'draft-js-anchor-plugin';
import createInlineToolbarPlugin from 'draft-js-inline-toolbar-plugin';
// import createToolbarPlugin from 'draft-js-static-toolbar-plugin';

import {stateToHTML} from 'draft-js-export-html';
import editorStyles from '../theme/editorStyles.css';

export default class HtmlEditor extends Component {

    constructor(p) {
        super(p);
        if (p.html && p.html.length > 0) {
            this.state = {
                editorState : EditorState.createWithContent(ContentState.createFromBlockArray(convertFromHTML(p.html)))
            }
        } else {
            this.state = {
                editorState: createEditorStateWithText('')
            };
        }
        
        const linkPlugin = createLinkPlugin({
            placeholder: 'https://…'
        });

        // const toolbarPlugin = createToolbarPlugin({
        const toolbarPlugin = createInlineToolbarPlugin({
            structure: [
                ItalicButton,
                BoldButton,
                UnderlineButton,
                CodeButton,
                UnorderedListButton,
                OrderedListButton,
                BlockquoteButton,
                linkPlugin.LinkButton
            ]
        });
        this.PluginComponents = {
            InlineToolbar: toolbarPlugin.InlineToolbar,
            LinkButton : linkPlugin.LinkButton
        };
        // const { Toolbar } = toolbarPlugin;
        // const { InlineToolbar } = toolbarPlugin;
        this.plugins = [toolbarPlugin, linkPlugin];
    }

    onChange = (editorState) => {
        this.setState({editorState});
        var html = stateToHTML(editorState.getCurrentContent());
        this.props.onChange(html);
    };

    focus = () => {
        this.editor.focus();
    };

    render() {
        const { InlineToolbar, LinkButton } = this.PluginComponents;
        return (
            <div className='editor' onClick={this.focus} >
                <Editor
                    editorState={this.state.editorState}
                    onChange={this.onChange}
                    plugins={this.plugins}
                    ref={(element) => {
                        this.editor = element;
                    }}
                />
                <InlineToolbar className='editorToolbar'>
                    {
                        (externalProps) => {
                            return (<div>
                                <BoldButton {...externalProps} />
                                <ItalicButton {...externalProps} />
                                <UnderlineButton {...externalProps} />
                                <CodeButton {...externalProps} />
                                <UnorderedListButton {...externalProps} />
                                <OrderedListButton {...externalProps} />
                                <BlockquoteButton {...externalProps} />
                                <LinkButton {...externalProps} />
                            </div>)
                        }
                    }
                </InlineToolbar>
            </div>
        );
    }
}
