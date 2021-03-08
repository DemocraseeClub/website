import { buildCollection, buildSchema } from "@camberi/firecms";

const pageSchema = buildSchema({
  name: "Page",
  properties: {
    title: {
      title: "Title",
      dataType: "string",
      validation: {required: true}
    },
    descriptionHTML: {
      title: "Description HTML",
      dataType: "string",
      validation: {required: true},
      config: {
        storageMeta: {
          mediaType: "json",
          storagePath: "page_descriptionHTML",
          acceptedFiles: ["text/html"],
        },
      },
    }
  },
});

export default buildCollection({
  relativePath: "pages",
  schema: pageSchema,
  name: "Pages",
});
