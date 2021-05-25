import {buildCollection, buildSchema} from "@camberi/firecms";

const subscriptionSchema = buildSchema({
  name: "Subscription",
  properties: {
      subscriber: {
          title: "Subscriber",
          dataType: "reference",
          validation: {required: true},
          collectionPath: "users",
          previewProperties: ["userName"],
      },
      rally: {
          title: "Rally",
          dataType: "reference",
          validation: {required: true},
          collectionPath: "rallies",
          previewProperties: ["title"]
      },
     meeting: {
       title: "Meeting",
       dataType: "reference",
       validation: {required: true},
       collectionPath: "meetings",
       previewProperties: ["title"]
     },
     status: {
       title: "Status",
       dataType: "string",
       config: {
        enumValues: {
            approved: "Approved", // for "apply to speak"
            denied: "Denied",
            active: "active", // for rally/meeting "subscriptions" - notifications
            inactive: "inactive",
        }
      }
     }
  },
});


subscriptionSchema.onPreSave = ({ values }) => {

    if (!values.created) values.created = new Date().getTime() / 1000;
    values.modified = new Date().getTime() / 1000;

    return values;
};


export default (userDB, fbUser) => {
  return buildCollection({
    relativePath: "subscriptions",
    schema: subscriptionSchema,
    name: "subscriptions",
    pagination: true,
     permissions: ({ user, entity }) => {
       console.log("SUBSCRIPTION", fbUser)
       if(fbUser && fbUser.roles && fbUser.roles.indexOf('admin') > -1) {
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
