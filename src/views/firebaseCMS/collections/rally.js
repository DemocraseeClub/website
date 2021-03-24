import { buildCollection, buildSchema } from "@camberi/firecms";

const rallySchema = buildSchema({
  name: "Rally",
  properties: {
    title: {
      title: "Title",
      dataType: "string",
      validation: { required: true },
    },
    description: {
      title: "Description",
      dataType: "string",
      validation: { required: true },
      config: {
        multiline: true,
      },
    },
    summary: {
      title: "Summary",
      dataType: "string",
    },
    picture: {
      title: "Picture",
      dataType: "string",
      config: {
        storageMeta: {
          mediaType: "image",
          storagePath: "rally_picture",
          acceptedFiles: ["image/*"],
        },
      },
    },
    topics: {
      title: "Topics",
      dataType: "array",
      validation: {
        required: true,
        max: 3,
      },

      of: {
        dataType: "reference",
        collectionPath: "topics",
        previewProperties: ["name"],
      },
    },
    meetings: {
      title: "Meetings",
      dataType: "array",
      of: {
        dataType: "reference",
        collectionPath: "meetings",
        previewProperties: ["title"],
      },
    },
    stakeholders: {
      title: "Stakeholders",
      dataType: "array",
      of: {
        dataType: "reference",
        collectionPath: "stakeholders",
        previewProperties: ["name"]
      }
    },
    research: {
      title: "Research JSON",
      dataType: "string",
      config: {
        storageMeta: {
          mediaType: "json",
          storagePath: "meeting_research",
          acceptedFiles: ["application/json"],
        },
      },
    }
  },
});

rallySchema.onPreSave = ({values}) => {
  if (values.research.trim()) {
      const value = JSON.parse(values.research.trim());

      if (!value) 
        throw new Error("This value (Research JSON) must be a valid JSON");

      if (typeof value !== "object") 
        throw new Error("This value (Research JSON) must be a valid JSON");
  }

  return values;
};


export default (userDB) => {
  return buildCollection({
    relativePath: "rallies",
    schema: rallySchema,
    name: "Rallies",
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