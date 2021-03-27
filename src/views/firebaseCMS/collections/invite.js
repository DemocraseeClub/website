import { buildCollection, buildSchema } from "@camberi/firecms";

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

export default buildCollection({
  relativePath: "invites",
  schema: inviteSchema,
  name: "Invites",
  pagination: true
});
