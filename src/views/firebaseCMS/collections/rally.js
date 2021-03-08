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

export default buildCollection({
  relativePath: "rallies",
  schema: rallySchema,
  name: "Rallies",
});
