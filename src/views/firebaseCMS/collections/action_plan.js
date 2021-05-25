import {buildCollection, buildSchema} from "@camberi/firecms";

const actionPlanSchema = buildSchema({
    name: "Action Plan",
    properties: {
        author: {
            title: "User",
            dataType: "reference",
            validation: {required: true},
            collectionPath: "users",
            previewProperties: ["userName"]
        },
        title: {
            title: "Tilte",
            dataType: "string",
        },
        recommendation: {
            title: "Recommendation",
            dataType: "string",
            config: {
                multine: true
            }
        },
        exe_summary: {
            title: "Executive Summary",
            dataType: "string",
            config: {
                multiline: true
            }
        },
        analysis: {
            title: "Analisis and Policy Alternatives / Proposal",
            dataType: "string",
            config: {
                multiline: true
            }
        },
        background: {
            title: "Background / Legislative History / Problem Statemenet",
            dataType: "string",
            config: {
                multiline: true
            }
        },
        coAuthors: {
            title: "Co-Authors",
            dataType: "array",
            of: {
                dataType: "reference",
                collectionPath: "users",
                previewProperties: ["userName"]
            }
        },
        proArgument: {
            title: "Pro Argument",
            dataType: "string",
            config: {
                multine: true
            }
        },
        conArgument: {
            title: "Con Argument",
            dataType: "string",
            config: {
                multiline: true
            }
        },
        prequesites: {
            title: "Prequesites",
            dataType: "string",
            validation: {required: true},
            config: {
                multiline: true
            }
        },
        timeline: {
            tilte: "Timeline",
            dataType: "string",
            config: {
                multiline: true
            }
        },
        rally: {
            title: "Rally",
            dataType: "reference",
            collectionPath: "rallies",
            previewProperties: ["title", "picture"]
        }

    },
});

actionPlanSchema.onPreSave = ({ values }) => {

    if (!values.created) values.created = new Date().getTime() / 1000;
    values.modified = new Date().getTime() / 1000;

    return values;
};

export default (userDB) => {
    return buildCollection({
        relativePath: "action_plans",
        schema: actionPlanSchema,
        name: "Action Plans",
        pagination: true,
        permissions: ({user, entity}) => {

            if (userDB?.admin) {
                return {
                    edit: true,
                    create: true,
                    delete: true,
                };
            } else {
                return {
                    edit: false,
                    create: false,
                    delete: false,
                };
            }
        },
    })
}
