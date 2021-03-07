import { buildCollection, buildSchema } from "@camberi/firecms";

const topicSchema = buildSchema({
  name: "Topic",
  properties: {
    name: {
      title: "Name",
      dataType: "string",
      validation: {required: true}
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
    },
    photo: {
      title: "Photo",
      dataType: "string",
      config: {
        storageMeta: {
          mediaType: "image",
          storagePath: "topic_photo",
          acceptedFiles: ["image/*"],
        },
      },
    },
  },
});

export default buildCollection({
  relativePath: "topics",
  schema: topicSchema,
  name: "Topics",
});
