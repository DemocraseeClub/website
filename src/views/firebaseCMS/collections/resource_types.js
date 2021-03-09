import { buildCollection, buildSchema } from "@camberi/firecms";

const resourceTypeSchema = buildSchema({
  name: "Resource Type",
  properties: {
    type: {
      title: "Type",
      dataType: "string",
      validation: {
        required: true,
        trim: true,
      },
    },
  },
});

export default buildCollection({
  relativePath: "resource_types",
  schema: resourceTypeSchema,
  name: "Resource Types",
  pagination: true
});
