import {buildCollection, buildSchema} from "@camberi/firecms";

const citySchema = buildSchema({
  name: "City",
  properties: {
    name: {
      title: "Name",
      dataType: "string",
      validation: { required: true },
    },
    description: {
      title: "Description",
      dataType: "string",
      config: {
        multiline: true,
      },
    },
    postal_address: {
      title: "Postal Address",
      dataType: "string",
    },
    picture: {
      title: "Picture",
      dataType: "string",
      config: {
        storageMeta: {
          mediaType: "image",
          storagePath: "city_picture",
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
          storagePath: "city_cover_photo",
          acceptedFiles: ["image/*"],
        },
      },
    },
    sponsors: {
      title: "Sponsors",
      dataType: "array",
      of: {
        dataType: "reference",
        collectionPath: "users",
        previewProperties: ["userName"],
      },
    },
    website: {
      title: "Website",
      dataType: "array",
      validation: {
        max: 3,
      },
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
    population: {
      title: "Population",
      dataType: "number",
      validation: {
        positive: true,
      },
    },
    altitude: {
      title: "Altitude",
      dataType: "number",
      validation: {
        positive: true,
      },
    },
    county: {
      title: "County",
      dataType: "string",
    },
    state: {
      title: "State",
      dataType: "reference",
      collectionPath: "states",
      previewProperties: ["name", "icon"],
    },
    officials: {
      title: "Officials",
      dataType: "array",
      of: {
        dataType: "reference",
        collectionPath: "users",
        previewProperties: ["userName"],
      },
    },
    landArea: {
      title: "Land Area",
      dataType: "number",
      validation: {
        positive: true,
      },
    },
    waterArea: {
      title: "Water Area",
      dataType: "number",
      validation: {
        positive: true,
      },
    },
    totalArea: {
      title: "Total Area",
      dataType: "number",
      validation: {
        positive: true,
      },
    },
    density: {
      title: "Density",
      dataType: "number",
      validation: {
        positive: true,
      },
    },
    timezone: {
      title: "Timezone",
      dataType: "string",
    },
  },
});


export default (userDB) => {
  return buildCollection({
    relativePath: "cities",
    schema: citySchema,
    name: "Cities",
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