/* eslint-disable react/no-multi-comp */
import React, {Component} from 'react';
import {ContentState, EditorState, convertFromHTML} from 'draft-js';
import Editor, {createEditorStateWithText, composeDecorators} from '@draft-js-plugins/editor';

import createLinkPlugin from '@draft-js-plugins/anchor';
import createToolbarPlugin from '@draft-js-plugins/static-toolbar';
import createImagePlugin from '@draft-js-plugins/image';
import createFocusPlugin from '@draft-js-plugins/focus';
import createAlignmentPlugin from '@draft-js-plugins/alignment';
import createVideoPlugin from '@draft-js-plugins/video';
import createBlockDndPlugin from '@draft-js-plugins/drag-n-drop';
import createDragNDropUploadPlugin from '@draft-js-plugins/drag-n-drop-upload';
import createResizeablePlugin from '@draft-js-plugins/resizeable';
import {ItalicButton, BoldButton, UnderlineButton, CodeButton, UnorderedListButton, OrderedListButton, BlockquoteButton} from '@draft-js-plugins/buttons';
import {stateToHTML} from 'draft-js-export-html';

import '@draft-js-plugins/static-toolbar/lib/plugin.css';
import '@draft-js-plugins/anchor/lib/plugin.css';
import '@draft-js-plugins/alignment/lib/plugin.css';
import '@draft-js-plugins/image/lib/plugin.css';

import editorStyles from '../theme/editorStyles.module.css';
import ImageForm from "./ImageForm";
import DocForm from "./DocsForm";
import MockUpload from "./MockUpload";

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

        const resizeablePlugin = createResizeablePlugin();
        const alignmentPlugin = createAlignmentPlugin();
        const focusPlugin = createFocusPlugin();
        const blockDndPlugin = createBlockDndPlugin();

        const linkPlugin = createLinkPlugin({placeholder: 'https://…', linkTarget: '_blank'});

        const decorators = composeDecorators(
            resizeablePlugin.decorator,
            alignmentPlugin.decorator,
            focusPlugin.decorator,
            blockDndPlugin.decorator
        );
        const videoPlugin = createVideoPlugin(decorators);
        const imagePlugin = createImagePlugin(decorators);
        const toolbarPlugin = createToolbarPlugin();

        const dragNDropFileUploadPlugin = createDragNDropUploadPlugin({
            handleUpload: MockUpload,
            addImage: imagePlugin.addImage,
        });

        this.PluginComponents = {
            Toolbar:  toolbarPlugin.Toolbar,
            LinkButton : linkPlugin.LinkButton,
            AddImage : imagePlugin.addImage,
            AddVideo : videoPlugin.addVideo,
            AlignmentTool : alignmentPlugin.AlignmentTool
        };

        this.plugins = [
            toolbarPlugin,
            linkPlugin,
            alignmentPlugin,
            focusPlugin,
            resizeablePlugin,

            dragNDropFileUploadPlugin,
            blockDndPlugin,

            imagePlugin,
            videoPlugin
        ];
        this.editor = null;

        this.onFocus = this.onFocus.bind(this);
    }

    getYtId(url){
        url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
        return (url[2] !== undefined) ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
    }

    onChange = (editorState) => {
        this.setState({editorState});
        let options = {
            entityStyleFn: (entity) => {
                const entityType = entity.get('type').toLowerCase();
                /* if (entityType === 'link') {
                    const data = entity.getData();
                    return {
                        element: 'a',
                        attributes: {
                            href: data.href,
                            target:'_blank'
                        },
                    };
                } else */ if (entityType === 'image') {
                    const data = entity.getData();
                    return {
                        element: 'img',
                        attributes: {
                            src: data.src
                        },
                        style: {
                            width:'100%'
                        },
                    };
                } else if (entityType === 'draft-js-video-plugin-video') {
                    const data = entity.getData();
                    if (data.src.indexOf('youtube.com')) {
                        return {
                            element: 'iframe',
                            attributes: {
                                src: "https://www.youtube.com/embed/"+ this.getYtId(data.src)
                            },
                        };
                    } else {
                        return {
                            element: 'video',
                            attributes: {
                                src: data.src,
                            },
                        };
                    }

                }
            },
        };
        var html = stateToHTML(editorState.getCurrentContent(), options);
        this.props.onChange(html);
    };

    onFocus = (e) => {
        if (e.target.className === 'DraftEditor-root') {
            this.editor.focus();
        }
    };

    /* setEditorState(insertImage(data.file)) //created below
    insertImage( url ) {
        const contentState = this.state.editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity('IMAGE', 'IMMUTABLE', { src: url })
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const newEditorState = EditorState.set( this.state.editorState, { currentContent: contentStateWithEntity });
        this.onChange(AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, '')) // Update the editor state
    };
     */

    render() {
        const { Toolbar, LinkButton, AddImage, AddVideo, AlignmentTool } = this.PluginComponents;
        return (
            <fieldset className={editorStyles.editor} >
                <legend>
                    <span>{this.props.label}</span>
                </legend>
                <div onClick={this.onFocus} >
                    <Editor
                        editorState={this.state.editorState}
                        onChange={this.onChange}
                        plugins={this.plugins}
                        ref={(element) => { this.editor = element; }}
                    />
                    <Toolbar className={editorStyles.editorToolbar}>
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
                                    <ImageForm
                                        editorState={this.state.editorState}
                                        onChange={this.onChange}
                                        modifier={AddImage}
                                        type='image'
                                    />
                                    <ImageForm
                                        editorState={this.state.editorState}
                                        onChange={this.onChange}
                                        modifier={AddVideo}
                                        type='video' />
                                    <DocForm
                                        editorState={this.state.editorState}
                                        onChange={this.onChange}
                                        modifier={AddImage}
                                    />
                                    <AlignmentTool {...externalProps} />
                                </React.Fragment>)
                            }
                        }
                    </Toolbar>
                </div>
            </fieldset>
        );
    }
}
