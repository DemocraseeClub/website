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

export default (userDB) => {
  
  return buildCollection({
    relativePath: "stakeholders",
    schema: stakeholderSchema,
    name: "Stakeholders",
    pagination: true,
    permissions: ({ user, entity }) => {
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
  });
};