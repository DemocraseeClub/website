import React from "react";

import {
  Authenticator,
  buildCollection,
  buildSchema,
  buildProperty,
  CMSApp,
  EntityCollection,
  buildAdditionalColumnDelegate,
} from "@camberi/firecms";
import firebase from "firebase/app";
import "typeface-rubik";

import "../theme/FirebaseCMS.css";

// Replace with your config
const firebaseConfig = {
  apiKey: "AIzaSyBXelhalX-QVA2V9DImADLkGo9GdjAsLEY",
  authDomain: "firecms-test.firebaseapp.com",
  projectId: "firecms-test",
  storageBucket: "firecms-test.appspot.com",
  messagingSenderId: "720140535017",
  appId: "1:720140535017:web:2f7550d8c2bb37a0095c78",
};

const locales = {
  "de-DE": "German",
  "en-US": "English (United States)",
  "es-ES": "Spanish (Spain)",
  "es-419": "Spanish (South America)",
};

const userSchema = buildSchema({
  name: "User",
  properties: {
    email: {
      title: "Email",
      dataType: "string",
      validation: {
        required: true,
        trim: true,
        email: true
      },
    },
    userName: {
      title: "Username",
      dataType: "string",
      validation: {
        required: true,
        trim: true,
      },
    },
    realName: {
      title: "Real Name",
      dataType: "string",
      validation: {
        trim: true,
      },
    },
    website: {
        title: "Website",
        dataType: "string",
          validation: {
            url: true,
          },
          config: {
            url: true
          },
    },
    bio: {
        title: "Bio",
        dataType: "string",
        config: {
            multiline: true
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
    password: {
      title: "Password",
      dataType: "string",
      validation: {
        required: true,
        trim: true,
      },
    },
    resource_types: {
      title: "Resource",
      dataType: "string"
    }


  },
});

const resourceSchema = buildSchema({

      name: "Resource",
      properties: {
        title: {
          title: "Title",
          dataType: "string",
          validation: {
            required: true,
            trim: true
          }
        },
        descriptionHTML: {
          title: "Description HTML",
          dataType: "string",
          validation: {
            required: true
          },
          config: {
            multiline: true
          },
        },
        image: {
          title: "Image",
          dataType: "string",
          validation: {required: true},
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
        price_ccoin: {
          title: "Price (citizencoin)",
          dataType: "number",
          validation: {
            required: true,
            positive: true
          }
        },
       resource_type: {
          title: "Resource Type",
          dataType: "string",
          validation: {required: true},
          config: {
            enumValues: {
              consulting: "Consulting",
              sales: "Sales",
              labor: "Labor"
            },
       }
      }

      },
     
      




})


const productSchema = buildSchema({
  name: "Product",
  properties: {
    name: {
      title: "Name",
      validation: { required: true },
      dataType: "string",
    },
    price: {
      title: "Price",
      validation: {
        required: true,
        requiredMessage: "You must set a price between 0 and 1000",
        min: 0,
        max: 1000,
      },
      description: "Price with range validation",
      dataType: "number",
    },
    status: {
      title: "Status",
      validation: { required: true },
      dataType: "string",
      description: "Should this product be visible in the website",
      longDescription:
        "Example of a long description hidden under a tooltip. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis bibendum turpis. Sed scelerisque ligula nec nisi pellentesque, eget viverra lorem facilisis. Praesent a lectus ac ipsum tincidunt posuere vitae non risus. In eu feugiat massa. Sed eu est non velit facilisis facilisis vitae eget ante. Nunc ut malesuada erat. Nullam sagittis bibendum porta. Maecenas vitae interdum sapien, ut aliquet risus. Donec aliquet, turpis finibus aliquet bibendum, tellus dui porttitor quam, quis pellentesque tellus libero non urna. Vestibulum maximus pharetra congue. Suspendisse aliquam congue quam, sed bibendum turpis. Aliquam eu enim ligula. Nam vel magna ut urna cursus sagittis. Suspendisse a nisi ac justo ornare tempor vel eu eros.",
      config: {
        enumValues: {
          private: "Private",
          public: "Public",
        },
      },
    },
    published: ({ values }) =>
      buildProperty({
        title: "Published",
        dataType: "boolean",
        columnWidth: 100,
        disabled:
          values.status === "public"
            ? false
            : {
                clearOnDisabled: true,
                disabledMessage:
                  "Status must be public in order to enable the published flag",
              },
      }),
    main_image: buildProperty({
      title: "Image",
      dataType: "string",
      config: {
        storageMeta: {
          mediaType: "image",
          storagePath: "images",
          acceptedFiles: ["image/*"],
        },
      },
    }),
    tags: {
      title: "Tags",
      description: "Example of generic array",
      validation: { required: true },
      dataType: "array",
      of: {
        dataType: "string",
      },
    },
    description: {
      title: "Description",
      description: "Not mandatory but it'd be awesome if you filled this up",
      longDescription:
        "Example of a long description hidden under a tooltip. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis bibendum turpis. Sed scelerisque ligula nec nisi pellentesque, eget viverra lorem facilisis. Praesent a lectus ac ipsum tincidunt posuere vitae non risus. In eu feugiat massa. Sed eu est non velit facilisis facilisis vitae eget ante. Nunc ut malesuada erat. Nullam sagittis bibendum porta. Maecenas vitae interdum sapien, ut aliquet risus. Donec aliquet, turpis finibus aliquet bibendum, tellus dui porttitor quam, quis pellentesque tellus libero non urna. Vestibulum maximus pharetra congue. Suspendisse aliquam congue quam, sed bibendum turpis. Aliquam eu enim ligula. Nam vel magna ut urna cursus sagittis. Suspendisse a nisi ac justo ornare tempor vel eu eros.",
      dataType: "string",
      columnWidth: 300,
    },
    categories: {
      title: "Categories",
      validation: { required: true },
      dataType: "array",
      of: {
        dataType: "string",
        config: {
          enumValues: {
            electronics: "Electronics",
            books: "Books",
            furniture: "Furniture",
            clothing: "Clothing",
            food: "Food",
          },
        },
      },
    },
    publisher: {
      title: "Publisher",
      description: "This is an example of a map property",
      dataType: "map",
      properties: {
        name: {
          title: "Name",
          dataType: "string",
        },
        external_id: {
          title: "External id",
          dataType: "string",
        },
      },
    },
    expires_on: {
      title: "Expires on",
      dataType: "timestamp",
    },
  },
});

const localeSchema = buildSchema({
  customId: locales,
  name: "Locale",
  properties: {
    title: {
      title: "Title",
      validation: { required: true },
      dataType: "string",
    },
    selectable: {
      title: "Selectable",
      description: "Is this locale selectable",
      dataType: "boolean",
    },
    video: {
      title: "Video",
      dataType: "string",
      validation: { required: false },
      config: {
        storageMeta: {
          mediaType: "video",
          storagePath: "videos",
          acceptedFiles: ["video/*"],
        },
      },
    },
  },
});

export function FirebaseCMS() {
  const navigation: EntityCollection[] = [
    buildCollection({
      relativePath: "products",
      schema: productSchema,
      name: "Products",
      subcollections: [
        buildCollection({
          name: "Locales",
          relativePath: "locales",
          schema: localeSchema,
        }),
      ],
    }),
    buildCollection({
      relativePath: "users",
      schema: userSchema,
      name: "Users",
      //TODO estudiar el uso de additional COlumns
      additionalColumns: [ ]
      
    }),
    
  ];

  const myAuthenticator: Authenticator = (user?: firebase.User) => {
    console.log("Allowing access to", user?.email);
    return true;
  };

  return (
    <div className="cms-container">
      <CMSApp
        name={"Democraseeclub"}
        authentication={myAuthenticator}
        navigation={navigation}
        firebaseConfig={firebaseConfig}
        primaryColor={"#000000"}
      />
    </div>
  );
}

export default FirebaseCMS;
