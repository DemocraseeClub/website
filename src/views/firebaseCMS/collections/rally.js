import {buildCollection, buildSchema} from "@camberi/firecms";

import meetingSchema from "./meeting";

export const rallySchema = buildSchema({
    name: "Rally",
    properties: {
        author: {
            title: "User",
            dataType: "reference",
            validation: {required: true},
            collectionPath: "users",
            previewProperties: ["userName"]
        },
        title: {
            title: "Title",
            dataType: "string",
            validation: {required: true},
        },
        description: {
            title: "Description",
            dataType: "string",
            validation: {required: true},
            config: {
                multiline: true,
            },
        },
        summary: {
            title: "Summary",
            dataType: "string",
        },
        picture: {
            title: "Picture",
            dataType: "string",
            config: {
                storageMeta: {
                    mediaType: "image",
                    storagePath: "rally_picture",
                    acceptedFiles: ["image/*"],
                },
            },
        },
        topics: {
            title: "Topics",
            dataType: "array",
            validation: {
                required: true,
                max: 3,
            },

            of: {
                dataType: "reference",
                collectionPath: "topics",
                previewProperties: ["name"],
            },
        },
        wise_demo: {
            title: "Wise Democracy",
            dataType: "array",
            validation: {
                required: true,
                max: 3,
            },
            of: {
                dataType: "reference",
                collectionPath: "wise_democracy",
                previewProperties: ["name"],
            },
        },
        stakeholders: {
            title: "Stakeholders",
            dataType: "array",
            of: {
                dataType: "reference",
                collectionPath: "stakeholders",
                previewProperties: ["name"]
            }
        },
        research: {
            title: "Research JSON",
            dataType: "string",
            config: {multiline: true},
            validation: {}
        },
        promo_video: {
            title: "Promo Video",
            dataType: "string",
            config: {
                storageMeta: {
                    mediaType: "video",
                    storagePath: "promo_video",
                    acceptedFiles: ["video/*"],
                },
            },
        }
    },
});

rallySchema.onPreSave = ({values}) => {
    if (values.research && values.research.trim()) {
        const value = JSON.parse(values.research.trim());

        if (!value)
            throw new Error("This value (Research JSON) must be a valid JSON");

        if (typeof value !== "object")
            throw new Error("This value (Research JSON) must be a valid JSON");
    }
    if (!values.created) values.created = new Date().getTime() / 1000;
    values.modified = new Date().getTime() / 1000;

    return values;
};


export default (userDB) => {
    return buildCollection({
        relativePath: "rallies",
        schema: rallySchema,
        name: "Rallies",
        pagination: true,
        permissions: ({user, rally}) => {
            // let data = getUserData(user.uid);

            // console.error("RALLY PERMISSIONS: " + user.uid, user.toJSON(), data);
            if (userDB?.admin) {
                return {
                    edit: true,
                    create: true,
                    delete: true,
                };
            } else {
                return {
                    edit: true,
                    create: true,
                    delete: true,
                };
            }
        },
        subcollections: [
            buildCollection({
                relativePath: "meetings",
                schema: meetingSchema,
                name: "Meetings",
                pagination: true,
                permissions: ({user, entity}) => {
                    // console.log("MEETING PERMISSIONS", user.toJSON());
                    if (userDB?.admin) {
                        return {
                            edit: true,
                            create: true,
                            delete: true,
                        };
                    } else {
                        return {
                            edit: true,
                            create: true,
                            delete: true,
                        };
                    }
                },
            })
        ]
    })
}
