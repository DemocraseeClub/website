import {buildCollection, buildSchema} from "@camberi/firecms";

const resourceSchema = buildSchema({
  name: "Resource",
  properties: {
    author: {
      title: "User",
      dataType: "reference",
      validation: {required: true},
      collectionPath: "users",
      previewProperties: ["userName"]
    },
    title: {
      title: "Title",
      dataType: "string",
      validation: {
        required: true,
        trim: true,
      },
    },
    descriptionHTML: {
      title: "Description HTML",
      dataType: "string",
      validation: {
        required: false,
      },
      config: {
        multiline: true,
      },
    },
    image: {
      title: "Image",
      dataType: "string",
      validation: { required: true },
      config: {
        storageMeta: {
          mediaType: "image",
          storagePath: "resource_image",
          acceptedFiles: ["image/*"],
        },
      },
    },
    postalAddress: {
      title: "Postal Address",
      dataType: "string",
    },
    price: {
      title: "Price",
      dataType: "map",
      validation: {required: false},
      properties: {
        price: {
          title: "Price",
          dataType: "string",
        },
        rate: {
          title: "Rate",
          dataType: "string" // per what
        },
        currency: {
          title: "Currency",
          dataType: "string",
          config: {
            enumValues: {
              citizencoin: "CitizenCoin",
              usd: "US Dollar",
              vef: "Venezuelan Bolívar"
            }
          }
        }
      },
    },
    resource_type: {
      title: "Resource Type",
      dataType: "reference",
      collectionPath: "resource_types",
      previewProperties: ["type"],
    },
    office_hours: {
      title: "Office Hours",
      dataType: "map",
      validation: {required: false},
      properties: {
        link: {
          title: "Link",
          dataType: "string",
          validation: {
            url: true,
          },
          config: {
            url: true,
          },
        },
        date_start: {
          title: "Date Start",
          dataType: "timestamp",
        },
        date_end: {
          title: "Date End",
          dataType: "timestamp",
        },
        recurring: {
          title: "Repeats",
          dataType: "string",
          config: {
            enumValues: {
              none: "Does not repeat",
              daily: "Daily",
              weekly: "Weekly on %dayofweek%",
              monthly: "Monthly on %weekofmonth%",
              weekdays: "Every weekday (monday to friday)"
            }
          }
        }
      },
    }
  },
});


resourceSchema.onPreSave = ({ values }) => {

  if (!values.created) values.created = new Date().getTime() / 1000;
  values.modified = new Date().getTime() / 1000;

  return values;
};

export default (userDB) => {

  return buildCollection({
     relativePath: "resources",
     schema: resourceSchema,
     name: "Resources",
     pagination: true,
     permissions: async ({ user, entity }) => {

       if(userDB?.admin) {
         return {edit: true, create: true, delete: true};
       } else {
         return {edit: false, create: false, delete: false};
       }


     },
   })
 }
