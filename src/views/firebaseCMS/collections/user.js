import { buildCollection, buildSchema } from "@camberi/firecms";

import CustomPasswordField from "../customTextFields/CustomPasswordField";

const userSchema = buildSchema({
  name: "User",
  properties: {
    email: {
      title: "Email",
      dataType: "string",
      validation: {
        required: true,
        trim: true,
        email: true,
      },
    },
    userName: {
      title: "Username",
      dataType: "string",
      validation: {
        required: true,
        trim: true,
      },
    },
    realName: {
      title: "Real Name",
      dataType: "string",
      validation: {
        trim: true,
      },
    },
    website: {
      title: "Website",
      dataType: "array",
      of: {
        dataType: "string",
        validation: {
          url: true,
        },
        config: {
          url: true,
        },
      },
    },
    bio: {
      title: "Bio",
      dataType: "string",
      config: {
        multiline: true,
      },
    },
    picture: {
      title: "Picture",
      dataType: "string",
      config: {
        storageMeta: {
          mediaType: "image",
          storagePath: "pictures",
          acceptedFiles: ["image/*"],
        },
      },
    },
    coverPhoto: {
      title: "Cover Photo",
      dataType: "string",
      config: {
        storageMeta: {
          mediaType: "image",
          storagePath: "cover_photos",
          acceptedFiles: ["image/*"],
        },
      },
    },
    password: {
      title: "Password",
      dataType: "string",
      validation: {
        required: true,
        trim: true,
      },
      config: {
        field: CustomPasswordField,
      },
    },
    topic_def_json: {
      title: "Topic Definitions JSON",
      dataType: "string",
      config: {
        storageMeta: {
          mediaType: "json",
          storagePath: "topic_def_json",
          acceptedFiles: ["application/json"]
        }
      }
    },
    resources: {
      title: "Resources",
      dataType: "array",
      of: {
        dataType: "reference",
        collectionPath: "resources",
        previewProperties: ["title", "image"],
      },
    },
  },
});

export default buildCollection({
  relativePath: "users",
  schema: userSchema,
  name: "Users",
});
