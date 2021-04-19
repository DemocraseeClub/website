import React, {Component} from "react"
import {convertFromHTML, convertToRaw} from "draft-js"
import {BLOCK_TYPE, DraftailEditor, ENTITY_TYPE, INLINE_STYLE} from "draftail"
// import LinkSource from "../Draftail/sources/LinkSource";
// import {NavLink} from "react-router-dom";

const initial = JSON.parse(sessionStorage.getItem("draftail:content"))

const onSave = (content) => {
    console.log("saving", content)
    sessionStorage.setItem("draftail:content", JSON.stringify(content))
}

const importerConfig = {
    htmlToEntity: (nodeName, node, createEntity) => {
        // a tags will become LINK entities, marked as mutable, with only the URL as data.
        if (nodeName === "a") {
            return createEntity(ENTITY_TYPE.LINK, "MUTABLE", { url: node.href })
        }

        if (nodeName === "img") {
            return createEntity(ENTITY_TYPE.IMAGE, "IMMUTABLE", {
                src: node.src,
            })
        }

        if (nodeName === "hr") {
            return createEntity(ENTITY_TYPE.HORIZONTAL_RULE, "IMMUTABLE", {})
        }

        return null
    },
    htmlToBlock: (nodeName) => {
        if (nodeName === "hr" || nodeName === "img") {
            // "atomic" blocks is how Draft.js structures block-level entities.
            return "atomic"
        }

        return null
    },
}

export default class Drafter extends Component {
    constructor(props) {
        super(props);
    }

    fromHTML(html) {
        return convertToRaw(convertFromHTML(importerConfig)(html));
    }

    onSave (content) {
        console.log("saving", content)
        sessionStorage.setItem("draftail:content", JSON.stringify(content))
    }

    render() {
        return <DraftailEditor
            rawContentState={initial || null}
            enableHorizontalRule
            onSave={e => this.onSave(e)}
            blockTypes={[
                { type: BLOCK_TYPE.HEADER_THREE },
                { type: BLOCK_TYPE.UNORDERED_LIST_ITEM },
            ]}
            inlineStyles={[{ type: INLINE_STYLE.BOLD }, { type: INLINE_STYLE.ITALIC }]}
        />
    }
}
