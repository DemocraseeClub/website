import { buildCollection, buildSchema } from "@camberi/firecms";

import CustomPasswordField from "../customTextFields/CustomPasswordField";
import CustomPhoneField from "../customTextFields/CustomPhoneField";


const userSchema = buildSchema({
  name: "User",
  properties: {
    email: {
      title: "Email",
      dataType: "string",
      validation: {
        required: true,
        email: true,
      },
    },
    phone: {
      title: "phone",
      dataType: "string",
      config: {
        field: CustomPhoneField,
      },
    },
    userName: {
      title: "Username",
      dataType: "string",
      validation: {
        required: true,
      },
    },
    realName: {
      title: "Real Name",
      dataType: "string",
      validation: {
      },
    },
    website: {
      title: "Website",
      dataType: "string",
      validation: {
        url: true,
      },
      config: {
        url: true,
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
      config: {multiline: true},
      validation: {}
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
    admin: {
      title: "Admin",
      dataType: "boolean",

    }
  },
});

userSchema.onPreSave =  ({values}) => {
  if (values.topic_def_json?.trim()) {
      const value = JSON.parse(values.topic_def_json.trim());

      if (!value)
        throw new Error("This value (Topic Definitions JSON) must be a valid JSON");

      if (typeof value !== "object")
        throw new Error("This value (Topic Definitions JSON) must be a valid JSON");
  }

  console.log("values", values);

  if(values?.uids) {

    if(values.admin) {

      values.uids.forEach(async (uid) => {
        window.fireDB.collection('roles').doc(uid).update({
          role: "ROLE_ADMIN"
        });
      })

    } else {

      values.uids.forEach(async (uid) => {
        window.fireDB.collection('roles').doc(uid).update({
          role: "ROLE_USER"
        })
      })
    }

  }

  return values;
};

export default buildCollection({
  relativePath: "users",
  schema: userSchema,
  name: "Users",
  pagination: true
});
