export const responseHelper = {
  success: (res, data = {}, message = 'Success', status = 200) => {
    return res.status(status).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  },

  error: (res, message = 'Internal Server Error', status = 500, details = null) => {
    return res.status(status).json({
      success: false,
      error: {
        message,
        status,
        details
      },
      timestamp: new Date().toISOString()
    });
  }
};
