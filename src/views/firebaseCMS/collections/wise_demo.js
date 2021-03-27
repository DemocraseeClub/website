import { buildCollection, buildSchema } from "@camberi/firecms";

const wisedemoSchema = buildSchema({
    name: "Wise Democracy",
    properties: {
        name: {
            title: "Name",
            dataType: "string",
            validation: {required: true}
        },
        description: {
            title: "Description",
            dataType: "string",
            validation: { required: true },
            config: {
                multiline: true,
            },
        },
        icon: {
            title: "Icon",
            dataType: "string",
            config: {
                storageMeta: {
                    mediaType: "image",
                    storagePath: "topic_icon",
                    acceptedFiles: ["image/*"],
                },
            },
        }
    },
});

export default buildCollection({
    relativePath: "wise_democracy",
    schema: wisedemoSchema,
    name: "Wise Democracy",
    pagination: true
});