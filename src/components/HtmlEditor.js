/* eslint-disable react/no-multi-comp */
import React, {Component} from 'react';
import {ContentState, EditorState, convertFromHTML} from 'draft-js';
import Editor, {createEditorStateWithText, composeDecorators} from 'draft-js-plugins-editor';
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
import createToolbarPlugin from 'draft-js-static-toolbar-plugin';
import createImagePlugin from 'draft-js-image-plugin';
import {stateToHTML} from 'draft-js-export-html';
import editorStyles from '../theme/editorStyles.css';
import createAlignmentPlugin from 'draft-js-alignment-plugin';
import InsertPhoto from '@material-ui/icons/InsertPhoto';
import Button from "@material-ui/core/Button";

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

        const alignmentPlugin = createAlignmentPlugin();
        const linkPlugin = createLinkPlugin({placeholder: 'https://…'});

        const decorator = composeDecorators(
            // resizeablePlugin.decorator,
            alignmentPlugin.decorator,
            // focusPlugin.decorator,
            // blockDndPlugin.decorator
        );
        const imagePlugin = createImagePlugin({ decorator });

        const config = {
            structure: [
                ItalicButton,
                BoldButton,
                UnderlineButton,
                CodeButton,
                UnorderedListButton,
                OrderedListButton,
                BlockquoteButton,
                linkPlugin.LinkButton,
                imagePlugin.addImage
            ]
        };
        const toolbarPlugin = (p.toolbar === 'inline') ? createInlineToolbarPlugin(config) : createToolbarPlugin(config);
        this.PluginComponents = {
            InlineToolbar:  (p.toolbar === 'inline') ? toolbarPlugin.InlineToolbar : toolbarPlugin.Toolbar,
            LinkButton : linkPlugin.LinkButton,
            AddImage : imagePlugin.addImage,
            AlignmentTool : alignmentPlugin.AlignmentTool
        };
        this.plugins = [toolbarPlugin, linkPlugin, alignmentPlugin, imagePlugin];
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
        const { InlineToolbar, LinkButton, AddImage } = this.PluginComponents;
        return (
            <fieldset className="editor MuiOutlinedInput-notchedOutline">
                <legend>
                    <span>{this.props.label}</span>
                </legend>
                <div onClick={this.focus} >
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
                                return (<React.Fragment>
                                    <BoldButton {...externalProps} />
                                    <ItalicButton {...externalProps} />
                                    <UnderlineButton {...externalProps} />
                                    <CodeButton {...externalProps} />
                                    <UnorderedListButton {...externalProps} />
                                    <OrderedListButton {...externalProps} />
                                    <BlockquoteButton {...externalProps} />
                                    <LinkButton {...externalProps} />
                                    <InsertPhoto {...externalProps} />
                                </React.Fragment>)
                            }
                        }
                    </InlineToolbar>
                    <Button
                        editorState={this.state.editorState}
                        onChange={this.onChange}
                        modifier={AddImage}
                    >Add Image</Button>
                </div>
            </fieldset>
        );
    }
}
