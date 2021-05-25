import {buildCollection, buildSchema} from "@camberi/firecms";

// import CustomPasswordField from "../customTextFields/CustomPasswordField";
import CustomPhoneField from "../customTextFields/CustomPhoneField";
import {rallySchema} from "./rally";

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
      validation: {},
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

userSchema.onPreSave = ({ values }) => {
  if (values.topic_def_json?.trim()) {
    const value = JSON.parse(values.topic_def_json.trim());

      if (!value)
        throw new Error("This value (Topic Definitions JSON) must be a valid JSON");

      if (typeof value !== "object")
        throw new Error("This value (Topic Definitions JSON) must be a valid JSON");
  }

  if (!values.created) values.created = new Date().getTime() / 1000;
  values.modified = new Date().getTime() / 1000;

  return values;
};

export default (userDB) => {
  return buildCollection({
    relativePath: "users",
    schema: userSchema,
    name: "Users",
    permissions: ({ user, entity }) => {
      if (userDB?.admin) {
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
