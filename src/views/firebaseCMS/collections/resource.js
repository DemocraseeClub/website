import { buildCollection, buildSchema } from "@camberi/firecms";

const resourceSchema = buildSchema({
  name: "Resource",
  properties: {
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
        required: true,
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
        required: true,
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

export default (userDB) => {

  return buildCollection({
     relativePath: "resources",
     schema: resourceSchema,
     name: "Resources",
     pagination: true,
     permissions: async ({ user, entity }) => {

       if(userDB?.admin) {
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
   })
 }