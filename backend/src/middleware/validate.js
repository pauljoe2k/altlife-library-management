const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true, // Remove keys that are not defined in the schema
    });

    if (error) {
      const details = error.details.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return res.status(400).json({
        status: "fail",
        error: "Validation Error",
        message: "Invalid input data provided",
        details,
      });
    }

    // Replace req.body with the sanitized and validated value
    req.body = value;
    next();
  };
};

module.exports = validate;
