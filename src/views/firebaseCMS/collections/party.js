import {buildCollection, buildSchema} from "@camberi/firecms";

const partySchema = buildSchema({
  name: "Party",
  properties: {
    name: {
      title: "Name",
      dataType: "string",
      validation: {required: true}
    },
    logo: {
      title: "Logo",
      dataType: "string",
      config: {
        storageMeta: {
          mediaType: "image",
          storagePath: "party_logo",
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
  relativePath: "parties",
  schema: partySchema,
  name: "Parties",
  pagination: true
});
