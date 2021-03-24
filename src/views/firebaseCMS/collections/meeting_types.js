import { buildCollection, buildSchema } from "@camberi/firecms";

const meetingTypeSchema = buildSchema({
  name: "Meeting Type",
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


export default (userDB) => {
  return buildCollection({
    relativePath: "meeting_types",
    schema: meetingTypeSchema,
    name: "Meeting Types",
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
