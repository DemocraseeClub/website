import {buildCollection, buildSchema} from "@camberi/firecms";

const meetingTypeSchema = buildSchema({
  name: "Meeting Type",
  properties: {
    type: {
      title: "Type",
      dataType: "string",
      validation: {
        required: true,
        trim: true,
      },
    },
  },
});

export default buildCollection({
  relativePath: "meeting_types",
  schema: meetingTypeSchema,
  name: "Meeting Types",
  pagination: true
});
