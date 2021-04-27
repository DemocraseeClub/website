import {buildCollection, buildSchema} from "@camberi/firecms";

const resourceTypeSchema = buildSchema({
  name: "Resource Type",
  properties: {
    type: {
      title: "Type",
      dataType: "string",
      validation: {
        required: true,
        trim: true,
      }
    }
  }
});


export default (userDB) => {
  return buildCollection({
    relativePath: "resource_types",
    schema: resourceTypeSchema,
    name: "Resource Types",
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
