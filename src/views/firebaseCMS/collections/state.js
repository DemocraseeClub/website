import { buildCollection, buildSchema } from "@camberi/firecms";

const stateSchema = buildSchema({
  name: "State",
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
          storagePath: "state_icon",
          acceptedFiles: ["image/*"],
          
        },
      },
    },
    website: {
        title: "Website",
        dataType: "string",
        validation: {
            url: true
        },
        config: {
            url: true
        }
    }
  },
});

export default buildCollection({
  relativePath: "states",
  schema: stateSchema,
  name: "States",
  pagination: true
});
