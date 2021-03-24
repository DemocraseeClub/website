import { buildCollection, buildSchema } from "@camberi/firecms";

import CustomPhoneField from "../customTextFields/CustomPhoneField";

const officialSchema = buildSchema({
  name: "Official",
  properties: {
    jobTitle: {
      title: "Job Title",
      validation: { required: true },
      dataType: "string",
    },
    officePhone: {
      title: "Office Phone",
      dataType: "string",
      config: {
        field: CustomPhoneField,
      },
    },
    officeEmail: {
      title: "Office Email",
      dataType: "string",
      validation: {
        trim: true,
        email: true,
      },
    },
    social_links: {
      title: "Social Media Links",
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
    party_affiliation: {
      title: "Party",
      dataType: "reference",
      collectionPath: "parties",
      previewProperties: ["name", "logo"],
    },
    city: {
      title: "City",
      dataType: "reference",
      collectionPath: "cities",
      previewProperties: ["name", "picture"]
    }
  },
});


export default (userDB) => {
  return buildCollection({
    relativePath: "officials",
    schema: officialSchema,
    name: "Officials",
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