import { buildCollection, buildSchema } from "@camberi/firecms";

const rallySchema = buildSchema({
  name: "Rally",
  properties: {
    title: {
      title: "Title",
      dataType: "string",
      validation: { required: true },
    },
    description: {
      title: "Description",
      dataType: "string",
      validation: { required: true },
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
    }
  },
});

export default buildCollection({
  relativePath: "rallies",
  schema: rallySchema,
  name: "Rallies",
});
