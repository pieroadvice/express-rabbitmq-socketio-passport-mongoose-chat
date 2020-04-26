'use strict';


exports.ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    console.log('req.user', req.user);
    console.log('is authenticated');
    res.locals.user = req.user.username || null;
    return next();
  } else {
    console.log('not authenticated');
  }
  req.flash('error', 'authentication failure, please login again.');
  res.redirect('login');
};

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (error, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = error.message;
  res.locals.error = req.app.get('env') === 'development' ? error : {};

  // render the error page
  res.status(error.status || 500);
  res.render('500');
};

// goes last!!
exports.notFoundHandler = (req, res) => {
  res.status(400);
  res.render('404', { title: '404: File Not Found' });
};
