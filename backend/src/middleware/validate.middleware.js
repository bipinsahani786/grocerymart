import { ZodError } from "zod";

export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body || {},
      query: req.query || {},
      params: req.params || {},
    });
    
    // Safely assign validated body reference directly
    req.body = parsed.body;
    
    // Use Object.assign to update query and params references avoiding prototype getter assignment exceptions
    if (req.query) Object.assign(req.query, parsed.query);
    if (req.params) Object.assign(req.params, parsed.params);
    
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const formattedErrors = err.issues.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      }));
      return res.status(400).json({
        status: "error",
        message: formattedErrors[0]?.message || "Validation failed",
        errors: formattedErrors,
      });
    }
    return res.status(400).json({
      status: "error",
      message: err.message || "Validation error",
    });
  }
};
