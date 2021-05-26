import {buildCollection, buildSchema} from "@camberi/firecms";

const topicSchema = buildSchema({
  name: "Topic",
  properties: {
    name: {
      title: "Name",
      dataType: "string",
      validation: {required: true}
    },
    icon: {
      title: "Icon",
      dataType: "string",
      config: {
        storageMeta: {
          mediaType: "image",
          storagePath: "topic_icon",
          acceptedFiles: ["image/*"],
        },
      },
    },
    photo: {
      title: "Photo",
      dataType: "string",
      config: {
        storageMeta: {
          mediaType: "image",
          storagePath: "topic_photo",
          acceptedFiles: ["image/*"],
        },
      },
    },
  },
});



export default (userDB, fbUser) => {

  return buildCollection({
    relativePath: "topics",
    schema: topicSchema,
    name: "Topics",
    pagination: true,
    permissions: ({ user, entity }) => {
      if(fbUser && fbUser.roles && fbUser.roles.includes('editor')) {
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
