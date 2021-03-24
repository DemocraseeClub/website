import { buildCollection, buildSchema } from "@camberi/firecms";

const meetingSchema = buildSchema({
  name: "Meeting",
  properties: {
    title: {
      title: "Title",
      dataType: "string",
      validation: { required: true },
    },
    city: {
      title: "City",
      dataType: "reference",
      collectionPath: "cities",
      previewProperties: ["name", "picture"],
      validation: { required: true },
    },
    meeting_type: {
      title: "Meeting Type",
      dataType: "reference",
      collectionPath: "meeting_types",
      previewProperties: ["type"],
      validation: { required: true },
    },
    speakers: {
      title: "Speakers",
      dataType: "array",
      validation: {
        required: true,
        max: 7,
      },
      of: {
        dataType: "reference",
        collectionPath: "users",
        previewProperties: ["userName"],
      },
    },
    moderators: {
      title: "Moderators",
      dataType: "array",
      validation: {
        validation: true,
        max: 2,
      },
      of: {
        dataType: "reference",
        collectionPath: "users",
        previewProperties: ["userName"],
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
    postal_address: {
      title: "Postal Address",
      dataType: "string",
    },
    meeting_link: {
      title: "Meeting Link",
      dataType: "string",
      validation: {
        required: true,
        url: true,
      },
      config: {
        url: true,
      },
    },
    start_end_times: {
      title: "Date & Time Start - End",
      dataType: "map",
      validation: {
        required: true,
      },
      properties: {
        date_start: {
          title: "Date Start",
          dataType: "timestamp",
        },
        date_end: {
          title: "Date End",
          dataType: "timestamp",
        },
      },
    },
    agenda: {
      title: "Agenda JSON",
      dataType: "string",
    },
    duration: {
      title: "Duration",
      dataType: "number",
    },
    recording: {
      title: "Recording",
      dataType: "string",
      config: {
        storageMeta: {
          mediaType: "video",
          storagePath: "meeting_recording",
          acceptedFiles: ["video/*"],
        },
      },
    },
  },
});

meetingSchema.onPreSave = ({values}) => {
  if (values.agenda.trim()) {
      const value = JSON.parse(values.agenda.trim());

      if (!value) 
        throw new Error("This value (Agenda JSON) must be a valid JSON");

      if (typeof value !== "object") 
        throw new Error("This value (Agenda JSON) must be a valid JSON");
  }

  return values;
};

export default (userDB) => {
  return buildCollection({
    relativePath: "meetings",
    schema: meetingSchema,
    name: "Meetings",
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
