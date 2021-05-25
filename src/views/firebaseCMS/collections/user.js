import {buildCollection, buildSchema} from "@camberi/firecms";

// import CustomPasswordField from "../customTextFields/CustomPasswordField";
import CustomPhoneField from "../customTextFields/CustomPhoneField";

const userSchema = buildSchema({
  name: "User",
  properties: {
    email: { /* prepopulated with provider data */
      title: "Email",
      dataType: "string",
      validation: {
        required: true,
        email: true,
      },
    },
    phoneNumber: { /* prepopulated with provider data */
      title: "phone",
      dataType: "string",
      config: {
        field: CustomPhoneField,
      },
    },
    displayName: { /* prepopulated with provider data */
      title: "Display name",
      dataType: "string",
      validation: {
        required: true,
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
    roles: {
      title: "Roles",
      validation: { required: false },
      dataType: "array",
      disabled:true,
      of: {
        dataType: "string",
        config: {
          enumValues: {
            admin: "Admin",
            board: "Board Member",
            dev:"Dev Team",
            editor:"Editorial Team"
          }
        }
      }
    }
  }
});

/*
userSchema.onPreSave = ({ values }) => {
  if (values.topic_def_json?.trim()) {
    const value = JSON.parse(values.topic_def_json.trim());

      if (!value)
        throw new Error("This value (Topic Definitions JSON) must be a valid JSON");

      if (typeof value !== "object")
        throw new Error("This value (Topic Definitions JSON) must be a valid JSON");
  }

  return values;
};
 */

export default (userDB, fbUser) => {
  return buildCollection({
    relativePath: "users",
    schema: userSchema,
    name: "Users",
    permissions: ({ user, entity }) => {
      if(fbUser?.roles.includes('admin')) {
        return {
          edit: true,
          create: true,
          delete: true,
        };
      } else {
        return {
          edit: true,
          create: true,
          delete: false,
        };
      }
    },
  });
};
