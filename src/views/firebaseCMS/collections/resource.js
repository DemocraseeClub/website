import { buildCollection, buildSchema } from "@camberi/firecms";

const resourceSchema = buildSchema({
  name: "Resource",
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
      validation: {
        required: true,
        trim: true,
      },
    },
    descriptionHTML: {
      title: "Description HTML",
      dataType: "string",
      validation: {
        required: false,
      },
      config: {
        multiline: true,
      },
    },
    image: {
      title: "Image",
      dataType: "string",
      validation: { required: true },
      config: {
        storageMeta: {
          mediaType: "image",
          storagePath: "resource_image",
          acceptedFiles: ["image/*"],
        },
      },
    },
    postalAddress: {
      title: "Postal Address",
      dataType: "string",
    },
    price_ccoin: {
      title: "Price (citizencoin)",
      dataType: "number",
      validation: {
        required: false,
        positive: true,
      },
    },
    resource_type: {
      title: "Resource Type",
      dataType: "reference",
      collectionPath: "resource_types",
      previewProperties: ["type"],
    },
  },
});

export default buildCollection({
  relativePath: "resources",
  schema: resourceSchema,
  name: "Resources",
  pagination: true
});
