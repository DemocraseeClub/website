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


export default (userDB) => {
  return buildCollection({
    relativePath: "parties",
    schema: partySchema,
    name: "Parties",
    pagination: true,
     permissions: ({ user, entity }) => {
   
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