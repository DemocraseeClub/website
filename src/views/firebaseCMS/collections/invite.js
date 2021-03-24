import { buildCollection, buildSchema } from "@camberi/firecms";

const inviteSchema = buildSchema({
  name: "Invite",
  properties: {
     metting: {
       title: "Meeting",
       dataType: "reference",
       validation: {required: true},
       collectionPath: "meetings",
       previewProperties: ["title"]
     },
     user: {
       title: "User",
       dataType: "reference",
       validation: {required: true},
       collectionPath: "users",
       previewProperties: ["userName"],
     },
     invitedBy: {
       title: "Invited By",
       dataType: "reference",
       validation: {required: true},
       collectionPath: "users",
       previewProperties: ["userName"]
     },
     status: {
       title: "Status",
       dataType: "string",
       config: {
        enumValues: {
            invited: "Invited",
            rsvpd: "Rsvpd",
            attending: "Attending",
            attended: "Attended",
        }
      }
     }
  },
});


export default (userDB) => {
  return buildCollection({
    relativePath: "invites",
    schema: inviteSchema,
    name: "Invites",
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
