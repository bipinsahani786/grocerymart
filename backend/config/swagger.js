import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Parking Lot Super-Admin API",
      version: "1.0.0",
      description: "Production-ready Modular REST API documentation using Swagger and Zod Validation",
    },
    servers: [
      {
        url: "/",
        description: "Auto-detected Server Host",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/**/*.routes.js", "./src/admin/**/*.routes.js"],
};

export const swaggerSpec = swaggerJSDoc(options);
