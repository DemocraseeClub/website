import {buildCollection, buildSchema} from "@camberi/firecms";

const inviteSchema = buildSchema({
  name: "Invite",
  properties: {
     meeting: {
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
            rsvpd: "RSVPd",
            attending: "Attending",
            attended: "Attended",
        }
      }
     }
  },
});


inviteSchema.onPreSave = ({ values }) => {

    if (!values.created) values.created = new Date().getTime() / 1000;
    values.modified = new Date().getTime() / 1000;

    return values;
};


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
