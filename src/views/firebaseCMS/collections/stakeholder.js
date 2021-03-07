import { buildCollection, buildSchema } from "@camberi/firecms";

const stakeholderSchema = buildSchema({
  name: "Stakeholder",
  properties: {
    name: {
      title: "Name",
      dataType: "string",
      validation: {required: true}
    },
    image: {
      title: "Image",
      dataType: "string",
      config: {
        storageMeta: {
          mediaType: "image",
          storagePath: "stakeholder_image",
          acceptedFiles: ["image/*"],
        },
      },
    },
    
  },
});

export default buildCollection({
  relativePath: "stakeholders",
  schema: stakeholderSchema,
  name: "Stakeholders",
});
